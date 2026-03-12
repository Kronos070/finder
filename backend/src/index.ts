import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import router from './routes/router';

const app = new Hono().basePath('/api');

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

const routes = app
  .route('/', router);

export type AppType = typeof routes;

export default app;