# Python AI sidecar — план реализации

## 1. Стек

```
fastapi              # API
uvicorn              # ASGI-сервер
transformers         # загрузка модели
torch (CPU-only)     # бэкенд инференса
sentencepiece        # токенизатор T5
yake                 # извлечение ключевых фраз
pydantic             # схемы request/response
python-dotenv        # env
```

Модель: `d0rj/rut5-base-summ` (HuggingFace) — русскоязычная T5 для суммаризации.

**Без GPU.** `torch==2.x` + `--index-url https://download.pytorch.org/whl/cpu` в requirements. Устройство определяется при старте: если есть CUDA — использовать, иначе CPU. На таргет-железе будет CPU.

---

## 2. Структура проекта

```
sidecar/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app + маршруты
│   ├── config.py            # env, константы
│   ├── schemas.py           # Pydantic: AnalyzeRequest, AnalyzeResponse, ...
│   ├── summarizer.py        # обёртка над rut5 + чанкинг
│   └── tagger.py            # YAKE-обёртка
├── requirements.txt
└── .env.example
```

---

## 3. Параметры (фиксируем)

| Параметр | Значение | Почему |
|---|---|---|
| `SUMMARY_TARGET_CHARS` | 200 | Решение пользователя. Короткое саммари для поиска (tsvector B). |
| `TAGS_COUNT` | 5 | Решение пользователя. |
| `CHUNK_TOKENS` | 450 | rut5 лимит 512, оставляем запас на спецтокены. |
| `CHUNK_OVERLAP_TOKENS` | 50 | Чтобы не рвать смысл на границах. |
| `MAX_SUMMARY_TOKENS` | 120 | ~200–250 символов кириллицы. |
| `MIN_SUMMARY_TOKENS` | 40 | Нижняя граница, чтобы генерация не схлопывалась. |
| `YAKE_NGRAM_MAX` | 2 | Допускаем биграммы («договор поставки»). |
| `YAKE_DEDUP_LIM` | 0.7 | Отсев близких дубликатов. |
| `LANGUAGE` | `ru` | Жёстко русский. |

> **Замечание по качеству поиска:** 200 символов — короткое саммари. Если обнаружится, что FTS-релевантность слабая, это первый параметр для крутки; имеет смысл замерить после первых загрузок реальных `.docx` и поднять до 400–500 при необходимости. На бэке (tsvector с весами A>B>C) длина summary напрямую влияет на вес B.

---

## 4. Алгоритм суммаризации (чанкинг)

```
def summarize(text: str) -> str:
    tokens = tokenizer.encode(text)
    if len(tokens) <= CHUNK_TOKENS:
        return _generate(text, max_tokens=MAX_SUMMARY_TOKENS)

    chunks = split_with_overlap(tokens, CHUNK_TOKENS, CHUNK_OVERLAP_TOKENS)
    partial = [_generate(decode(c), max_tokens=MAX_SUMMARY_TOKENS) for c in chunks]
    joined = " ".join(partial)

    # ещё один проход — сжать конкатенацию саммари в финальное
    if tokenizer.encode(joined) > CHUNK_TOKENS:
        return summarize(joined)  # рекурсия, обычно 1–2 уровня максимум
    return _generate(joined, max_tokens=MAX_SUMMARY_TOKENS)

def _generate(text, max_tokens):
    # num_beams=4, no_repeat_ngram_size=3, early_stopping=True
    # post: обрезать до SUMMARY_TARGET_CHARS по ближайшей границе предложения
```

Рекурсивная иерархическая суммаризация — стандартный паттерн для документов, превышающих контекст модели. Для файла на 10 страниц это ~5–10 чанков, ~10–20 сек инференса на CPU.

---

## 5. Алгоритм тэгов (YAKE)

```python
kw = yake.KeywordExtractor(
    lan="ru",
    n=YAKE_NGRAM_MAX,
    dedupLim=YAKE_DEDUP_LIM,
    top=TAGS_COUNT,
)
keywords = kw.extract_keywords(text)
tags = [kw for kw, score in sorted(keywords, key=lambda x: x[1])]
```

