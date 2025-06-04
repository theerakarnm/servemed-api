import { db } from '../db';
import { addresses, orders, orderItems, payments } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AddressInput {
  isDefault: boolean
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  id: string
}


export interface OrderItemInput {
  productId: number
  variantId: number
  name: string
  brandName: string
  packageDescription: string
  price: number
  quantity: number
  imageUrl: string
}

export async function createAddress(userId: string | null, address: AddressInput) {
  console.log({
    userId: userId ?? null,
    firstName: address.firstName,
    lastName: address.lastName,
    streetLine1: address.address,
    streetLine2: null,
    city: address.city,
    stateOrProvince: address.state,
    postalCode: address.postalCode,
    phone: address.phone,
    country: address.country,
  });

  const [row] = await db
    .insert(addresses)
    .values({
      userId: userId ?? null,
      firstName: address.firstName,
      lastName: address.lastName,
      streetLine1: address.address,
      streetLine2: null,
      city: address.city,
      stateOrProvince: address.state,
      postalCode: address.postalCode,
      phone: address.phone,
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
  paymentMethod?: 'thai_qr' | 'credit_card' | 'bank_transfer';
  paymentSlip: string;
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
    phone: shipAddr.phone,
    firstName: shipAddr.firstName,
    lastName: shipAddr.lastName,
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
        phone: billAddr.phone,
        firstName: billAddr.firstName,
        lastName: billAddr.lastName,
      };
    }
  }

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId || `guest-${shipAddr.firstName}-${Date.now()}`,
      totalAmount: params.totalAmount.toString(),
      shippingAddressId: params.shippingAddressId,
      billingAddressId,
      shippingAddress: shippingData,
      billingAddress: billingData,
      notes: params.notes,
      paymentMethod: params.paymentMethod || 'thai_qr',
      paymentSlip: params.paymentSlip,
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

  await db.insert(payments).values({
    orderId: order.id,
    amount: order.totalAmount,
    currency: order.currency,
    method: order.paymentMethod || params.paymentMethod || 'thai_qr',
    transactionId: `txn-${order.id}${Date.now()}`,
  });

  return order;
}
