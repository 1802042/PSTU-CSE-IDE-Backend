import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/refreshtoken").post(verifyRefreshToken, refreshAccessToken);

export default router;
