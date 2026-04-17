import { eq } from "drizzle-orm";
import { createWorker } from "../lib/worker.factory";
import { db } from "../db";
import { files } from "../db/schema";
import { storageService } from "../services/storage.service";
import { extractDocx, getFileKind } from "../lib/text-extract";
import { analyze } from "../lib/ai-client";
import type {
    FileProcessingJobData,
    FileProcessingJobResult,
} from "../queues/file-processing.queue";

export const fileProcessingWorker = createWorker<
    FileProcessingJobData,
    FileProcessingJobResult
>("file-processing", async (job) => {
    const { fileId, s3Key, filename } = job.data;

    try {
        const kind = getFileKind(filename);

        if (kind === "doc") {
            await db
                .update(files)
                .set({ status: "done" })
                .where(eq(files.id, fileId));
            await job.updateProgress({ stage: "done" });
            return { summary: "", tags: [] };
        }

        await job.updateProgress({ stage: "extracting" });
        await db
            .update(files)
            .set({ status: "extracting" })
            .where(eq(files.id, fileId));

        const buffer = await storageService.get(s3Key);
        const text = kind === "docx" ? await extractDocx(buffer) : "";

        if (!text) {
            await db
                .update(files)
                .set({ status: "done" })
                .where(eq(files.id, fileId));
            await job.updateProgress({ stage: "done" });
            return { summary: "", tags: [] };
        }

        await job.updateProgress({ stage: "summarizing" });
        await db
            .update(files)
            .set({ status: "summarizing" })
            .where(eq(files.id, fileId));

        const { summary, tags } = await analyze(text);

        await job.updateProgress({ stage: "saving" });
        await db
            .update(files)
            .set({ status: "saving" })
            .where(eq(files.id, fileId));

        await db
            .update(files)
            .set({ summary, tags, status: "done" })
            .where(eq(files.id, fileId));

        await job.updateProgress({ stage: "done" });
        return { summary, tags };
    } catch (err) {
        await db
            .update(files)
            .set({ status: "failed" })
            .where(eq(files.id, fileId));
        throw err;
    }
});
