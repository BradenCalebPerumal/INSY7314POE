// backend/src/app.js

import express from "express";
import morgan from "morgan";
import compression from "compression";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { unicodeSanitizer } from "./middleware/unicodeSanitizer.js";

import { env } from "./config/env.js";

import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { paymentsRouter } from "./routes/payments.js";

/** Resolve CORS origin flexibly (dev + prod) */
function makeCorsOrigin(allowed) {
  if (!allowed) return false;
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  return function corsOrigin(origin, cb) {
    // Allow same-origin (non-browser) or no Origin (curl/postman)
    if (!origin) return cb(null, true);
    if (allowedList.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin not allowed"), false);
  };
}

/** Security middleware factory */
function buildSecurityMiddlewares(allowedOrigin) {
  const corsMw = cors({
    origin: makeCorsOrigin(allowedOrigin),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // cache preflight 24h
  });

  const helmetMw = helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "connect-src": [
          "'self'",
          "https://localhost:4001",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        "script-src": [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        "frame-src": [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
        "base-uri": ["'self'"],
        "upgrade-insecure-requests": [],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginEmbedderPolicy: false,
    // ✅ HSTS in production (preload-ready)
    hsts: env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    // Extra hardening headers not on by default:
    crossOriginResourcePolicy: { policy: "same-origin" },
    permissionsPolicy: {
      features: {
        accelerometer: ["'none'"],
        ambientLightSensor: ["'none'"],
        autoplay: ["'none'"],
        camera: ["'none'"],
        displayCapture: ["'none'"],
        documentDomain: ["'none'"],
        encryptedMedia: ["'none'"],
        fullscreen: ["'self'"],
        geolocation: ["'none'"],
        gyroscope: ["'none'"],
        magnetometer: ["'none'"],
        microphone: ["'none'"],
        midi: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
        vr: ["'none'"],
        screenWakeLock: ["'none'"],
        syncXhr: ["'none'"],
      },
    },
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    // (optional) don’t rate-limit health checks
    skip: (req) => req.path === "/health",
  });

  return [compression(), hpp(), corsMw, helmetMw, limiter];
}

/** App factory */
export function createApp() {
  const app = express();

  // If behind a proxy in prod (Heroku/Render/NGINX/etc.)
  app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);

  // Security & common middleware
  app.use(...buildSecurityMiddlewares(
    // allow multiple origins in env: "https://localhost:5173,https://your-prod-domain"
    env.CORS_ORIGIN?.includes(",")
      ? env.CORS_ORIGIN.split(",").map((s) => s.trim())
      : env.CORS_ORIGIN
  ));

  // parse body before sanitizer
  app.use(express.json({ limit: "1mb" }));

  // block invisible/control Unicode before hitting routes
  app.use(unicodeSanitizer());

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // Routes
  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/me", meRouter);
  app.use("/payments", paymentsRouter);

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error handler (last)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
