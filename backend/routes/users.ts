import { Router, Request, Response } from "express";
import { usersService } from "../services/users.service";
import authenticationMiddleware from "../middlewares/authentication";

const userSRouter = Router()

// Routes
userSRouter.post('/authentication', async (_req: Request, res: Response) => {
    try {
        const credentials = _req.body

        const { accessToken, refreshToken } = await usersService.authentication(credentials)
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: Number(process.env.JWT_EXPIRES_IN_MILISECONDS!),
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: Number(process.env.JWT_REFRESH_EXPIRES_IN_MILISECONDS!),
        })

        res.status(200).json({ message: "User authenticated successfully" })
    } catch (error) {
        res.status(401).json({ error: error instanceof Error ? error.message : String(error) })
    }
})

userSRouter.post('/register', async (_req: Request, res: Response) => {
    try {
        const userData = _req.body

        await usersService.register(userData)

        res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : String(error) })
    }
})

userSRouter.post('/refresh', async (_req: Request, res: Response) => {
    try {
        const refreshToken = _req.cookies.refreshToken
        if (!refreshToken) return res.status(401).json({ message: "No refresh token" })

        const { accessToken } = await usersService.refresh(refreshToken)
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: Number(process.env.JWT_EXPIRES_IN_MILISECONDS!),
        })

        res.status(200).json({ message: "Token refreshed successfully" })
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : String(error) })
    }
})

userSRouter.get('/logout', async (_req: Request, res: Response) => {
    try {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        
        res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : String(error) })
    }
})

userSRouter.get('/me', authenticationMiddleware, async (_req: Request, res: Response) => {
    try {
        const user = await usersService.me(_req.user!.id)

        res.status(200).json({ user })
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : String(error) })
    }
})

export default userSRouter