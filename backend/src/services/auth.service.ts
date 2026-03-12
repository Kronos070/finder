import { sign, verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const AuthService = {
  async login(email: string, password: string) {
    // В будущем тут будет: const user = await db.user.findFirst(...)
    if (email !== 'admin@office.com' || password !== 'admin123') return { error: 'Неверные учетные данные' }
      
    const payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const token = await sign(payload, JWT_SECRET);
    return { token };
  },

  async verifyToken(token: string) {
    try {
      return await verify(token, JWT_SECRET, 'HS256');
    } catch {
      return null;
    }
  }
};