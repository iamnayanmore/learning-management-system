import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandle.js";
import { sendToken } from "../utils/sendToken.js";

export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  // const file = req.file
  if (!name || !email || !phone || !password)
    return next(new ErrorHandler("Please provide all fields", 400));

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already exists", 409));

  // upload file on cloudinary
  user = await User.create({
    name,
    email,
    phone,
    password,
    avatar: {
      public_id: "tempId",
      url: "tempUrl",
    },
  });

  sendToken(res, user, "Registered Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please provide add fields", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user)
    return next(new ErrorHandler("User not exists. Please register", 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Incorrect email or password", 401));
  }

  sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

export const logOut = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, { expires: new Date(Date.now()) })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
