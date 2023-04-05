import express from "express";
import { createSubscription } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Buy Subscription
router.route("/subscribe").get(isAuthenticated, createSubscription);

export default router;
