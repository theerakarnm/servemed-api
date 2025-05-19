import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { auth } from '../utils/auth';
import * as service from '../services';

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
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  const body = await c.req.json<{ amount: number }>();
  if (!body.amount) {
    throw new HTTPException(400, { message: 'Amount is required' });
  }
  const checkout = await service.checkoutService.createCheckout(user.id, body.amount);
  return c.json({ data: checkout });
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