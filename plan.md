# Описание проекта

Сервис для хранения файлов с ИИ-обработкой и умным поиском. Состоит из бэкенда и фронтенда.

**Роли пользователей:**
- **Админ** — добавляет юзеров и загружает файлы (в том числе папками).
- **Юзер** — ищет нужные файлы и скачивает их.

**Как работает обработка файлов:**
После загрузки файл асинхронно обрабатывается в фоне: извлекается текст, локальная ИИ-модель генерирует краткое содержание и тэги, результат сохраняется в БД. Админ видит прогресс по этапам (файл получен → текст извлечён → ИИ обработала → сохранено).

**Поиск для юзеров:**
Единый поиск по названию, описанию и тэгам: нечёткий (опечатки) + морфология русского языка. Совпадение в названии файла ранжируется выше, чем в описании или тэгах.

**Особенности:**
- ИИ работает локально, без внешних API
- Рассчитано на слабый сервер, поэтому ИИ-часть вынесена в отдельный сервис и использует специализированную русскую модель для суммаризации (вместо универсального LLM)

---

# План проекта

## 1. Финальный стек

### Node (основной API + воркер)
```
express              # уже есть
drizzle-orm + pg     # уже есть
bullmq + ioredis     # новое — очереди
axios                # уже есть, для вызова Python
zod                  # валидация
multer               # загрузка файлов
pdf-parse / mammoth  # извлечение текста (PDF/DOCX)
```

### Python (sidecar для ИИ)
```
fastapi
uvicorn
transformers
torch (CPU-only)
pydantic
```

### Инфраструктура
```
Postgres       # с расширениями pg_trgm + встроенный russian FTS
Redis          # для BullMQ
Docker Compose # оркестрация
```

### Убирается
- Ollama (заменяем на Python sidecar)
- qwen2.5:1.5b (заменяем на `d0rj/rut5-base-summ` или аналог)

---

## 2. Итоговая архитектура

```
┌───────────────────────────────────────────────────────────┐
│                     docker-compose                         │
│                                                            │
│   ┌──────────┐         ┌──────────┐                       │
│   │ Client   │────────►│  Node    │                       │
│   │ (React)  │◄────────│  API     │                       │
│   └──────────┘         │  :3002   │                       │
│                        └────┬─────┘                       │
│                             │                             │
│                             ▼                             │
│        ┌────────────┐  ┌─────────┐  ┌────────────┐       │
│        │ Postgres   │  │ Redis   │  │  S3        │       │
│        │ + pg_trgm  │  │ (BullMQ)│  │ (файлы)    │       │
│        │ + tsvector │  └────┬────┘  └────────────┘       │
│        └──────▲─────┘       │                            │
│               │             ▼                            │
│               │      ┌──────────────┐                    │
│               └──────│ Node Worker  │                    │
│                      │ (BullMQ)     │                    │
│                      │ concurrency:1│                    │
│                      └──────┬───────┘                    │
│                             │ HTTP                       │
│                             ▼                            │
│                      ┌──────────────┐                    │
│                      │ Python AI    │                    │
│                      │ sidecar      │                    │
│                      │ :8000        │                    │
│                      │ rut5-summ    │                    │
│                      └──────────────┘                    │
└───────────────────────────────────────────────────────────┘
```

**Поток обработки файла:**
1. `POST /files` → Node API сохраняет файл в S3, создаёт запись в БД (`status: 'pending'`), кладёт job в BullMQ, возвращает `{ jobId, fileId }`
2. Worker берёт job → скачивает из S3 → извлекает текст → зовёт Python → получает `{ summary, tags }` → пишет в БД (`status: 'done'`)
3. На каждом шаге `job.updateProgress({ stage })` — клиент видит через `GET /jobs/:id`
4. `GET /files/search?q=...` → чистый SQL, без ИИ

---

## 3. Структура Node-проекта

