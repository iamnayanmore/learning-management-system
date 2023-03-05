import express from "express";
import {
  getAllCourses,
  createCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);
router.route("/create-course").post(createCourse);

export default router;
