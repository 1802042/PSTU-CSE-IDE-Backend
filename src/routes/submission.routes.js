import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { submitCode } from "../controllers/submission.controller.js";

const router = Router();
// secured routes
router.route("/submit").post(verifyAccessToken, submitCode);

export default router;
