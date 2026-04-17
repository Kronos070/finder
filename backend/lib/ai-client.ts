import axios from "axios";

export const aiClient = axios.create({
    baseURL: process.env.AI_SIDECAR_URL || "http://localhost:8000",
    timeout: 60_000,
});

export type AnalyzeResult = {
    summary: string;
    tags: string[];
};

export async function analyze(text: string): Promise<AnalyzeResult> {
    if (!process.env.AI_SIDECAR_URL) {
        return { summary: "", tags: [] };
    }
    const { data } = await aiClient.post<AnalyzeResult>("/analyze", { text });
    return data;
}