```
backend-storage-db-llm/
├── index.ts                    # API entry point
├── worker.ts                   # Worker entry point (новое)
├── db/
│   ├── index.ts
│   └── schema.ts               # + search_vector, + status enum
├── drizzle/
├── lib/                        # новое
│   ├── redis.ts                # singleton connection
│   ├── ai-client.ts            # axios instance для Python sidecar
│   └── text-extract.ts         # PDF/DOCX → text
├── queues/                     # новое
│   ├── file-processing.queue.ts
│   └── types.ts                # JobData, JobResult, ProgressStage
├── workers/                    # новое
│   └── file-processing.worker.ts
├── routes/
│   ├── router.ts
│   ├── files.ts                # загрузка + поиск
│   ├── jobs.ts                 # статус job (новое)
│   └── users.ts
├── services/
│   ├── files.service.ts        # CRUD + поиск
│   └── ai.service.ts           # обёртка над ai-client
├── schemas/                    # новое, Zod-схемы
│   ├── file.schema.ts
│   └── job.schema.ts
├── middlewares/
└── types/
```

### Структура Python-сайдкара

```
ai-sidecar/
├── app/
│   ├── main.py                 # FastAPI app + роуты
│   ├── models/
│   │   ├── summarizer.py       # rut5-base-summ
│   │   └── tagger.py           # извлечение тэгов
│   ├── schemas.py              # Pydantic request/response
│   └── config.py               # env
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## 4. Схема БД (обновление)

```ts
// db/schema.ts (Drizzle)

export const processingStatus = pgEnum('processing_status', [
  'pending',       // в очереди
  'extracting',    // извлекаем текст
  'summarizing',   // ИИ работает
  'saving',        // запись в БД
  'done',
  'failed'
])

export const files = pgTable('files', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull().references(() => users.id),
  filename: text().notNull(),
  s3Key: text().notNull(),
  mimeType: text(),
  sizeBytes: bigint(),

  // ИИ-поля
  extractedText: text(),
  summary: text(),
  tags: text().array().default(sql`'{}'::text[]`),

  // статус обработки
  status: processingStatus().default('pending').notNull(),
  errorMessage: text(),

  // поиск — GENERATED колонка
  searchVector: ...tsvector... GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(filename,'')),    'A') ||
    setweight(to_tsvector('russian', coalesce(summary,'')),     'B') ||
    setweight(to_tsvector('russian', array_to_string(tags,' ')),'C')
  ) STORED,

  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow()
})
```

### Индексы

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX files_search_idx    ON files USING gin(search_vector);
CREATE INDEX files_filename_trgm ON files USING gin(filename gin_trgm_ops);
CREATE INDEX files_tags_idx      ON files USING gin(tags);
CREATE INDEX files_status_idx    ON files(status);
CREATE INDEX files_user_idx      ON files(user_id, created_at DESC);
```

---

## 5. API-контракт

### Node → клиент

```
POST   /api/files                   загрузить файл (multipart)
                                    → { fileId, jobId }

GET    /api/files                   список с пагинацией + фильтрами
GET    /api/files/:id               один файл
DELETE /api/files/:id

GET    /api/files/search?q=         единый поиск (fuzzy + FTS по
       &page=&limit=                filename + summary + tags; weights: A>B>C)

GET    /api/jobs/:id                статус обработки
                                    → { status, progress: { stage, message }, result? }
```

### Node worker → Python sidecar

```
POST /summarize       { text, maxLength? }  → { summary }
POST /tags            { text, count? }      → { tags: string[] }
POST /analyze         { text }              → { summary, tags }   # батч
GET  /health                                → { status, models: {...} }
```

Использовать `/analyze` — один round-trip вместо двух.

---

## 6. Поэтапный план реализации

### Фаза 0 — подготовка (0.5 дня)
- [ ] Docker Compose с Postgres + Redis
- [ ] `.env.example` со всеми переменными
- [ ] Добавить `pg_trgm` в миграцию
- [ ] Удалить всё, что связано с Ollama (`services/ollama.service.ts`, `routes/ollama.ts`, `types/ollama.ts`)

### Фаза 1 — схема БД и поиск (1 день)
- [ ] Обновить `db/schema.ts`: статус, summary, tags, search_vector
- [ ] Миграция с pg_trgm + индексами
- [ ] `services/files.service.ts` — метод `search(query, pagination)` (единый запрос: FTS + trigram)
- [ ] `routes/files.ts` — `GET /search`
- [ ] **Тестируется руками:** руками положить фейковые записи → искать

