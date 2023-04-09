import express from "express";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  adminDashboardStats,
  contactForm,
  requestForm,
} from "../controllers/otherController.js";

const router = express.Router();

// Contact form
router.route("/contact").post(isAuthenticated, contactForm);

// Request form
router.route("/course-request").post(isAuthenticated, requestForm);

// Admin dashboard stats
router
  .route("/admin-dashboard-stats")
  .get(isAuthenticated, authorizedAdmin, adminDashboardStats);

export default router;
