import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/Stats.js";
import ErrorHandler from "../utils/errorHandle.js";
import { sendEmail } from "../utils/sendEmail.js";

// Contact form
export const contactForm = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return next(new ErrorHandler("All fields are mandatory", 400));
  }

  const to = process.env.MY_MAIL;
  const subject = "Contact form courseBundler";
  const text = `I am ${name}, my email is ${email} and phone is ${phone}, \n ${message}`;
  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your message has been sent.",
  });
});

// Request form
export const requestForm = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, course } = req.body;

  if (!name || !email || !phone || !course) {
    return next(new ErrorHandler("All fields are mandatory", 400));
  }

  const to = process.env.MY_MAIL;
  const subject = "Requesting for a course on courseBundler";
  const text = `I am ${name}, my email is ${email} and phone is ${phone}, \n ${course}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your request sent successfully.",
  });
});

// Admin dashboard stats
export const adminDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find().sort({ createdAt: "desc" }).limit(12);

  const statsData = [];

  for (let i = 0; i < stats.length; i++) {
    statsData.push(stats[i]);
  }

  const requiredSize = 12 - stats.length;
  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }

  const usersCount = statsData[11].users;
  const subscriptionsCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

  let usersPercentage = 0,
    viewsPercentage = 0,
    subscriptionsPercentage = 0;

  let usersProfit = true,
    viewsProfit = true,
    subscriptionsProfit = true;

  if (statsData[10].users === 0) usersPercentage = usersCount * 100;
  if (statsData[10].subscriptions === 0)
    subscriptionsPercentage = subscriptionsCount * 100;
  if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
      views: statsData[11].views - statsData[10].views,
    };

    usersPercentage = (difference.users / statsData[10].users) * 100;
    subscriptionsPercentage =
      (difference.users / statsData[10].subscriptions) * 100;
    viewsPercentage = (difference.users / statsData[10].views) * 100;

    if (usersPercentage < 0) usersProfit = false;
    if (subscriptionsPercentage < 0) subscriptionsProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
  }

  res.status(200).json({
    success: true,
    stats: statsData,
    usersCount,
    subscriptionsCount,
    viewsCount,
    usersPercentage,
    subscriptionsPercentage,
    viewsPercentage,
    usersProfit,
    subscriptionsProfit,
    viewsProfit,
  });
});
