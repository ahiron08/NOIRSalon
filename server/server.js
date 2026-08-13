import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";

import {
    connectToDatabase,
    disconnectFromDatabase
} from "./config/database.js";

import { env } from "./config/env.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { seedDefaultSlabs } from "./services/pricing.service.js";

// Use reliable public DNS servers for MongoDB Atlas SRV resolution
dns.setServers([
    "8.8.8.8",      // Google DNS
    "1.1.1.1"       // Cloudflare DNS
]);

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from environment");
}

let server;
let isShuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
    if (isShuttingDown) return;

    isShuttingDown = true;
    console.log(`${signal} received. Closing services...`);

    const forceExitTimer = setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
    }, 10_000);

    forceExitTimer.unref();

    try {
        if (server) {
            await new Promise((resolve) => {
                server.close(resolve);
            });

            console.log("HTTP server closed.");
        }

        await disconnectFromDatabase();

        clearTimeout(forceExitTimer);
        process.exit(exitCode);
    } catch (error) {
        console.error("Error during shutdown:", error);
        clearTimeout(forceExitTimer);
        process.exit(1);
    }
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
    void shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    void shutdown("uncaughtException", 1);
});

const MAX_LISTEN_RETRIES = 10;
const LISTEN_RETRY_DELAY_MS = 1000;

function listenWithRetry(port, attempt = 1) {
    return new Promise((resolve, reject) => {
        const srv = app.listen(port, () => {
            server = srv;
            resolve();
        });

        srv.once("error", (err) => {
            if (
                err.code === "EADDRINUSE" &&
                attempt < MAX_LISTEN_RETRIES
            ) {
                console.log(
                    `Port ${port} still in use ` +
                    `(attempt ${attempt}/${MAX_LISTEN_RETRIES}). ` +
                    `Retrying in ${LISTEN_RETRY_DELAY_MS}ms...`
                );

                setTimeout(() => {
                    listenWithRetry(
                        port,
                        attempt + 1
                    ).then(resolve, reject);
                }, LISTEN_RETRY_DELAY_MS);

                return;
            }

            reject(err);
        });
    });
}

const startServer = async () => {
    try {
        console.log("Using DNS servers:", dns.getServers());

        await connectToDatabase();

        configureCloudinary();

        await seedDefaultSlabs();

        await listenWithRetry(env.PORT);

        console.log(
            `IndigoMart API listening on port ${env.PORT} (${env.NODE_ENV})`
        );
    } catch (error) {
        console.error(
            "Application startup failed:",
            error
        );

        await disconnectFromDatabase();

        process.exit(1);
    }
};

await startServer();