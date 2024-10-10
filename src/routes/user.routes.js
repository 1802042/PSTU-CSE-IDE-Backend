import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  getCurrentUser,
  emailVerification,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/login").post(loginUser);
router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/verify-email/:token").get(emailVerification);

router.route("/refresh-token").post(verifyRefreshToken, refreshAccessToken);

// secured routes
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/reset-password").post(verifyAccessToken, resetPassword);
router.route("/user").get(verifyAccessToken, getCurrentUser);

export default router;

// docker run -d --name redis-email-server -p 6379:6379 redis redis-server --requirepass 2b93be9e611c517d27bef1c6ff5bd55989325c81e178b2a158621e6232a163ed0fdd0bf6c53923daa4fa3756feab6ad7c0f6dc27c33cf356276d4962cb51f33d
