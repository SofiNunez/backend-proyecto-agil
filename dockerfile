# ─── STAGE 1: Build ───────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
# Instala dependencias
COPY package*.json ./
RUN npm ci
# Copia prisma schema y config antes del build
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
# Copia el código fuente y compila
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build
# ─── STAGE 2: Production ──────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
# Solo instala dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev
# Copia prisma para runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# Copia solo el build compilado
COPY --from=builder /app/dist ./dist
# Usuario no root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]