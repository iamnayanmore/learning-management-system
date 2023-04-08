import express from "express";
import {
  cancelSubscription,
  createSubscription,
  getRazorPayKey,
  paymentVerification,
} from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Buy Subscription
router.route("/subscribe").get(isAuthenticated, createSubscription);

// Verify and save reference
router
  .route("/payment-verification")
  .post(isAuthenticated, paymentVerification);

// Get razorpay key
router.route("/razorpay-key").get(getRazorPayKey);

// Cancel subscription
router
  .route("/subscription/cancel")
  .delete(isAuthenticated, cancelSubscription);

export default router;
