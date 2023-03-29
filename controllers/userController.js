import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandle.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { Course } from "../models/course.js";

// Register
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

// Login
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

// Logout
export const logOut = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, { expires: new Date(Date.now()) })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

// Get profile details
export const getProfileDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Change Password
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please provide all fields", 400));

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHandler("Incorrect old password", 400));

  user.password = newPassword;
  user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// update profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email;

  user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  // cloudinary TODO

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
  });
});

// Forget password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found.", 400));

  const resetToken = await user.getResetToken();

  await user.save();

  // send token via email
  const url = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Click on the link to reset Password, ${url}. if you have not requested then please ignore.`;
  await sendEmail(user.email, "Course bundler reset password", message);

  res.status(200).json({
    success: true,
    message: `Reset token has been sent to ${user.email}`,
  });
});

//Reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gte: Date.now() },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired", 401));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

// Add to playlist
export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const itemExists = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemExists) return next(new ErrorHandler("Item already exists", 409));

  user.playlist = {
    course: course._id,
    poster: course.poster.url,
  };

  user.save();

  res.status(200).json({
    success: true,
    message: "Course added to playlist",
  });
});

// Remove to playlist
export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });

  user.playlist = newPlaylist;

  user.save();

  res.status(200).json({
    success: true,
    message: "Course removed from playlist",
  });
});
