import { db } from '../db';
import { checkouts, configTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function createConfiguration(data: typeof configTable.$inferInsert) {
  await db
    .insert(configTable)
    .values(data)
}
