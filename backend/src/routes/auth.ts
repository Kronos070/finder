import { Hono } from "hono";
import { AuthService } from "../services/auth.service";
import { setCookie } from "hono/cookie";

const auth = new Hono()
    .post('/', async (c) => {
        const { email, password } = await c.req.json()

        const result = await AuthService.login(email, password)

        if (!result.token) return c.json({ error: result.error }, 401)

        setCookie(c, 'auth_token', result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        })

        return c.json({ success: true }, 200)
    })

export default auth