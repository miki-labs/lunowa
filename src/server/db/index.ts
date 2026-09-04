import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';

import * as databaseSchema from './schema';

const globalDatabase = globalThis as typeof globalThis & {
  lunowaPool?: Pool;
  lunowaDatabase?: ReturnType<typeof drizzle<typeof databaseSchema>>;
};

function requiredEnvironment(name: 'DATABASE_URL'): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Lunowa application requests.`);
  return value;
}

export function getDatabasePool(): Pool {
  if (!globalDatabase.lunowaPool) {
    globalDatabase.lunowaPool = new Pool({
      connectionString: requiredEnvironment('DATABASE_URL'),
      max: 10,
      application_name: 'lunowa-application'
    });
  }
  return globalDatabase.lunowaPool;
}

export function getDatabase() {
  if (!globalDatabase.lunowaDatabase) {
    globalDatabase.lunowaDatabase = drizzle(getDatabasePool(), {schema: databaseSchema});
  }
  return globalDatabase.lunowaDatabase;
}
