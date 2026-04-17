import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export default async function authenticationMiddleware(_req: Request, res: Response, next: NextFunction) {
    try {
        console.error(_req.cookies)
        const accessToken = _req.cookies.accessToken
        if (!accessToken) return res.status(401).json({ message: "No token12" })

        const payload = jwt.verify(accessToken, process.env.JWT_SECRET!)
        _req.user = payload as JwtPayload
        next()
    } catch {
        res.status(401).json({ message: "Invalid token" })
    }
}