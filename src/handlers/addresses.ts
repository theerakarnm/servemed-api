import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { auth } from '../utils/auth';
import * as service from '../services';
import type { AddressInput } from '../services/addresses';

const handler = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>();

handler.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  c.set('user', session.user);
  return next();
});

handler.get('/', async (c) => {
  const user = c.get('user');
  const list = await service.addressService.getUserAddresses(user.id);
  return c.json({ data: list });
});

handler.get('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const address = await service.addressService.getAddress(Number(id), user.id);
  if (!address) {
    throw new HTTPException(404, { message: 'Address not found' });
  }
  return c.json({ data: address });
});

handler.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<AddressInput>();
  const address = await service.addressService.createAddress(user.id, body);
  return c.json({ data: address });
});

handler.put('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json<AddressInput>();
  const address = await service.addressService.updateAddress(
    Number(id),
    user.id,
    body,
  );
  if (!address) {
    throw new HTTPException(404, { message: 'Address not found' });
  }
  return c.json({ data: address });
});

handler.delete('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const address = await service.addressService.deleteAddress(
    Number(id),
    user.id,
  );
  if (!address) {
    throw new HTTPException(404, { message: 'Address not found' });
  }
  return c.json({});
});

export default handler;
