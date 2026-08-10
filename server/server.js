import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";
import { connectToDatabase, disconnectFromDatabase } from './config/database.js';
import { env } from './config/env.js';
import { configureCloudinary } from './config/cloudinary.js';
import { seedDefaultSlabs } from './services/pricing.service.js';

dns.setServers(["1.1.1.1", "8.8.8.8"]);

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is missing from environment');
}

let server;
let isShuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Closing services...`);

  const forceExitTimer = setTimeout(() => process.exit(1), 10_000);
  forceExitTimer.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('HTTP server closed.');
  }

  await disconnectFromDatabase();
  clearTimeout(forceExitTimer);
  process.exit(exitCode);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  void shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

const MAX_LISTEN_RETRIES = 10;
const LISTEN_RETRY_DELAY_MS = 1000;

/**
 * Bind the HTTP server, tolerating the transient EADDRINUSE that occurs when a
 * previous instance (e.g. a `node --watch` restart on Windows) hasn't released
 * the port yet. Retries with a 1s backoff rather than crashing the process.
 */
function listenWithRetry(port, attempt = 1) {
  return new Promise((resolve, reject) => {
    const onListening = () => resolve();
    const onError = (err) => {
      if (err.code === 'EADDRINUSE' && attempt < MAX_LISTEN_RETRIES) {
        console.log(
          `Port ${port} still in use (attempt ${attempt}/${MAX_LISTEN_RETRIES}). Retrying in ${LISTEN_RETRY_DELAY_MS}ms...`
        );
        setTimeout(
          () => listenWithRetry(port, attempt + 1).then(resolve, reject),
          LISTEN_RETRY_DELAY_MS
        );
      } else {
        reject(err);
      }
    };
    server = app.listen(port, onListening);
    server.once('error', onError);
  });
}

const startServer = async () => {
  try {
    await connectToDatabase();
    // Initialise Cloudinary (falls back to local media when creds are missing).
    configureCloudinary();
    // Seed default pricing slabs if none exist
    await seedDefaultSlabs();
    await listenWithRetry(env.PORT);
    console.log(`IndigoMart API listening on port ${env.PORT} (${env.NODE_ENV})`);
  } catch (error) {
    console.error('Application startup failed:', error.message);
    await disconnectFromDatabase();
    process.exit(1);
  }
};

await startServer();