import { Hono } from "hono";
import auth from "./auth";
import { authMiddleware } from "../middlewares/auth";

const router = new Hono()
    .route('/login', auth)

    .use('/*', authMiddleware) // Всё, что идет ниже этого мидлвара, будет защищено
    .get('/profile', (c) => c.json({ name: "admin" }))

export default router