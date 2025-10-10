// backend/src/config/env.js
import "dotenv/config";
import { z } from "zod";

// Helper: decode hex/base64/base64url 32-byte key
function decodeDataKeyToBytes(raw) {
  if (typeof raw !== "string" || !raw) throw new Error("DATA_KEY must be set");
  let s = raw.trim();

  // strip accidental quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }

  // try hex (64 chars)
  if (/^[0-9a-fA-F]{64}$/.test(s)) {
    return Buffer.from(s, "hex");
  }

  // try base64 / base64url
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 2 ? "==" : b64.length % 4 === 3 ? "=" : "";
  let buf;
  try {
    buf = Buffer.from(b64 + pad, "base64");
  } catch {
    throw new Error("DATA_KEY must be a 32-byte key (base64 or hex).");
  }
  if (buf.length !== 32) throw new Error("DATA_KEY must decode to exactly 32 bytes.");
  return buf;
}

// -------------------
// Validation schema
// -------------------
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().refine(
    (s) => s.startsWith("mongodb://") || s.startsWith("mongodb+srv://"),
    { message: "MONGO_URI must start with mongodb:// or mongodb+srv://" }
  ),
  CORS_ORIGIN: z.string().url(),
  PWD_PEPPER: z.string().min(16),
  JWT_SECRET: z.string().min(32),
  DATA_KEY: z.string().min(1),

  // Token lifetimes
  ACCESS_TOKEN_TTL_MIN: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),

  // SMTP for POP email
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().email().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Single source of truth for the AES key (32 bytes)
export function getDataKeyBytes() {
  return decodeDataKeyToBytes(env.DATA_KEY);
}
