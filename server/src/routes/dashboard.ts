import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getDashboard } from '../services/dashboard';

const dashboardQuery = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request) => {
    const { days } = dashboardQuery.parse(request.query);
    return getDashboard(days);
  });
};
