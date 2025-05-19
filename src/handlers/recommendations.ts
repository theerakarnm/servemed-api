import { Hono } from "hono";
import { getPersonalizedRecommendations } from "../services/recommendations";

const handler = new Hono();

handler.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const list = await getPersonalizedRecommendations(user.id);
  return c.json({ data: list });
});

export default handler;
