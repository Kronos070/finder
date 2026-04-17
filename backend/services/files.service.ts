import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { files } from "../db/schema";
import { redis } from "../lib/redis";
import { cached } from "../lib/cache";
import { ConflictError, NotFoundError, isUniqueViolation } from "../lib/errors";
import { sanitizeFilename } from "../lib/sanitize-filename";
import { fileProcessingQueue } from "../queues/file-processing.queue";
import { storageService } from "./storage.service";

const TREE_KEY = "folders:tree";
const fileKey = (id: string) => `files:${id}`;

type NewFile = typeof files.$inferInsert;
type File = typeof files.$inferSelect;

class FilesService {
    async getById(id: string): Promise<File | null> {
        return cached(fileKey(id), 300, async () => {
            const [row] = await db.select().from(files).where(eq(files.id, id));
            return row ?? null;
        });
    }

    async upload(
        rawFilename: string,
        parentId: string | null,
        body: Buffer,
        mimeType?: string,
    ): Promise<{ fileId: string; jobId: string }> {
        const filename = sanitizeFilename(rawFilename);
        const id = randomUUID();
        const s3Key = `${id}/${filename}`;

        const insert: NewFile = {
            id,
            filename,
            s3Key,
            parentId,
            status: "pending",
        };

        try {
            await db.insert(files).values(insert);
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw new ConflictError(
                    `Файл "${filename}" уже существует в этой папке`,
                );
            }
            throw err;
        }

        try {
            await storageService.put(s3Key, body, mimeType);
        } catch (err) {
            await db.delete(files).where(eq(files.id, id));
            throw err;
        }

        await fileProcessingQueue.add(
            "process",
            { fileId: id, s3Key, filename },
            { jobId: id },
        );

        await redis.del(TREE_KEY);
        return { fileId: id, jobId: id };
    }

    async remove(id: string): Promise<void> {
        const file = await this.getById(id);
        if (!file) throw new NotFoundError("Файл не найден");

        await storageService.delete(file.s3Key);
        await db.delete(files).where(eq(files.id, id));
        await redis.del(TREE_KEY, fileKey(id));
    }

    async getDownloadUrl(id: string): Promise<string> {
        const file = await this.getById(id);
        if (!file) throw new NotFoundError("Файл не найден");
        return storageService.getDownloadUrl(file.s3Key, 300);
    }
}

export const filesService = new FilesService();
