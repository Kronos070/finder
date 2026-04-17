import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ConflictError, NotFoundError } from "../lib/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        res.status(400).json({ error: "Validation failed", issues: err.issues });
        return;
    }
    if (err instanceof ConflictError) {
        res.status(409).json({ error: err.message });
        return;
    }
    if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
    }
    console.error("[error]", err);
    res.status(500).json({
        error: err instanceof Error ? err.message : "Internal error",
    });
};
