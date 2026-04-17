import { Router, Request, Response, NextFunction } from "express";
import { filesService } from "../services/files.service";
import { upload } from "../lib/upload";
import { uploadFileSchema } from "../zod/files";

const filesRouter = Router();

filesRouter.post(
    "/",
    upload.single("file"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                res.status(400).json({ error: "Файл не загружен" });
                return;
            }
            const { parentId } = uploadFileSchema.parse(req.body);
            const result = await filesService.upload(
                req.file.originalname,
                parentId ?? null,
                req.file.buffer,
                req.file.mimetype,
            );
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },
);

filesRouter.get(
    "/:id/download",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const url = await filesService.getDownloadUrl(req.params.id);
            res.json({ url });
        } catch (err) {
            next(err);
        }
    },
);

filesRouter.delete(
    "/:id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await filesService.remove(req.params.id);
            res.status(204).end();
        } catch (err) {
            next(err);
        }
    },
);

export default filesRouter;
