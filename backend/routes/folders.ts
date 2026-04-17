import { Router, Request, Response, NextFunction } from "express";
import { foldersService } from "../services/folders.service";
import { createFolderSchema } from "../zod/folders";

const foldersRouter = Router();

foldersRouter.get("/tree", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const tree = await foldersService.getTree();
        res.json(tree);
    } catch (err) {
        next(err);
    }
});

foldersRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, parentId } = createFolderSchema.parse(req.body);
        const folder = await foldersService.create(name, parentId ?? null);
        res.status(201).json(folder);
    } catch (err) {
        next(err);
    }
});

foldersRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await foldersService.remove(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

export default foldersRouter;
