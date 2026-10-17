import { beforeEach, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { getDashboard } from '../src/services/dashboard';
import { app, createOrderRow, createProduct, postOrder, resetDb } from './helpers';

describe('GET /api/dashboard', () => {
  beforeEach(resetDb);

  it('reports revenue, order count and AOV for paid orders', async () => {
    const product = await createProduct({ price: 20, stock: 100 });
    await postOrder({ customerEmail: 'a@example.com', items: [{ productId: product.id, quantity: 1 }] });
    await postOrder({ customerEmail: 'b@example.com', items: [{ productId: product.id, quantity: 2 }] });

    const res = await app.inject({ url: '/api/dashboard?days=7' });

    expect(res.statusCode).toBe(200);
    const { kpis, revenueByDay } = res.json();
    expect(kpis.revenue).toBe(60);
    expect(kpis.orders).toBe(2);
    expect(kpis.averageOrderValue).toBe(30);
    expect(revenueByDay).toHaveLength(1);
  });

  it('excludes cancelled orders', async () => {
    const product = await createProduct({ price: 20, stock: 100 });
    const res = await postOrder({ customerEmail: 'a@example.com', items: [{ productId: product.id, quantity: 1 }] });
    await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [res.json().id]);

    const { kpis } = (await app.inject({ url: '/api/dashboard?days=7' })).json();

    expect(kpis.revenue).toBe(0);
    expect(kpis.orders).toBe(0);
  });

  it('counts low-stock products', async () => {
    await createProduct({ stock: 2 });
    await createProduct({ stock: 50 });

    const { kpis } = (await app.inject({ url: '/api/dashboard' })).json();

    expect(kpis.lowStockProducts).toBe(1);
  });

  it('weights average order value by orders, not by days', async () => {
    const day = 24 * 60 * 60 * 1000;
    await createOrderRow(100, new Date(Date.now() - 2 * day));
    for (let i = 0; i < 3; i++) await createOrderRow(10, new Date(Date.now() - day));

    const { kpis } = await getDashboard(7);

    expect(kpis.averageOrderValue).toBe(32.5);
  });

  it('reports zero average order value with no orders', async () => {
    const { kpis } = await getDashboard(7);
    expect(kpis.averageOrderValue).toBe(0);
  });
});
