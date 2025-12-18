FROM node:22.11.0-alpine3.19 AS deps
WORKDIR /app

COPY bot/package*.json ./
RUN apk update && apk upgrade --no-cache && npm ci --omit=dev

FROM node:22.11.0-alpine3.19
ENV NODE_ENV=production \
	BOT_SERVER_URL=http://backend:3000 \
	BOT_SERVICE_PORT=4000
WORKDIR /app

RUN apk update && apk upgrade --no-cache

COPY --from=deps /app/node_modules ./node_modules
COPY bot/package*.json ./
COPY bot/src ./src
COPY backend/constants /backend/constants

RUN adduser -D botuser && chown -R botuser:botuser /app /backend

USER botuser

WORKDIR /app

EXPOSE 4000

CMD ["npm", "run", "service"]
