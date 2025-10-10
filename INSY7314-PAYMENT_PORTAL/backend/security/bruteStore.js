import ExpressBrute from "express-brute";
import MongooseStore from "express-brute-mongoose";
import mongoose from "mongoose";

const store = new MongooseStore(mongoose.connection, {
  collectionName: "bruteforce",
});

export const brute = new ExpressBrute(store, {
  freeRetries: 5,                           //allow 5 attempts
  minWait: 5 * 60 * 1000,                   //5 minutes
  maxWait: 60 * 60 * 1000,                  //1 hour
  failCallback(req, res, next, nextValidRequestDate) {
    res.status(429).json({
      error: "Too many attempts. Try again later.",
      retryAfter: nextValidRequestDate,
    });
  },
  handleStoreError(error) {
    console.error("BruteForce store error:", error);
  },
});
