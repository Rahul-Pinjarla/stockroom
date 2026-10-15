import { beforeEach, describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { createDiscountCode, createProduct, postOrder, resetDb } from './helpers';

describe('POST /api/orders', () => {
  beforeEach(resetDb);

  it('creates an order and decrements stock', async () => {
    const product = await createProduct({ price: 10, stock: 5 });

    const res = await postOrder({
      customerEmail: 'ava@example.com',
      items: [{ productId: product.id, quantity: 2 }],
    });

    expect(res.statusCode).toBe(201);
    const order = res.json();
    expect(order.total).toBe(20);
    expect(order.items).toHaveLength(1);

    const { rows } = await pool.query('SELECT stock FROM products WHERE id = $1', [product.id]);
    expect(rows[0].stock).toBe(3);
  });

  it('rejects an order when there is not enough stock', async () => {
    const product = await createProduct({ stock: 1 });

    const res = await postOrder({
      customerEmail: 'ava@example.com',
      items: [{ productId: product.id, quantity: 2 }],
    });

    expect(res.statusCode).toBe(409);
  });

  it('returns 404 for an unknown product', async () => {
    const res = await postOrder({
      customerEmail: 'ava@example.com',
      items: [{ productId: 999, quantity: 1 }],
    });

    expect(res.statusCode).toBe(404);
  });

  it('validates the request body', async () => {
    const res = await postOrder({ customerEmail: 'not-an-email', items: [] });
    expect(res.statusCode).toBe(400);
  });
});

describe('discount codes', () => {
  beforeEach(resetDb);

  it('applies a percentage discount', async () => {
    const product = await createProduct({ price: 25 });
    await createDiscountCode('TENOFF', 10);

    const res = await postOrder({
      customerEmail: 'ava@example.com',
      items: [{ productId: product.id, quantity: 2 }],
      discountCode: 'tenoff',
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ subtotal: 50, discountAmount: 5, total: 45, discountCode: 'TENOFF' });
  });

  it('accepts a single-use code on its first use', async () => {
    const product = await createProduct();
    await createDiscountCode('ONCE', 10, 1);

    const res = await postOrder({
      customerEmail: 'ava@example.com',
      items: [{ productId: product.id, quantity: 1 }],
      discountCode: 'ONCE',
    });

    expect(res.statusCode).toBe(201);
  });

  it('rejects an unknown code', async () => {
    const product = await createProduct();

    const res = await postOrder({
      customerEmail: 'ava@example.com',
      items: [{ productId: product.id, quantity: 1 }],
      discountCode: 'NOPE',
    });

    expect(res.statusCode).toBe(400);
  });
});
