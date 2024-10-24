import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  getCurrentUser,
  emailVerification,
  resetAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../middlewares/auth.middleware.js";
import { multerErrorHandler } from "../middlewares/multerErrors.middleware.js";

const router = Router();
router.route("/login").post(loginUser);
router
  .route("/register")
  .post(upload.single("avatar"), registerUser, multerErrorHandler);

router.route("/verify-email/:token").get(emailVerification);
router.route("/refresh-token").get(verifyRefreshToken, refreshAccessToken);

// secured routes
router.route("/logout").get(verifyAccessToken, logoutUser);
router.route("/reset-password").post(verifyAccessToken, resetPassword);
router
  .route("/reset-avatar")
  .post(
    verifyAccessToken,
    upload.single("avatar"),
    resetAvatar,
    multerErrorHandler
  );
router.route("/user").get(verifyAccessToken, getCurrentUser);

export default router;
