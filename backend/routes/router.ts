import { Router } from "express";
import storageRouter from "./storage";
import ollamaRouter from "./ollama";
import dbRouter from "./db";
import userSRouter from "./users";
import authenticationMiddleware from "../middlewares/authentication";
import jobsRouter from "./jobs";
import filesRouter from "./files";
import foldersRouter from "./folders";
import adminRouter from "./admin";

const router = Router()

// Routers
router.use('/storage', authenticationMiddleware,  storageRouter)
router.use('/ollama', authenticationMiddleware,  ollamaRouter)
router.use('/db', authenticationMiddleware, dbRouter)
router.use('/users', userSRouter)
router.use('/jobs', authenticationMiddleware,  jobsRouter)
router.use('/files', authenticationMiddleware, filesRouter)
router.use('/folders', authenticationMiddleware, foldersRouter)
router.use('/admin', authenticationMiddleware, adminRouter)

export default router