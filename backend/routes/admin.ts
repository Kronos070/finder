import { Router, Request, Response, NextFunction } from "express";
import { cleanupService } from "../services/cleanup.service";

const adminRouter = Router();

adminRouter.post(
    "/cleanup",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await cleanupService.runAll();
            res.json(result);
        } catch (err) {
            next(err);
        }
    },
);

export default adminRouter;
