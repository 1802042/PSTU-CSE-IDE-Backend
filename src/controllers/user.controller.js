import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { userModel } from "../models/user.model.js";
import userValidationSchema from "../validation/user.validation.js";
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
    throw new ApiError(409, "file is required");
  }

  const validationResult = userValidationSchema.safeParse(userData);

  if (!validationResult.success) {
    fs.unlinkSync(localFileLocation); // delete saved file
    throw new ApiError(
      400,
      "All the fields are required",
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
    throw new ApiError(409, "user with email or username already exists");
  }

  console.log(localFileLocation);
  const avatarUrl = await uploadOnCloudinary(localFileLocation);

  if (!avatarUrl) {
    throw new ApiError(500, "something went wrong while uploading file");
  }

  const user = await userModel.create({
    username: validatedUserData.username,
    email: validatedUserData.email,
    password: validatedUserData.password,
    fullName: validatedUserData.fullName,
    avatarUrl,
  });

  if (!user) {
    throw new ApiError(500, "something went wrong while updating database");
  }

  const createdUser = await userModel
    .findById(user._id)
    .select(
      "-password -refreshToken -emailVerificationToken -passwordResetToken"
    );

  console.log(createdUser);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user created successfully!"));
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
      400,
      "All the fields are required",
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
    throw new ApiError(401, "Unauthorized access: User not found");
  }

  const checkPassword = await user.isPasswordCorrect(
    validatedUserData.password
  );

  if (!checkPassword) {
    throw new ApiError(401, "Password does not match");
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
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User login successful", {
        user: updatedUser,
        accessToken,
        refreshToken,
      })
    );
});

export { registerUser, loginUser };
