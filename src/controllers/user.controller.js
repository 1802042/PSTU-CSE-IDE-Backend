import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { userModel } from "../models/user.model.js";
import userValidationSchema from "../validation/user.validation.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import fs from "fs";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from req.body ✅
  // validate fields ✅
  // check user exists or not ✅
  // get avatar image file from req.files ✅
  // updload avatar to cloudinary and delete file✅
  // create user and check wheater user created successfully ✅
  // return user object exluding password and refresh token ✅

  const userData = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    fullName: req.body.fullName,
  };

  const localFileLocation = req.file?.path;

  if (!localFileLocation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
  }

  const validationResult = userValidationSchema.safeParse(userData);

  if (!validationResult.success) {
    fs.unlinkSync(localFileLocation); // delete saved file
    throw new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      ReasonPhrases.UNPROCESSABLE_ENTITY,
      validationResult.error.errors
    );
  }

  const validatedUserData = validationResult.data;
  const userExists = await userModel.findOne({
    $or: [
      { username: validatedUserData.username },
      { email: validatedUserData.email },
    ],
  });

  if (userExists) {
    fs.unlinkSync(localFileLocation); // delete saved file
    throw new ApiError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT);
  }

  const avatarUrl = await uploadOnCloudinary(localFileLocation);

  if (!avatarUrl) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }

  const user = await userModel.create({
    username: validatedUserData.username,
    email: validatedUserData.email,
    password: validatedUserData.password,
    fullName: validatedUserData.fullName,
    avatarUrl,
  });

  if (!user) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }

  const createdUser = await userModel
    .findById(user._id)
    .select(
      "-password -refreshToken -emailVerificationToken -passwordResetToken"
    );

  if (!createdUser) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, createdUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // get user details from req.body ✅
  // validate details ✅
  // check user exists or not by username and/or email ✅
  // check password ✅
  // generate access token and refresh token ✅
  // return access token and refresh token through cookies ✅

  const userLoginValidationSchema = userValidationSchema.omit({
    fullName: true,
  });

  const userData = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  const validationResult = userLoginValidationSchema.safeParse(userData);

  if (!validationResult.success) {
    throw new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      ReasonPhrases.UNPROCESSABLE_ENTITY,
      validationResult.error.errors
    );
  }

  const validatedUserData = validationResult.data;
  const user = await userModel.findOne({
    $and: [
      { username: validatedUserData.username },
      { email: validatedUserData.email },
    ],
  });

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
  }

  const checkPassword = await user.isPasswordCorrect(
    validatedUserData.password
  );

  if (!checkPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
  }

  const accessToken = user.generateAccessToken(true);
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({
    validateBeforeSave: false,
  });

  const updatedUser = await userModel
    .findById(user._id)
    .select(
      "-password -refreshToken -emailVerificationToken -passwordResetToken"
    );

  const options = {
    httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript
    secure: true,
    sameSite: "strict", // Cookie is only sent for same-site requests
    path: "/", // Set the path for the cookie
  };

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, {
        user: updatedUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // extract user details from req.user ✅
  // delete refreshToken value from database ✅
  // delete accesstoken and refreshtoken from cookie ✅

  try {
    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: null,
        },
      }
      // {
      //   new: true,
      // }
    );

    const options = {
      httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript
      secure: true,
      sameSite: "strict", // Cookie is only sent for same-site requests
      path: "/", // Set the path for the cookie
    };

    // .cookie("accessToken", "", { expires: new Date(0) })
    // .cookie("refreshToken", "", { expires: new Date(0) })
    return res
      .status(StatusCodes.NO_CONTENT)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(StatusCodes.NO_CONTENT, ReasonPhrases.NO_CONTENT));
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR
    );
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // generate accessToken ✅
  // save cookies ✅

  try {
    const newAccessToken = await req.user?.generateAccessToken();

    if (!newAccessToken) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }

    const options = {
      httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript
      secure: true,
      sameSite: "strict", // Cookie is only sent for same-site requests
      path: "/", // Set the path for the cookie
    };

    return res
      .status(StatusCodes.NO_CONTENT)
      .cookie("accessToken", newAccessToken, options)
      .json(new ApiResponse(StatusCodes.NO_CONTENT, ReasonPhrases.NO_CONTENT));
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
  }
  const passwordValidationSchema = userValidationSchema.omit({
    username: true,
    fullName: true,
    email: true,
  });

  const validatedOldPassword = passwordValidationSchema.safeParse({
    password: oldPassword,
  });

  if (!validatedOldPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
  }

  const validatedNewPassword = passwordValidationSchema.safeParse({
    password: newPassword,
  });

  if (!validatedNewPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
  }

  const userID = req.user?._id;
  if (!userID) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
  }
  const user = await userModel.findById(userID);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
  }
  const isPasswordCorrect = await user.isPasswordCorrect(
    validatedOldPassword.data.password
  );
  if (!isPasswordCorrect) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
  }
  user.password = validatedNewPassword.data.password;
  await user.save({ validateBeforeSave: false });
  return res
    .status(StatusCodes.NO_CONTENT)
    .json(new ApiResponse(StatusCodes.NO_CONTENT, ReasonPhrases.NO_CONTENT));
});

const getCurrentUser = asyncHandler((req, res) => {
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, req.user));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  getCurrentUser,
};
