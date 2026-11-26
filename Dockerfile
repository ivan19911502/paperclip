FROM node:20-alpine

RUN apk add --no-cache openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV DATABASE_URL="postgresql://sportpulse:build-only@127.0.0.1:5432/sportpulse?schema=public"
RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npm run db:setup && npm start"]
