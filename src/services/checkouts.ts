import { db } from '../db';
import { checkouts } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function createCheckout(userId: string, amount: number) {
  const [checkout] = await db
    .insert(checkouts)
    .values({ amount: amount.toString(), userId })
    .returning();
  return checkout;
}

export async function changeCheckoutStatus(id: number, status: "pending" | "success" | "failed" | "cancel" | "pending_verify") {
  const [checkout] = await db
    .update(checkouts)
    .set({ status, updatedAt: new Date() })
    .where(eq(checkouts.checkoutId, id))
    .returning();
  return checkout;
}