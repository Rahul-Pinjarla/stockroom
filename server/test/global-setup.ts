import { runMigrations } from '../src/migrations';

export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgres://stockroom:stockroom@localhost:5433/stockroom_test';
  await runMigrations(url, { reset: true });
}
