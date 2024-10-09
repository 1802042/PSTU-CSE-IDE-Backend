import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";
import sendVerificationEmail from "./sendVerificationEmail.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { userModel } from "../models/user.model.js";

dotenv.config({
  path: "../.env",
});

// Define the Redis connection configuration
const connection = {
  host: process.env.REDIS_HOST, // Replace with your Redis server host
  port: process.env.REDIS_PORT, // Replace with your Redis server port
};

let queue;

try {
  queue = new Queue("emailServer", { connection });
} catch (error) {
  throw new ApiError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    ReasonPhrases.INTERNAL_SERVER_ERROR,
    error.message
  );
}

const sendEmail = async (email) => {
  try {
    await queue.add(email, { email: email });
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

try {
  // Worker setup
  const worker = new Worker(
    "emailServer",
    async (job) => {
      const emailVerificationToken = await sendVerificationEmail(
        job.data.email
      );

      if (!emailVerificationToken) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          ReasonPhrases.INTERNAL_SERVER_ERROR,
          error.message
        );
      }

      return emailVerificationToken; // Return the token
    },
    { connection }
  );

  worker.on("completed", async (job) => {
    const user = await userModel.findOne({
      email: job.data.email,
    });

    if (!user) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
        error.message
      );
    }

    user.emailVerificationToken = job.returnvalue;
    await user.save({ validateBeforeSave: false });
  });

  worker.on("failed", (job, err) => {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      err.message
    );
  });
} catch (error) {
  throw new ApiError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    ReasonPhrases.INTERNAL_SERVER_ERROR,
    error.message
  );
}

export { sendEmail };
