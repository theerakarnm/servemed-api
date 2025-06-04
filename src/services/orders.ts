import { db } from '../db';
import { addresses, orders, orderItems } from '../db/schema';

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
  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId ? Number(params.userId) : 0,
      totalAmount: params.totalAmount.toString(),
      shippingAddressId: params.shippingAddressId,
      billingAddressId: params.billingAddressId ?? params.shippingAddressId,
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
