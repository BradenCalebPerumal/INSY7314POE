// Password Security (Task 2: Password Security – exceeds)
// - Argon2id hashing with a server-side PEPPER (PWD_PEPPER) in addition to Argon2's random salt
// - Strong policy enforced server-side: length ≥ 12, upper/lower/digit/symbol,
//   no repeated chars/sequences/common words, and avoids user personal info
// - verifyPassword uses same PEPPER; salts are stored inside Argon2 hash output

// validatePassword(..) — enforces the strong policy (server is source of truth)

import argon2 from "argon2";

const PEPPER = process.env.PWD_PEPPER || "";

const reUpper = /[A-Z]/;
const reLower = /[a-z]/;
const reDigit = /\d/;
const reSymbol = /[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/;

export function validatePassword(pw, userCtx = {}) {
  if (typeof pw !== "string") return { ok: false, errors: ["invalid type"] };
  const p = pw.normalize("NFC");
  const errors = [];
  if (p.length < 12) errors.push("must be at least 12 characters");
  if (!reUpper.test(p)) errors.push("must include an uppercase letter");
  if (!reLower.test(p)) errors.push("must include a lowercase letter");
  if (!reDigit.test(p)) errors.push("must include a digit");
  if (!reSymbol.test(p)) errors.push("must include a symbol");

  const lower = p.toLowerCase();
  const bads = ["password", "qwerty", "letmein", "welcome", "admin", "123456", "111111"];
  if (bads.some((b) => lower.includes(b))) errors.push("too common/guessable");
  if (/(.)\1\1/.test(p)) errors.push("contains three or more repeated characters");
  if (/(?:0123|1234|2345|3456|4567|5678|6789)/.test(p)) errors.push("contains numeric sequences");

  const parts = [userCtx?.email, userCtx?.name, userCtx?.username]
    .filter(Boolean)
    .flatMap((s) => String(s).toLowerCase().split(/[@._\s-]+/));
  if (parts.some((x) => x.length >= 3 && lower.includes(x))) errors.push("contains personal info");

  return { ok: errors.length === 0, errors };
}


// hashPassword(..) — Argon2id parameters tuned for interactive logins
// memoryCost ≈ 19MB, timeCost=2 (can raise in prod if needed)

export async function hashPassword(pw) {
  return argon2.hash(pw + PEPPER, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

// verifyPassword(..) — constant-time verify using Argon2id with PEPPER

export async function verifyPassword(pw, hash) {
  return argon2.verify(hash, pw + PEPPER);
}
