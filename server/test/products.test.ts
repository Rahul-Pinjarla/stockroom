import { beforeEach, describe, expect, it } from 'vitest';
import { app, createProduct, resetDb } from './helpers';

describe('GET /api/products', () => {
  beforeEach(resetDb);

  it('paginates through the catalog with a cursor', async () => {
    await createProduct({ name: 'A', createdAt: new Date('2025-01-01T10:00:00Z') });
    await createProduct({ name: 'B', createdAt: new Date('2025-01-02T10:00:00Z') });
    await createProduct({ name: 'C', createdAt: new Date('2025-01-03T10:00:00Z') });

    const first = (await app.inject({ url: '/api/products?limit=2' })).json();
    expect(first.products.map((p: { name: string }) => p.name)).toEqual(['A', 'B']);
    expect(first.total).toBe(3);
    expect(first.nextCursor).not.toBeNull();

    const second = (
      await app.inject({ url: `/api/products?limit=2&cursor=${encodeURIComponent(first.nextCursor)}` })
    ).json();
    expect(second.products.map((p: { name: string }) => p.name)).toEqual(['C']);
    expect(second.nextCursor).toBeNull();
  });
});
