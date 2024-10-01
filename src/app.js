import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import { ApiError } from "./utils/ApiError.js";

// routes declaration
app.use("/api/v1/users", userRouter);

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

  console.log(err);
  // Handle other types of errors
  return res.status(500).json({
    status: 500,
    message: "Internal Server Error",
    errors: err.errors,
  });
});

export { app };
