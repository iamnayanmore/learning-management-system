import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { instance } from "../server.js";
import ErrorHandler from "../utils/errorHandle.js";
import crypto from "crypto";

export const createSubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return next(new ErrorHandler("Admin can't buy subscription", 400));
  }

  const subscription = await instance.subscriptions.create({
    plan_id: process.env.PLAN_ID || "plan_LZnsxAyQ6YfMIW",
    customer_notify: 1,
    total_count: 12,
  });

  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Subscription created successfully",
    subscription,
  });
});

export const paymentVerification = catchAsyncError(async (req, res, next) => {
  const { razorpay_signature, razorpay_subscription_id, razorpay_payment_id } =
    req.body;

  const user = await User.findById(req.user._id);

  const subscription_id = user.subscription.id;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");

  const isAuthentic = generated_signature === razorpay_signature;

  if (!isAuthentic)
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);

  await Payment.create({
    razorpay_signature,
    razorpay_subscription_id,
    razorpay_payment_id,
  });
  user.subscription.status = "active";

  await user.save();
  res.redirect(
    `${process.env.FRONTEND_URL}/payment-success?reference=${razorpay_payment_id}`
  );
});

export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_API_KEY,
  });
});

export const cancelSubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const subscriptionId = user.subscription.id;
  let refund = false;

  await instance.subscriptions.cancel(subscriptionId);

  const payment = await Payment.findOne({
    razorpay_subscription_id: subscriptionId,
  });

  const gap = Date.now() - payment.createdAt;

  const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

  if (refundTime > gap) {
    await instance.payments.refund(payment.razorpay_payment_id);
    refund = true;
  }

  await payment.remove();

  user.subscription.id = undefined;
  user.subscription.status = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: refund
      ? "Subscription cancelled, You will received full refund within 7 days."
      : "Subscription cancelled, No refund initiated as subscription was canceled after 7 days",
  });
});
