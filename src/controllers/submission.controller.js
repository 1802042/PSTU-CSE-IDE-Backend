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

const resultStatus = {
  queue: { id: 1, name: "In Queue" },
  process: { id: 2, name: "Processing" },
  ac: { id: 3, name: "Accepted" },
  wa: { id: 4, name: "Wrong Answer" },
  tle: { id: 5, name: "Time Limit Exceeded" },
  ce: { id: 6, name: "Compilation Error" },
  sigsegv: { id: 7, name: "Runtime Error (SIGSEGV)" },
  sigxfsz: { id: 8, name: "Runtime Error (SIGXFSZ)" },
  sigfpe: { id: 9, name: "Runtime Error (SIGFPE)" },
  sigabrt: { id: 10, name: "Runtime Error (SIGABRT)" },
  nzec: { id: 11, name: "Runtime Error (NZEC)" },
  other: { id: 12, name: "Runtime Error (Other)" },
  boxerr: { id: 13, name: "Internal Error" },
  exeerr: { id: 14, name: "Exec Format Error" },
};

const submitCode = asyncHandler(async (req, res) => {
  // get the submission data from the request body ✅
  // validate the submission data ✅
  // get the user id from the req.user object ✅
  // enqueue the submission to the queue and get back a job token ✅
  // save the submission to the database ✅
  // fetch the submission result using the job token and update database ✅
  // return the submission data ✅

  const data = {
    sourceCode: req.body.sourceCode,
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

  // sourceCode, languageId, stdin, timeLimit, memoryLimit
  const queueData = {
    source_code: validatedData.data.sourceCode,
    language_id: validatedData.data.languageId,
    stdin: req.body?.stdin || "",
    expected_output: req.body?.testCase || null,
    cpu_time_limit: req.body?.timeLimit || null,
    memory_limit: req.body?.memoryLimit || null,
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
    stdin: req.body?.stdin || "",
  };

  const submission = await submissionModel.create(submissionData);
  if (!submission) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }

  fetchSubmissionResult(submission);

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, submission)
    );
});

// Function to fetch submission result
const fetchSubmissionResult = async (submission) => {
  try {
    const headerToken = process.env.CEE_AUTH_Token;
    const intervalId = setInterval(async () => {
      const response = await axios.get(
        `${process.env.CEE_URL}/submissions/${submission.token}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": headerToken,
          },
        }
      );

      const result = response.data;

      // Stop checking if the submission is no longer pending
      if (result.status?.id > 2) {
        clearInterval(intervalId);

        submission.status = result.status?.description;
        submission.memory = result.memory;
        submission.cpu = result.time;
        submission.stdout = result.stdout;
        submission.stderr = result.stderr;

        await submission.save();
      }
    }, 1500);

    setTimeout(async () => {
      clearInterval(intervalId);
      if (submission.status === "Processing") {
        submission.status = "Error";
        await submission.save();
      }
    }, 11000);
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error
    );
  }
};

const getResult = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const submission = await submissionModel.findById(submissionId);
  if (!submission) {
    throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, submission));
});

export { submitCode, getResult };
