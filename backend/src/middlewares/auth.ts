import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { AuthService } from '../services/auth.service';

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.json({ error: 'Уебывай, ты не авторизован' }, 401);
  }

  const payload = await AuthService.verifyToken(token);

  if (!payload) {
    return c.json({ error: 'Токен протух или подделан' }, 401);
  }

  c.set('jwtPayload', payload);
  
  await next();
};