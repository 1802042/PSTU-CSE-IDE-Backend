import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { submissionModel } from "../models/submission.model.js";
import { userModel } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import submissionSchema from "../validation/submission.validation.js";
import dotenv from "dotenv";
import axios from "axios";
import { query } from "express";

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

const encodeBase64 = (data) => {
  return data ? Buffer.from(data).toString("base64") : "";
};

const decodeBase64 = (data) => {
  return data ? Buffer.from(data, "base64").toString("utf-8") : "";
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
    expected_output: req.body?.expected || "",
    cpu_time_limit: req.body?.timeLimit || null,
    memory_limit: req.body?.memoryLimit || null,
    redirect_stderr_to_stdout: true,
    cpu_time_limit: "10.0",
  };

  queueData.source_code = encodeBase64(queueData.source_code);
  queueData.stdin = encodeBase64(queueData.stdin);
  queueData.expected_output = encodeBase64(queueData.expected_output);

  const headerToken = process.env.CEE_AUTH_Token;
  const response = await axios.post(
    process.env.CEE_URL + "/submissions",
    queueData,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": headerToken,
      },
      params: {
        base64_encoded: true,
        wait: false,
      },
    }
  );

  const jobToken = response.data.token;
  const submissionData = {
    userId: req.user._id,
    username: req.user.username,
    ...validatedData.data,
    token: jobToken,
    stdin: req.body?.stdin || "",
    expected: req.body?.expected || "",
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
          params: {
            base64_encoded: true,
            wait: false,
          },
        }
      );

      const result = response.data;

      // Stop checking if the submission is no longer pending
      if (result.status?.id > 2) {
        clearInterval(intervalId);

        submission.status = result?.status?.description || "";
        submission.memory = result?.memory || "";
        submission.cpu = result?.time || "";
        submission.stdout = result?.stdout || "";
        submission.stderr = result?.stderr || "";
        submission.compile = result?.compile_output || "";
        submission.statusId = result?.status?.id || "";

        submission.stdout = decodeBase64(submission.stdout);
        submission.stderr = decodeBase64(submission.stderr);
        submission.compile = decodeBase64(submission.compile);
        await submission.save();
      }
    }, 1500);

    setTimeout(async () => {
      clearInterval(intervalId);
      if (submission.status === "Processing") {
        submission.status = "Time Limit Exceeded";
        submission.statusId = "5";
        await submission.save();
      }
    }, 15000);
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

const getSubmissions = asyncHandler(async (req, res) => {
  const { page, count } = req.query;
  const parsedPage = parseInt(page, 10);
  const parsedCount = parseInt(count, 10);

  if (isNaN(parsedPage) || isNaN(parsedCount)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
  }

  let skip = parsedPage - 1;
  const limit = parsedCount;

  if (skip < 0 || limit <= 0 || limit > 100) {
    skip = 0;
  }

  skip = skip * limit;

  const submissions = await submissionModel
    .find({ userId: req.user?._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!submissions) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, submissions));
});

const getAnalytics = asyncHandler(async (req, res) => {
  if (req.user.role != "admin") {
    throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
  }

  const { page, count, username, order, languageId, statusId } = req.query;

  const parsedPage = parseInt(page, 10);
  const parsedCount = parseInt(count, 10);

  if (isNaN(parsedPage) || isNaN(parsedCount)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
  }

  let skip = parsedPage - 1;
  const limit = parsedCount;

  if (skip < 0 || limit <= 0 || limit > 100) {
    skip = 0;
  }

  skip = skip * limit;

  const queryData = {};
  if (username) {
    queryData.username = username;
  }
  if (statusId) {
    queryData.statusId = statusId;
  }

  if (languageId) {
    const parsedLanguageId = parseInt(languageId, 10);
    if (!isNaN(parsedLanguageId)) {
      queryData.languageId = parsedLanguageId;
    }
  }

  const submissions = await submissionModel
    .find(queryData)
    .sort({ createdAt: order == "true" ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  if (!submissions) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }

  const languageData = {
    50: 0,
    54: 0,
    62: 0,
    63: 0,
    71: 0,
  };
  const verdictData = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  };

  for (const item of submissions) {
    languageData[item.languageId]++;
    if (parseInt(item.statusId, 10) >= 7) {
      verdictData[7]++;
    } else {
      verdictData[item.statusId]++;
    }
  }

  const responseData = {
    language: {
      ...Object.fromEntries(
        Object.entries(languageData).filter(([key, value]) => value != 0)
      ),
    },
    verdict: {
      ...verdictData,
    },
    submissions: {
      ...submissions,
    },
  };

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, responseData));
});

export { submitCode, getResult, getSubmissions, getAnalytics };
