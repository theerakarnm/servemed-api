import { Hono } from 'hono'
import * as handlers from './handlers'
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono().basePath('/api')

app.use('/*', cors({
  origin: (origin, _) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    return undefined;
  },
  maxAge: 600,
  credentials: true
}))
app.use("*", prettyJSON());

app.route('/auth', handlers.auth)
app.route('/v1/products', handlers.productsHandler)
app.route('/v1/compose', handlers.compose)
app.route('/v1/images', handlers.images)
app.route('/v1/configs', handlers.configHandler)
app.route('/v1/recommendations', handlers.recommendationsHandler)
app.route('/v1/checkout', handlers.checkoutHandler)
app.route('/v1/addresses', handlers.addressesHandler)

export default {
  port: process.env.PORT || 7300,
  fetch: app.fetch,
}

export type AppType = typeof app
