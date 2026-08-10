# NOIR SALON — Deployment Guide

This monorepo ships as a **single Node/Express process** that serves both the REST API
(`/api/v1`) and the built React SPA from one origin. That removes cross‑origin/CORS/cookie
headaches in production.

```
/client  → React + Vite (builds to client/dist)
/server  → Express API (also serves client/dist in production)
```

---

## 0. Prerequisites

- Node.js **≥ 18** (tested on 20.x LTS) and npm **≥ 9**.
- A MongoDB database — **MongoDB Atlas** recommended for production persistence.
- SMTP credentials for transactional email (optional — app falls back to a dev preview).
- Cloudinary credentials for durable image/video uploads (optional — falls back to local disk).

Configure everything via a `.env` file (copy `.env.example` to `.env`). **Never** commit
`.env`; it is git-ignored. The `.env.example` template is the source of truth for every
variable and is intentionally unchanged for deployment.

---

## 1. Quick start (local)

```bash
npm install          # installs client + server workspaces
npm run seed         # creates sample data + admin (see Seed below)
npm run dev          # client on :3000, API on :5000
```

### Seed the admin account & demo content

```bash
npm run seed
```

The seed script reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`
(defaults: `admin@noirsalon.in` / `ChangeMe123!`). **Change the password before going live.**

> At runtime the server also auto-seeds default pricing slabs if none exist, so a fresh
> database boots immediately.

---

## 2. Build & run in "production" mode (single origin)

```bash
npm run build -w client   # emits client/dist
NODE_ENV=production npm start
```

The Express server detects `client/dist` and serves it with an SPA fallback, so
`https://yourdomain.com/services`, `/admin`, etc. all load the app. Unknown `/api/*` routes
still return JSON 404s via the global error handler.

### Env you must set in production

| Variable | Notes |
| --- | --- |
| `NODE_ENV` | `production` (enables secure cookies, single-origin serving, `trust proxy`) |
| `PORT` | HTTP port (e.g. `5000`, or the port your PaaS injects) |
| `MONGODB_URI` | Required — the server refuses to boot without it |
| `CLIENT_URL` | Your public origin, e.g. `https://noirsalon.in` (used for email links + CORS) |
| `JWT_SECRET` | **Long random string.** Never reuse the dev default |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Production admin (use `npm run seed` or set on first boot) |

> Secure `httpOnly` cookies are issued only when `NODE_ENV=production` — serve over **HTTPS**.

---

## 3. Deploy options

### A) Docker (recommended, any host / VPS / Renders of the world)

A multi-stage `Dockerfile` builds the client and ships the API, plus a `docker-compose.yml`
with an optional local Mongo and a `web` service.

```bash
# uses .env on the host for secrets
docker compose up -d --build
```

- App listens on `:5000`. Map it in the compose file (already set to `PORT`).
- `server/uploads` and `mongo` data live in named volumes (see compose).
- **For durable uploads set Cloudinary creds** — otherwise uploaded media is stored in the
  `noir-uploads` volume (survives restarts, lost if the volume is deleted).
- Health check hits `/health`.

Standalone image build:

```bash
docker build -t noir-salon .
docker run -p 5000:5000 --env-file .env noir-salon
```

### B) Render / Railway / Fly.io (PaaS)

Use a build/start command per provider. Common pattern:

- **Build:** `npm ci && npm run build -w client`
- **Start:** `PORT=$PORT NODE_ENV=production node server/server.js`

Set `MONGODB_URI`, `CLIENT_URL`, `JWT_SECRET`, `ADMIN_*`, Cloudinary/SMTP in the provider's
environment dashboard. `trust proxy` is enabled automatically so logs/rate-limiting use the
real client IP behind the platform LB.

### C) VPS with PM2

```bash
npm ci
npm run build -w client
npm i -g pm2
npx pm2 start ecosystem.config.cjs
npx pm2 save
npx pm2 startup   # auto-restart on boot
```

Put Nginx/Caddy in front for HTTPS and proxy `/` → `127.0.0.1:5000`, plus `/health` for the
uptime monitor.

---

## 4. Health checks & monitoring

- `GET /health` → `200 {"success":true,"env":"production"}` — used by Docker `HEALTHCHECK`,
  PaaS pings, and uptime monitors.

---

## 5. Production gotchas

- **Admin login** uses a `SameSite=Lax`, `httpOnly`, `Secure` cookie. Because the SPA and API
  share one origin in production, the cookie just works. In local dev the admin panel calls
  `http://localhost:5000` directly (see `client/src/config.js`).
- **Uploads:** prefer Cloudinary for persistence. Without it, files land in `server/uploads`
  (ephemeral unless you mount/back it up).
- **Rate limiting** is per-IP (`express-rate-limit`); `trust proxy` is on in production so the
  real IP is used, not the load balancer's.
- **Cold start:** the server seeds default pricing slabs on boot, so an empty DB works. Run
  `npm run seed` once for a full demo dataset + admin.
- The `client/videos/hero.mp4` currently shipped is a `0`‑byte placeholder — replace public
  intro/hero video files under `client/public/videos/` before launch.