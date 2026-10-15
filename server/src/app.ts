import Fastify from 'fastify';
import { ZodError } from 'zod';
import { HttpError } from './errors';
import { dashboardRoutes } from './routes/dashboard';
import { orderRoutes } from './routes/orders';
import { productRoutes } from './routes/products';

export function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Invalid request', details: error.issues });
    }
    if (error instanceof HttpError) {
      return reply.status(error.status).send({ error: error.message });
    }
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  });

  app.get('/api/health', async () => ({ ok: true }));
  app.register(productRoutes, { prefix: '/api/products' });
  app.register(orderRoutes, { prefix: '/api/orders' });
  app.register(dashboardRoutes, { prefix: '/api/dashboard' });

  return app;
}