YAKE даёт оценки (меньше = релевантнее), берём топ-5. Никакой модели, ~50ms даже на мегабайте текста.

Пост-обработка:
- lower-case
- убрать теги короче 3 символов
- убрать чистые числа

---

## 6. API

### `POST /analyze`
Основной endpoint — один round-trip для Node-воркера.

```json
Request:  { "text": "..." }
Response: { "summary": "...", "tags": ["...", "..."] }
```

### `POST /summarize`
```json
Request:  { "text": "...", "max_chars": 200 }
Response: { "summary": "..." }
```

### `POST /tags`
```json
Request:  { "text": "...", "count": 5 }
Response: { "tags": ["..."] }
```

### `GET /health`
```json
{
  "status": "ok",
  "model_loaded": true,
  "device": "cpu",
  "model_name": "d0rj/rut5-base-summ"
}
```

**Поведение на ошибках:** валидация входа — 422 (Pydantic автоматически). Пустой текст → 200 с `{ summary: "", tags: [] }` (не ошибка, воркер на бэке сам решает). Внутренняя ошибка инференса → 500 с сообщением.

---

## 7. Загрузка модели

- **При старте приложения** (FastAPI `lifespan`), не лениво. Первый запрос не должен ждать 15 секунд на загрузку весов.
- Веса кэшируются в `~/.cache/huggingface` (переменная `HF_HOME`). В Docker нужно будет примонтировать volume, чтобы не скачивать заново при каждом рестарте контейнера — это уже на этапе docker-compose.

---

## 8. Конфигурация (env)

```
PORT=8000
MODEL_NAME=d0rj/rut5-base-summ
HF_HOME=/app/.cache/huggingface
LOG_LEVEL=info
```

---

## 9. Ресурсы

| Ресурс | Оценка |
|---|---|
| RAM (модель + FastAPI) | 900 MB – 1.2 GB |
| Время инференса 1 чанк (CPU) | 1–3 сек |
| Время анализа документа 5–10 страниц | 10–30 сек |
| Холодный старт (первая загрузка весов) | 10–20 сек + скачивание ~900MB |

Совпадает с бюджетом из `plan.md` (раздел 9).

---

## 10. Шаги реализации

1. [ ] `requirements.txt` + установка в venv
2. [ ] `config.py` с env-переменными и константами
3. [ ] `schemas.py` с Pydantic-моделями
4. [ ] `summarizer.py`: загрузка модели при старте, функции `_generate`, `split_with_overlap`, `summarize`
5. [ ] `tagger.py`: YAKE-обёртка + пост-обработка
6. [ ] `main.py`: FastAPI с lifespan, 4 роута
7. [ ] Проверка руками: запустить `uvicorn app.main:app`, отправить реальный docx-текст через curl, проверить `/health`
8. [ ] Подключение к Node: выставить `AI_SIDECAR_URL=http://localhost:8000` в `.env` бэка — воркер автоматически начнёт вызывать `/analyze` вместо возврата пустого результата (см. [backend/lib/ai-client.ts](backend/lib/ai-client.ts))

Dockerfile и docker-compose — отдельный этап, когда весь пайплайн проверен локально.

---

## 11. Что остаётся открытым

- **Оценка качества summary** — проверяется только вручную на реальных документах. Если не устраивает — ручки: поднять `MAX_SUMMARY_TOKENS`, поменять `num_beams`, попробовать альтернативные модели (`IlyaGusev/rut5_base_sum_gazeta`).
- **Параллелизм** — сейчас один запрос за раз (в воркере `concurrency: 1`). Если понадобится батчить — FastAPI легко масштабируется, но на слабом CPU толку нет.
- **Мониторинг времени инференса** — добавить на этапе полировки (Фаза 5 из `plan.md`).
