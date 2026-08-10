# ---- Build stage: compile the React client ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci

# Copy source and produce the production bundle
COPY . .
RUN npm run build -w client

# ---- Runtime stage: Express API + built client, single origin ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
# Production deps only (client dev tooling like Vite isn't needed at runtime)
RUN npm ci --omit=dev

# Built SPA + backend source + env template
COPY --from=build /app/client/dist ./client/dist
COPY server ./server
COPY .env.example ./.env.example

# Writable volume for local-media fallback uploads (use Cloudinary for persistence)
RUN mkdir -p /app/server/uploads && chown -R node:node /app
VOLUME ["/app/server/uploads"]

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "start"]