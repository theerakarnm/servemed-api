FROM oven/bun:1.2-slim AS base

FROM base AS builder

RUN cat /etc/os-release

RUN apt-get update && apt-get install -y libc6
WORKDIR /app

COPY apps/api/package.json .
# COPY bun.lock .
COPY apps/api/dist ./dist
# COPY assets ./assets

RUN bun install

RUN bunx turbo run build --filter=web-app

FROM base AS production

# Create non-root user/group
# Using 'bun' user/group as it might already exist in the base image, otherwise create them
RUN addgroup --system --gid 1001 bun || true
RUN adduser --system --uid 1001 bun || true

COPY --chown=bun:bun --from=builder /app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /app/package.json ./package.json
COPY --chown=bun:bun --from=builder /app/bun.lockb* ./
COPY --chown=bun:bun --from=builder /app/dist ./dist

USER bun
EXPOSE 7300

CMD ["bun", "run", "dist/server.js"]
