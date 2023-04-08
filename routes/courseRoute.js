import express from "express";
import {
  getAllCourses,
  createCourse,
  getCourseLectures,
  addCourseLecture,
  deleteCourse,
  deleteLecture,
} from "../controllers/courseController.js";
import {
  authorizeSubscriber,
  authorizedAdmin,
  isAuthenticated,
} from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);
router
  .route("/create-course")
  .post(isAuthenticated, authorizedAdmin, singleUpload, createCourse);
router
  .route("/course/:id")
  .get(isAuthenticated, authorizeSubscriber, getCourseLectures)
  .post(isAuthenticated, authorizedAdmin, singleUpload, addCourseLecture)
  .delete(isAuthenticated, authorizedAdmin, deleteCourse);
router
  .route("/lecture")
  .delete(isAuthenticated, authorizedAdmin, deleteLecture);

export default router;
