import { db } from '../db';
import { addresses } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import type { AddressInput } from './orders';

export type { AddressInput } from './orders';

export async function getUserAddresses(userId: string) {
  return db.select().from(addresses).where(eq(addresses.userId, userId));
}

export async function getAddress(id: number, userId: string) {
  const [row] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function createAddress(userId: string, data: AddressInput) {
  const [row] = await db
    .insert(addresses)
    .values({
      userId,
      streetLine1: data.streetLine1,
      streetLine2: data.streetLine2,
      city: data.city,
      stateOrProvince: data.stateOrProvince,
      postalCode: data.postalCode,
      country: data.country,
    })
    .returning();
  return row;
}

export async function updateAddress(
  id: number,
  userId: string,
  data: AddressInput,
) {
  const [row] = await db
    .update(addresses)
    .set({
      streetLine1: data.streetLine1,
      streetLine2: data.streetLine2,
      city: data.city,
      stateOrProvince: data.stateOrProvince,
      postalCode: data.postalCode,
      country: data.country,
      updatedAt: new Date(),
    })
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteAddress(id: number, userId: string) {
  const [row] = await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning();
  return row ?? null;
}
