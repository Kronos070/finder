import { Router, Request, Response } from "express"
import { storageService } from "../services/storage.service"

const storageRouter = Router()

// Routes
storageRouter.get('/files', async (_req: Request, res: Response) => {
    try {
        const files = await storageService.getFileNames()
        res.status(200).json({ files })
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) })
    }
})

export default storageRouter