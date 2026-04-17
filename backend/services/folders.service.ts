import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { files, folders } from "../db/schema";
import { cached } from "../lib/cache";
import { redis } from "../lib/redis";
import { ConflictError, NotFoundError, isUniqueViolation } from "../lib/errors";
import { storageService } from "./storage.service";

const TREE_KEY = "folders:tree";

type Folder = typeof folders.$inferSelect;
type File = typeof files.$inferSelect;

export type TreeFolder = {
    id: string | null;
    name: string;
    folders: TreeFolder[];
    files: Pick<File, "id" | "filename" | "status" | "summary" | "tags">[];
};

class FoldersService {
    async create(name: string, parentId: string | null): Promise<Folder> {
        try {
            const [row] = await db
                .insert(folders)
                .values({ name, parentId })
                .returning();
            await redis.del(TREE_KEY);
            return row;
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw new ConflictError(
                    `Папка "${name}" уже существует в этой директории`,
                );
            }
            throw err;
        }
    }

    async remove(id: string): Promise<void> {
        const allFolders = await db.select().from(folders);
        const ids = this.collectDescendantIds(id, allFolders);

        if (ids.length === 0) throw new NotFoundError("Папка не найдена");

        const filesToDelete = await db
            .select({ s3Key: files.s3Key })
            .from(files)
            .where(inArray(files.parentId, ids));

        await storageService.deleteMany(filesToDelete.map((f) => f.s3Key));
        await db.delete(folders).where(eq(folders.id, id));
        await redis.del(TREE_KEY);
    }

    async getTree(): Promise<TreeFolder> {
        return cached(TREE_KEY, 60, async () => {
            const [allFolders, allFiles] = await Promise.all([
                db.select().from(folders),
                db
                    .select({
                        id: files.id,
                        filename: files.filename,
                        status: files.status,
                        summary: files.summary,
                        tags: files.tags,
                        parentId: files.parentId,
                    })
                    .from(files),
            ]);

            return this.buildTree(allFolders, allFiles);
        });
    }

    private collectDescendantIds(
        rootId: string,
        all: Folder[],
    ): string[] {
        const byParent = new Map<string | null, Folder[]>();
        for (const f of all) {
            const key = f.parentId;
            if (!byParent.has(key)) byParent.set(key, []);
            byParent.get(key)!.push(f);
        }

        const result: string[] = [];
        const stack = [rootId];
        while (stack.length) {
            const id = stack.pop()!;
            result.push(id);
            for (const child of byParent.get(id) ?? []) {
                stack.push(child.id);
            }
        }
        return result;
    }

    private buildTree(
        allFolders: Folder[],
        allFiles: (Pick<
            File,
            "id" | "filename" | "status" | "summary" | "tags"
        > & { parentId: string | null })[],
    ): TreeFolder {
        const foldersByParent = new Map<string | null, Folder[]>();
        for (const f of allFolders) {
            const key = f.parentId;
            if (!foldersByParent.has(key)) foldersByParent.set(key, []);
            foldersByParent.get(key)!.push(f);
        }

        const filesByParent = new Map<string | null, typeof allFiles>();
        for (const f of allFiles) {
            const key = f.parentId;
            if (!filesByParent.has(key)) filesByParent.set(key, []);
            filesByParent.get(key)!.push(f);
        }

        const build = (id: string | null, name: string): TreeFolder => ({
            id,
            name,
            folders: (foldersByParent.get(id) ?? []).map((f) =>
                build(f.id, f.name),
            ),
            files: (filesByParent.get(id) ?? []).map(
                ({ parentId: _p, ...rest }) => rest,
            ),
        });

        return build(null, "root");
    }
}

export const foldersService = new FoldersService();
