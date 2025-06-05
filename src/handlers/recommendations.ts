import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "../utils/auth";
import { getPersonalizedRecommendations } from "../services/recommendations";
const handler = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
  };
}>();

handler.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  c.set("user", session.user);
  return next();
});

handler.get("/", async (c) => {
  const user = c.get("user");
  const list = await getPersonalizedRecommendations(user.id);
  return c.json({ data: list });
});

export default handler;
