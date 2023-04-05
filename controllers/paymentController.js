import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import { instance } from "../server.js";
import ErrorHandler from "../utils/errorHandle.js";

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
