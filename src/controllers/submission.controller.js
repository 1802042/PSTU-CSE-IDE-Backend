import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { submissionModel } from "../models/submission.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import submissionSchema from "../validation/submission.validation.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
  path: "../../.env",
});

const submitCode = asyncHandler(async (req, res) => {
  // get the submission data from the request body ✅
  // validate the submission data ✅
  // get the user id from the req.user object ✅
  // enqueue the submission to the queue and get back a job token ✅
  // save the submission to the database ✅
  // return the submission data ✅

  const data = {
    code: req.body.code,
    languageId: req.body.languageId,
  };

  const validatedData = submissionSchema.safeParse(data);
  if (!validatedData.success) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      ReasonPhrases.BAD_REQUEST,
      validatedData.error.errors
    );
  }

  // enqueue the submission to the queue and get back a job token
  const queueData = {
    source_code: validatedData.data.code,
    language_id: validatedData.data.languageId,
    stdin: req.body?.stdin || "",
    cpu_time_limit: req.body?.cpuTime || null,
    memory_limit: req.body?.memory || null,
  };

  const headerToken = process.env.CEE_AUTH_Token;
  const response = await axios.post(
    process.env.CEE_URL + "/submissions",
    queueData,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": headerToken,
      },
    }
  );

  const jobToken = response.data.token;
  const submissionData = {
    userId: req.user._id,
    ...validatedData.data,
    token: jobToken,
  };

  const submission = await submissionModel.create(submissionData);
  if (!submission) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, submission)
    );
});

export { submitCode };
