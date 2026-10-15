import { config } from '../config';
import { pool } from '../db';

export interface DailyRevenue {
  day: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
  aov: number;
}

export interface Dashboard {
  range: { days: number; since: string };
  kpis: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    lowStockProducts: number;
  };
  revenueByDay: DailyRevenue[];
  topProducts: { productId: number; name: string; units: number; revenue: number }[];
}

export async function getDashboard(days: number): Promise<Dashboard> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const { rows: daily } = await pool.query(
    `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
            SUM(total) AS revenue,
            COUNT(*)::int AS orders
       FROM orders
      WHERE status <> 'cancelled'
        AND created_at >= $1
      GROUP BY 1
      ORDER BY 1`,
    [since],
  );

  const revenueByDay: DailyRevenue[] = daily.map((row) => ({
    day: row.day,
    revenue: row.revenue,
    orders: row.orders,
    aov: row.revenue / row.orders,
  }));

  const revenue = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
  const orders = revenueByDay.reduce((sum, d) => sum + d.orders, 0);
  const averageOrderValue =
    revenueByDay.length === 0
      ? 0
      : revenueByDay.reduce((sum, d) => sum + d.aov, 0) / revenueByDay.length;

  const { rows: stockRows } = await pool.query(
    'SELECT count(*)::int AS count FROM products WHERE stock <= $1',
    [config.lowStockThreshold],
  );

  const { rows: top } = await pool.query(
    `SELECT p.id, p.name, SUM(oi.quantity)::int AS units, SUM(oi.line_total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
      WHERE o.status <> 'cancelled'
        AND o.created_at >= $1
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 5`,
    [since],
  );

  return {
    range: { days, since: since.toISOString() },
    kpis: {
      revenue,
      orders,
      averageOrderValue,
      lowStockProducts: stockRows[0].count,
    },
    revenueByDay,
    topProducts: top.map((row) => ({
      productId: row.id,
      name: row.name,
      units: row.units,
      revenue: row.revenue,
    })),
  };
}
