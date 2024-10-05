import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
//generate access token
router.route("/refresh-token").post(verifyRefreshToken, refreshAccessToken);
// secured routes
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/reset-password").post(verifyAccessToken, resetPassword);
router.route("/user").get(verifyAccessToken, getCurrentUser);

export default router;
