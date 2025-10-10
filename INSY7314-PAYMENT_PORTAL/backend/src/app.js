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
import cookieParser from "cookie-parser";

/** Build CORS middleware from allowed origins (array) */
function buildCors(allowedOrigins) {
  const devAllowRegex = /^https?:\/\/(localhost|127\.0\.0\.1):5173$/;

  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl/postman or same-origin
      if (allowedOrigins.includes(origin) || devAllowRegex.test(origin)) {
        return cb(null, true);
      }
      console.warn("[CORS] blocked origin:", origin, "allowed:", allowedOrigins);
      return cb(new Error("CORS: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // cache preflight 24h
  });
}

/** Security middleware factory */
function buildSecurityMiddlewares(allowedOrigins) {
  const corsMw = buildCors(allowedOrigins);

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
        "script-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
        "frame-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],
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
    hsts:
      env.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
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
    skip: (req) => req.path === "/health",
  });

  return { corsMw, helmetMw, limiter };
}

/** App factory */
export function createApp() {
  const app = express();

  // see what the browser is actually sending (helps diagnose)
  app.use((req, _res, next) => {
    if (req.method === "OPTIONS" || req.path.startsWith("/auth")) {
      console.log("[REQ]", req.method, req.path, "Origin=", req.headers.origin, "Host=", req.headers.host);
    }
    next();
  });

  // If behind a proxy in prod (Heroku/Render/NGINX/etc.)
  app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);

  // env.CORS_ORIGIN is already an array (from env.js)
  const { corsMw, helmetMw, limiter } = buildSecurityMiddlewares(env.CORS_ORIGIN);

  // CORS FIRST, and explicitly handle preflight
  app.options("*", corsMw);
  app.use(corsMw);
  app.use(cookieParser());
  // Common security/perf
  app.use(compression());
  app.use(hpp());
  app.use(helmetMw);
  app.use(limiter);

  // Body parsing & sanitization
  app.use(express.json({ limit: "1mb" }));
  app.use(unicodeSanitizer());

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // Routes
  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/me", meRouter);
  app.use("/payments", paymentsRouter);

  // 404
  app.use((req, res) => res.status(404).json({ error: "Not found" }));

  // Error handler (last)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
