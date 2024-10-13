import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { submitCode, getResult } from "../controllers/submission.controller.js";

const router = Router();
// secured routes
router.route("/submit").post(verifyAccessToken, submitCode);
router.route("/result/:submissionId").get(verifyAccessToken, getResult);

export default router;
