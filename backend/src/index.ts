import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import router from './routes/router';

const app = new Hono().basePath('/api');

app.use('*', logger());
app.use('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
}));

const routes = app
  .route('/', router);

export type AppType = typeof routes;

export default app;