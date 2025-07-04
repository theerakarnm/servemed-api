import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { auth } from '../utils/auth';
import * as service from '../services';
import type { AddressInput, OrderItemInput } from '../services/orders';

const handler = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
  };
}>();

handler.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set('user', null);
    return next();
  }
  c.set('user', session.user);
  return next();
});

handler.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{
    amountObject: {
      shipping: number;
      subtotal: number;
      tax: number;
      total: number;
    },
    paymentMethod: 'thai_qr'
    items: OrderItemInput[];
    userAddressId?: number;
    address?: AddressInput;
    notes?: string;
    paymentSlip: string;
  }>();

  if (!body.amountObject || !body.amountObject.total) {
    throw new HTTPException(400, { message: 'Amount is required' });
  }
  if (!body.items || body.items.length === 0) {
    throw new HTTPException(400, { message: 'Items are required' });
  }

  let addressId: number | undefined = body.userAddressId;
  if (!addressId) {
    if (!body.address) {
      throw new HTTPException(400, { message: 'Address is required' });
    }
    console.log(body.address);

    const addr = await service.orderService.createAddress(user?.id ?? null, body.address);
    addressId = addr.id;
  }

  if (!addressId) {
    throw new HTTPException(400, { message: 'Address creation failed' });
  }

  const order = await service.orderService.createOrder({
    userId: user?.id ?? null,
    totalAmount: body.amountObject.total,
    paymentMethod: body.paymentMethod,
    shippingAddressId: addressId,
    billingAddressId: addressId,
    notes: body.notes,
    items: body.items,
    paymentSlip: body.paymentSlip,
  });

  return c.json({ data: order });
});

handler.post('/:id/verify', async (c) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Forbidden' });
  }
  const { id } = c.req.param();
  const checkout = await service.checkoutService.changeCheckoutStatus(Number.parseInt(id), 'success');
  if (!checkout) {
    throw new HTTPException(404, { message: 'Checkout not found' });
  }
  return c.json({ data: checkout });
});

export default handler;