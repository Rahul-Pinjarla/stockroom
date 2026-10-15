import { config } from '../src/config';
import { runMigrations } from '../src/migrations';

const ran = await runMigrations(config.databaseUrl);
console.log(ran.length ? `Applied: ${ran.join(', ')}` : 'Database is up to date.');
