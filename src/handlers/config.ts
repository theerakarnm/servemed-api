import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { auth } from '../utils/auth';
import * as service from '../services';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const handler = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
  };
}>();

// handler.use('*', async (c, next) => {
//   const session = await auth.api.getSession({ headers: c.req.raw.headers });
//   if (!session) {
//     c.set('user', null);
//     return next();
//   }
//   c.set('user', session.user);
//   return next();
// });

handler.post('/:configId', zValidator('json', z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
})), async (c) => {

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session || !session.user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const { key, value } = c.req.valid('json');

  try {
    const parsedValue = JSON.parse(value);
    try {
      const checkout = await service.configService.createConfiguration({
        key,
        value: parsedValue,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      });

      return c.json({ data: checkout });
    } catch (error) {
      throw new HTTPException(500, { message: 'Failed to create configuration' });
    }
  } catch (error) {
    throw new HTTPException(400, { message: 'Invalid JSON value' });
  }
});

export default handler;