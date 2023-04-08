import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandle.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new ErrorHandler("Not Logged in", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);

  next();
});

export const authorizeSubscriber = (req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin") {
    return next(
      new ErrorHandler("Only Subscriber can access this resource.", 403)
    );
  }
  next();
};

export const authorizedAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource.`,
        403
      )
    );

  next();
};
