import { db } from '../db';
import { addresses, orders, orderItems } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AddressInput {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
}

export interface OrderItemInput {
  productId: number;
  quantity: number;
  price: number;
}

export async function createAddress(userId: string | null, address: AddressInput) {
  const [row] = await db
    .insert(addresses)
    .values({
      userId: userId ?? null,
      streetLine1: address.streetLine1,
      streetLine2: address.streetLine2,
      city: address.city,
      stateOrProvince: address.stateOrProvince,
      postalCode: address.postalCode,
      country: address.country,
    })
    .returning();
  return row;
}

export async function createOrder(params: {
  userId: string | null;
  totalAmount: number;
  shippingAddressId: number;
  billingAddressId?: number;
  notes?: string;
  items: OrderItemInput[];
}) {
  const [shipAddr] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, params.shippingAddressId))
    .limit(1);

  if (!shipAddr) {
    throw new Error('Shipping address not found');
  }

  const shippingData = {
    streetLine1: shipAddr.streetLine1,
    streetLine2: shipAddr.streetLine2,
    city: shipAddr.city,
    stateOrProvince: shipAddr.stateOrProvince,
    postalCode: shipAddr.postalCode,
    country: shipAddr.country,
  };

  let billingData = shippingData;
  let billingAddressId = params.billingAddressId ?? params.shippingAddressId;

  if (
    params.billingAddressId &&
    params.billingAddressId !== params.shippingAddressId
  ) {
    const [billAddr] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, params.billingAddressId))
      .limit(1);

    if (billAddr) {
      billingData = {
        streetLine1: billAddr.streetLine1,
        streetLine2: billAddr.streetLine2,
        city: billAddr.city,
        stateOrProvince: billAddr.stateOrProvince,
        postalCode: billAddr.postalCode,
        country: billAddr.country,
      };
    }
  }

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId ? Number(params.userId) : 0,
      totalAmount: params.totalAmount.toString(),
      shippingAddressId: params.shippingAddressId,
      billingAddressId,
      shippingAddress: shippingData,
      billingAddress: billingData,
      notes: params.notes,
    })
    .returning();

  if (params.items.length > 0) {
    await db.insert(orderItems).values(
      params.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price.toString(),
      }))
    );
  }

  return order;
}