### Фаза 2 — загрузка файлов + очередь (1-2 дня)
- [ ] `lib/redis.ts` + фабрики `queue.factory.ts`, `worker.factory.ts`
- [ ] `queues/file-processing.queue.ts` с типизированным `JobData`
- [ ] `POST /files` — принимает файл, грузит в S3, создаёт job
- [ ] `GET /jobs/:id` — статус
- [ ] Заглушка воркера: принимает job, просто логирует и ставит `done` через 2 сек
- [ ] Скрипт `worker` в `package.json`
- [ ] **Тестируется:** загрузить файл → увидеть jobId → пропинговать статус

### Фаза 3 — извлечение текста (0.5 дня)
- [ ] `lib/text-extract.ts` — PDF через `pdf-parse`, DOCX через `mammoth`, TXT напрямую
- [ ] Воркер: скачивает из S3 → извлекает → пишет в `extractedText` → `updateProgress({ stage: 'extracting' })`
- [ ] Без ИИ ещё — просто довести пайплайн до БД

### Фаза 4 — Python sidecar (1-2 дня)
- [ ] Создать `ai-sidecar/` с FastAPI + rut5
- [ ] `POST /summarize` + `POST /analyze` + `/health`
- [ ] Dockerfile (CPU torch, ~600MB образ)
- [ ] Добавить сервис `ai` в docker-compose
- [ ] `lib/ai-client.ts` в Node
- [ ] Интегрировать в воркер: после извлечения зовёт `/analyze` → пишет summary+tags в БД
- [ ] **Тестируется:** загрузить PDF → через 10-30 сек увидеть summary+tags → поиск работает

### Фаза 5 — полировка (1 день)
- [ ] Retry-логика BullMQ (3 попытки с exponential backoff)
- [ ] `removeOnComplete: { age: 3600 }`, `removeOnFail: { age: 86400 }`
- [ ] Graceful shutdown воркера (SIGTERM → `worker.close()`)
- [ ] Ошибки: если Python упал или текст пустой — `status: 'failed'` с понятным сообщением
- [ ] Health endpoints на Node API (`GET /health` проверяет Redis + Python)
- [ ] Idempotency: `jobId = fileId`, повторная загрузка того же файла не дублирует работу

### Фаза 6 — опционально (потом)
- [ ] BullBoard — UI для мониторинга очередей (http://localhost:3003)
- [ ] Rate limit на `POST /files` (чтоб не закидали очередь)
- [ ] Метрики: среднее время обработки, failure rate
- [ ] Если качество summary плохое — заменить rut5 на другую модель, менять только Python

---

## 7. Ключевые решения

| Решение | Обоснование |
|---|---|
| BullMQ + Redis | Индустриальный стандарт для Node-очередей |
| `concurrency: 1` в воркере | rut5 на CPU не параллелится с пользой, защита RAM |
| Отдельный процесс воркера | Тяжёлые задачи не должны тормозить HTTP API |
| Python sidecar вместо Ollama | rut5-base-summ специализированная → лучше качество + меньше RAM |
| Node worker → Python по HTTP | Простой контракт, возможность вынести Python на отдельный хост |
| pg_trgm + tsvector, не pgvector | RAG избыточен для filename+summary+tags, нулевая нагрузка на ИИ |
| GENERATED search_vector | Автообновление, нельзя забыть пересчитать |
| Polling `/jobs/:id`, не WebSocket | Проще, хватает для задач >5 сек, без нового протокола |
| `jobId = fileId` | Идемпотентность из коробки |
| Docker Compose | Изоляция, простая настройка лимитов памяти, переносимость |

---


## 9. Ресурсы под сервер (4GB RAM)

| Сервис | RAM |
|---|---|
| Postgres | 300-500 MB |
| Redis | 50-100 MB |
| Node API + Worker | 200-400 MB |
| Python sidecar (rut5-base) | 900 MB-1.2 GB |
| Система | 500 MB |
| **Итого** | **~2.5-3 GB** |

На 4GB — влезет с запасом. На 2GB — не влезет, придётся выносить sidecar на другой VPS или отказаться от локального ИИ.

---

## 10. С чего начать

Логичный первый шаг — **Фаза 0 + 1** (БД и поиск):
- Не зависит от очередей и ИИ
- Можно наполнить руками данными и сразу проверить поиск
- Это фундамент — всё остальное пишет в эту схему
- Результат за 1 день

После — переход к очередям (Фаза 2).
