# BarberMe Production Dockerfile (Node 22 LTS Alpine)
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifesto de dependências
COPY package*.json ./
RUN npm install --no-audit

# Copiar arquivos de configuração e código fonte completo para o build
COPY tsconfig.json vitest.config.ts .dependency-cruiser.cjs ./
COPY src ./src
COPY tests ./tests
COPY scripts ./scripts

# Compilar aplicação em dist/
RUN npm run build

# Etapa 2: Imagem final de Produção
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev --no-audit

COPY --from=builder /app/dist ./dist
COPY index.html styles.css app.js ./
COPY assets ./assets

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
