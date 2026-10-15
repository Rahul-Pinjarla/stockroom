import { afterAll } from 'vitest';
import { pool } from '../src/db';

afterAll(async () => {
  await pool.end();
});
