import { Request, Router, Response } from "express";

const dbRouter = Router()

// Routes
dbRouter.get('/create-user', async (_req: Request, res: Response) => {
    try {
        1
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error)})
    }
})

export default dbRouter