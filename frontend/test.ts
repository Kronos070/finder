import { hc } from 'hono/client';
hc('http://localhost:3000', { fetch: (input: any, init: any) => fetch(input, { ...init, credentials: 'include' }) });
