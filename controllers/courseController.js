import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/course.js";
import ErrorHandler from "../utils/errorHandle.js";

export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find().select("-lectures");
  res.status(200).json({
    success: true,
    courses,
  });
});

export const createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  // const file = req.file;

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please provide all fields", 400));

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: "temp",
      url: "temp",
    },
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully. You can add lectures now.",
  });
});

// All lectures, delete course, get course details

// Delete lecture
