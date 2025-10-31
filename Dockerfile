# -----------------------------
# STAGE 1 — Build
# -----------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Instala dependências necessárias
RUN apk add --no-cache python3 make g++

# Copia package.json e package-lock
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia código
COPY . .

# Build do NestJS
RUN npm run build


# -----------------------------
# STAGE 2 — Production
# -----------------------------
FROM node:22-alpine AS production
WORKDIR /app

# Copia apenas o necessário da stage anterior
COPY --from=builder /app/package*.json ./
RUN npm install

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
