import { db } from '../db';
import { checkouts, configTable } from '../db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function createConfiguration(data: typeof configTable.$inferInsert) {
  await db
    .insert(configTable)
    .values(data)
}

export async function getConfiguration(key: string) {
  const [config] = await db.select().from(configTable).where(and(eq(configTable.key, key), isNull(configTable.deletedAt))).limit(1)

  if (!config) {
    throw new Error(`Configuration with key "${key}" not found`);
  }

  return config;
}