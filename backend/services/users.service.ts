import { db } from "../db"
import { eq } from "drizzle-orm"
import { users } from "../db/schema"
import { CredentialsDTO, UserDataDTO } from "../types/auth"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

class UsersService {
    async register(userData: UserDataDTO) {
        try {
            const { name, password, role } = userData

            const isExist = await db.select().from(users).where(eq(users.name, name))
            if (isExist.length !== 0) throw new Error("User already exists")

            const hashedPassword = await bcrypt.hash(password, 10)

            await db.insert(users).values({ name, password: hashedPassword, role })

            return { message: "User registered successfully" }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async authentication(credentials: CredentialsDTO) {
        try {
            const { name, password } = credentials

            const user = await db.select().from(users).where(eq(users.name, name))
            if (user.length === 0) throw new Error("User not found")

            const isMatch = await bcrypt.compare(password, user[0].password)
            if (!isMatch) throw new Error("Invalid password or username")

            const accessToken = jwt.sign(
                {id: user[0].id, name: user[0].name, role: user[0].role},
                process.env.JWT_SECRET!,
                { expiresIn: process.env.JWT_EXPIRES_IN! as string }
            ) as string

            const refreshToken = jwt.sign(
                {id: user[0].id, name: user[0].name, role: user[0].role},
                process.env.JWT_REFRESH_SECRET!,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN_MILISECONDS! as string }
            ) as string

            return { accessToken, refreshToken }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async me(id: string) {
        try {
            const user = await db.select().from(users).where(eq(users.id, Number(id)))
            if (user.length === 0) throw new Error("User not found")

            return user[0]
        } catch {
            throw new Error("Failed to fetch user data")
        }
    }

    async refresh(refreshToken: string) {
        try {
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!)

            const accessToken = jwt.sign(
                {id: (payload as any).id, name: (payload as any).name, role: (payload as any).role},
                process.env.JWT_SECRET!,
                { expiresIn: process.env.JWT_EXPIRES_IN! as string }
            ) as string

            return { accessToken }
        } catch {
            throw new Error("Failed to refresh access token")
        }
    }
}

export const usersService = new UsersService()