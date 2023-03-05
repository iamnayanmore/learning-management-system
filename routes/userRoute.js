import express from "express";
import { registerUser, login, logOut } from "../controllers/userController.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").post(logOut);

export default router;
