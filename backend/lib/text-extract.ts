import mammoth from "mammoth";

export async function extractDocx(buffer: Buffer): Promise<string> {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
}

export function getFileKind(filename: string): "doc" | "docx" | "unknown" {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".docx")) return "docx";
    if (lower.endsWith(".doc")) return "doc";
    return "unknown";
}
