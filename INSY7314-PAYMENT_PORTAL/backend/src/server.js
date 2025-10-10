// backend/src/server.js
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// helper to read SSL files safely
function readIfExists(p) {
  try { return fs.readFileSync(p); } catch { return null; }
}

async function start() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  const app = createApp();

  const httpPort = Number(env.PORT) || 4000;
  const httpsPort = Number(process.env.HTTPS_PORT) || httpPort + 1;

  // --- HTTPS server (self-signed for local dev) ---
  const sslDir = path.join(__dirname, "..", "ssl");
  const key = readIfExists(path.join(sslDir, "privatekey.pem"));
  const cert = readIfExists(path.join(sslDir, "certificate.pem"));

  if (key && cert) {
    // Strong TLS profile
    const tlsOptions = {
      key,
      cert,
      minVersion: "TLSv1.2",
      ciphers: [
        "TLS_AES_256_GCM_SHA384",
        "TLS_AES_128_GCM_SHA256",
        "ECDHE-ECDSA-AES256-GCM-SHA384",
        "ECDHE-RSA-AES256-GCM-SHA384",
        "ECDHE-ECDSA-AES128-GCM-SHA256",
        "ECDHE-RSA-AES128-GCM-SHA256",
      ].join(":"),
      honorCipherOrder: true,
    };

    // Real API on HTTPS
    const httpsServer = createHttpsServer(tlsOptions, app);
    httpsServer.listen(httpsPort, () => {
      console.log(`API (HTTPS) : https://localhost:${httpsPort}`);
      console.log(`Health      : https://localhost:${httpsPort}/health`);
    });

    // HTTP redirector → always 301 to HTTPS
    const redirectApp = express();
    redirectApp.use((req, res) => {
      const hostOnly = (req.headers.host || `localhost:${httpPort}`).split(":")[0];
      const location = `https://${hostOnly}:${httpsPort}${req.url}`;
      res.redirect(301, location);
    });
    const httpServer = createHttpServer(redirectApp);
    httpServer.listen(httpPort, () => {
      console.log(`HTTP redirector : http://localhost:${httpPort}  →  https://localhost:${httpsPort}`);
    });
  } else {
    console.warn(
      "⚠️  HTTPS not started: missing ssl/privatekey.pem or ssl/certificate.pem.\n" +
      "    Running HTTP only for development. Generate certs to enable HTTPS + redirect."
    );
    const httpServer = createHttpServer(app);
    httpServer.listen(httpPort, () => {
      console.log(`API (HTTP only) : http://localhost:${httpPort}`);
      console.log(`Health          : http://localhost:${httpPort}/health`);
    });
  }
}

start().catch((e) => {
  console.error("Failed to start server", e);
  process.exit(1);
});
