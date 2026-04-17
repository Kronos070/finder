const FORBIDDEN = /[\/\\\0\x00-\x1f\x7f]/g;
const MAX_LENGTH = 200;

export function sanitizeFilename(raw: string): string {
    const cleaned = raw
        .normalize("NFC")
        .replace(FORBIDDEN, "_")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleaned) throw new Error("Имя файла пустое после очистки");

    if (cleaned.length <= MAX_LENGTH) return cleaned;

    const dot = cleaned.lastIndexOf(".");
    if (dot <= 0) return cleaned.slice(0, MAX_LENGTH);

    const ext = cleaned.slice(dot);
    const base = cleaned.slice(0, dot);
    return base.slice(0, MAX_LENGTH - ext.length) + ext;
}
