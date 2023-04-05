import express from "express";
import {
  registerUser,
  login,
  logOut,
  getProfileDetails,
  changePassword,
  updateProfile,
  updateProfilePicture,
  forgotPassword,
  resetPassword,
  addToPlaylist,
  removeFromPlaylist,
  getAllUsers,
  updateUserRole,
  deleteUser,
  deleteMyProfile,
} from "../controllers/userController.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, registerUser);
router.route("/login").post(login);
router.route("/logout").post(logOut);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").put(resetPassword);

router
  .route("/me")
  .get(isAuthenticated, getProfileDetails)
  .delete(isAuthenticated, deleteMyProfile);
router.route("/change-password").put(isAuthenticated, changePassword);
router.route("/update-profile").put(isAuthenticated, updateProfile);
router
  .route("/update-profile-picture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);
router.route("/add-to-playlist").post(isAuthenticated, addToPlaylist);
router
  .route("/remove-from-playlist")
  .delete(isAuthenticated, removeFromPlaylist);

// Admin routes
router.route("/admin/users").get(isAuthenticated, authorizedAdmin, getAllUsers);
router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizedAdmin, updateUserRole)
  .delete(isAuthenticated, authorizedAdmin, deleteUser);
export default router;
