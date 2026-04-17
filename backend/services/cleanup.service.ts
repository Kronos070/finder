import { and, inArray, lt, notInArray } from "drizzle-orm";
import { db } from "../db";
import { files } from "../db/schema";
import { storageService } from "./storage.service";
import { redis } from "../lib/redis";

const GRACE_MS = 60 * 60 * 1000;
const TREE_KEY = "folders:tree";

class CleanupService {
    async cleanOrphanS3(): Promise<number> {
        const s3Keys = await storageService.getFileNames();
        if (s3Keys.length === 0) return 0;

        const rows = await db
            .select({ s3Key: files.s3Key })
            .from(files)
            .where(inArray(files.s3Key, s3Keys));

        const knownKeys = new Set(rows.map((r) => r.s3Key));
        const orphans = s3Keys.filter((k) => !knownKeys.has(k));

        if (orphans.length === 0) return 0;

        await storageService.deleteMany(orphans);
        return orphans.length;
    }

    async cleanStaleUploads(): Promise<number> {
        const threshold = new Date(Date.now() - GRACE_MS);

        const stale = await db
            .select({ id: files.id, s3Key: files.s3Key })
            .from(files)
            .where(
                and(
                    lt(files.createdAt, threshold),
                    notInArray(files.status, ["done", "failed"]),
                ),
            );

        if (stale.length === 0) return 0;

        await storageService.deleteMany(stale.map((f) => f.s3Key));
        await db.delete(files).where(
            inArray(
                files.id,
                stale.map((f) => f.id),
            ),
        );
        await redis.del(TREE_KEY);
        return stale.length;
    }

    async runAll(): Promise<{ orphans: number; stale: number }> {
        const [stale, orphans] = [
            await this.cleanStaleUploads(),
            await this.cleanOrphanS3(),
        ];
        return { orphans, stale };
    }
}

export const cleanupService = new CleanupService();
