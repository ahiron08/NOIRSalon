import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './config/index.js';

import api from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Built React app (produced by `npm run build -w client`).
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
const clientDistExists = fs.existsSync(clientDist);

const app = express();

// ---- security / perf ----
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        imgSrc: ["'self'", "data:", "https:", "http:"],
        mediaSrc: ["'self'", "https:", "http:"],
      },
    },
  })
);
app.use(compression());

// When running behind a reverse proxy / load balancer (Render, Railway, Nginx,
// PM2+), trust a single proxy hop so req.ip / rate-limiting see the real client
// instead of the proxy address. Never enabled in local dev.
if (config.env === 'production') app.set('trust proxy', 1);

// CORS — in dev we accept any localhost / 127.0.0.1 origin (any port) so the
// app keeps working whether it's opened at localhost:3000 or 127.0.0.1:3000.
// With credentials:true the browser requires an exact origin match, so we
// reflect the request origin after validating it. In production only the
// configured CLIENT_URL is allowed.
app.use(
  cors({
    origin(origin, cb) {
      if (config.env !== 'development') {
        return cb(null, origin === config.clientUrl);
      }
      const ok =
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === config.clientUrl;
      return cb(null, ok ? origin || true : false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// ---- static uploads ----
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---- api ----
app.use('/api/v1', api);

// ---- health ----
app.get('/health', (_req, res) => res.json({ success: true, env: config.env }));

// ---- root ----
// When the built SPA is present we serve index.html at "/" (single-origin
// deployment). In an API-only deployment (frontend hosted separately, e.g. on
// Vercel, and no client/dist present here) return a clear JSON health payload
// instead of a confusing generic 404.
app.get('/', (_req, res) => {
  if (clientDistExists) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  res.json({
    success: true,
    message: 'NOIR Salon API is running',
    service: 'NOIR SALON API',
    env: config.env,
  });
});

// ---- production: serve the built client (single-origin deployment) ----
// The bundled React app lives at ../client/dist. When present we serve it
// statically and fall back to index.html for SPA routes (/, /services, /admin…).
// API and uploads are excluded so unknown routes still return proper JSON 404s.
if (clientDistExists) {
  app.use(express.static(clientDist, { index: 'index.html' }));

  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api/') ||
      req.path.startsWith('/uploads/') ||
      req.path.includes('.')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else if (config.env === 'production') {
  console.warn(
    `[app] No build found at ${clientDist}. Run \`npm run build -w client\` ` +
      'before starting in production, or the SPA will not be served.'
  );
}

// ---- error handling ----
app.use(notFound);
app.use(errorHandler);

export default app;
