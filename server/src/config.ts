export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://stockroom:stockroom@localhost:5433/stockroom',
  storeTimezone: process.env.STORE_TIMEZONE ?? 'America/New_York',
  lowStockThreshold: 5,
};
