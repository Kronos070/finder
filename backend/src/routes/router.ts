import { Hono } from "hono";
import auth from "./auth";
import { authMiddleware } from "../middlewares/auth";
import { deleteCookie } from "hono/cookie";
import files from "./files";

const router = new Hono()
    .route('/login', auth)

    .post('/logout', (c) => {
        deleteCookie(c, 'auth_token')
        return c.json({ success: true })
    })

    .use('/*', authMiddleware) // Всё, что идет ниже этого мидлвара, будет защищено
    .get('/profile', (c) => c.json({ name: "admin" }))
    .route("/files", files)

export default router