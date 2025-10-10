// backend/src/models/Payment.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Payment lifecycle:
 * created -> pending_auth -> sent | failed
 *
 * Auth window:
 *   auth.token (hex) + auth.expiresAt (Date)
 *   Use instance helpers: startAuthWindow(), isAuthPending(), approve(), expireAuth()
 */

const AuthSchema = new Schema(
  {
    token: { type: String, default: null },       // random hex (owner's browser gets it)
    expiresAt: { type: Date, default: null },     // T+59s
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // monetary details
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    provider: { type: String, required: true, default: "SWIFT" },

    // beneficiary (PII encrypted at rest)
    beneficiaryName: { type: String, required: true },
    beneficiaryAccountEnc: { type: String, required: true, select: false }, // hidden by default
    beneficiarySwift: { type: String, required: true },

    // optional link when user chose "save beneficiary"
    savedAsBeneficiaryId: { type: Schema.Types.ObjectId, ref: "Beneficiary", default: null },

    // lifecycle state
    status: {
      type: String,
      enum: ["created", "pending", "pending_auth", "sent", "failed"],
      default: "created",
      index: true,
    },

    // short-lived auth window
    auth: { type: AuthSchema, default: () => ({}) },

    // completion + POP
    completedAt: { type: Date, default: null, index: true },
    popRef: { type: String, default: null },

    // misc
    meta: { type: Object, default: {} },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    strict: true,
  }
);

// Helpful indexes
PaymentSchema.index({ owner: 1, createdAt: -1 });
// DO NOT TTL-delete payments automatically; keep full audit history.
// If you need to clean abandoned pending_auth after N hours, run a cron job instead.

// -------- Instance helpers --------
PaymentSchema.methods.startAuthWindow = function startAuthWindow(token, seconds = 59) {
  this.status = "pending_auth";
  this.auth = {
    token,
    expiresAt: new Date(Date.now() + seconds * 1000),
  };
};

PaymentSchema.methods.isAuthPending = function isAuthPending() {
  return (
    this.status === "pending_auth" &&
    this.auth?.token &&
    this.auth?.expiresAt &&
    this.auth.expiresAt > new Date()
  );
};

PaymentSchema.methods.expireAuth = function expireAuth() {
  if (this.status === "pending_auth") {
    this.auth.token = null;
    this.auth.expiresAt = null;
    this.status = "failed";
  }
};

PaymentSchema.methods.approve = function approve() {
  this.status = "sent";
  this.completedAt = new Date();
  this.auth.token = null; // one-time use
  this.auth.expiresAt = null;
};

export const Payment = mongoose.model("Payment", PaymentSchema);
