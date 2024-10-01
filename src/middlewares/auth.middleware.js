import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
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
      throw new ApiError(401, "No token provided!!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      throw new ApiError(401, "Invalid token provided");
    }
    const user = await userModel
      .findById(decodedToken?._id)
      .select(
        "-password -refreshToken -emailVerificationToken -passwordResetToken"
      );

    if (!user) {
      throw new ApiError(401, "Invalid token provided");
    }

    req.user = user;
    req.flag = decodedToken?.flag;

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(401, "Token expired");
  }
});

export { verifyAccessToken };
