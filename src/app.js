import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ipRateLimiter } from "./utils/rateLimiter.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(ipRateLimiter);
app.use(express.json());
// app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import { ApiError } from "./utils/ApiError.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/submissions", submissionRouter);

// Custom error-handling middleware
app.use((err, req, res, next) => {
  // Check if the error is an instance of ApiError
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: err.status,
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.status == 413 || err.type === "entity.too.large") {
    return res.status(StatusCodes.REQUEST_TOO_LONG).json({
      status: err.status,
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  console.log(err);
  // Handle other types of errors
  return res.status().json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    errors: err.errors,
  });
});

export { app };
