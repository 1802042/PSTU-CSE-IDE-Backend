import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const verifyAccessToken = asyncHandler(async (req, _, next) => {
  // extract jwt token from cookies and / or authorization header ✅
  // verify jwt token ✅
  // add user to req ✅
  // call next middleware ✅

  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }
    const user = await userModel
      .findById(decodedToken?._id)
      .select(
        "-password -refreshToken -emailVerificationToken -passwordResetToken"
      );

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    req.user = user;
    req.flag = decodedToken?.flag;

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
  }
});

const verifyRefreshToken = asyncHandler(async (req, _, next) => {
  // extract refreshToken from cookies / body ✅
  // decode refreshToken to extract id ✅
  // fetch user from db and compare refreshToken ✅
  // call next middleware ✅

  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) {
      throw new ApiError(StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN);
    }
    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -emailVerificationToken -passwordResetToken");

    if (!user || user?.refreshToken !== token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const newUser = await userModel
      .findById(decodedToken?._id)
      .select(
        "-password -refreshToken -emailVerificationToken -passwordResetToken"
      );

    if (!newUser) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    req.user = newUser;

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
  }
});

export { verifyAccessToken, verifyRefreshToken };
