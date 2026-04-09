# Build inside Docker so Railway doesn't depend on a checked-in build/ folder.
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run compile:staging

FROM node:22-slim

WORKDIR /

COPY --from=builder /app/build/ /
COPY --from=builder /app/package.json /app/package-lock.json /
RUN npm ci --omit=dev

EXPOSE 8007

CMD ["node", "index.js"]
