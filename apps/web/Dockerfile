# Build from repo root so workspace and lockfile are available.
# docker build -f apps/web/Dockerfile .

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web ./apps/web
RUN npm ci
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build -w @aha/web

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Full standalone preserves root node_modules (has 'next'); server runs from apps/web
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["node", "server.js"]
