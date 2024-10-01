import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { userModel } from "../models/user.model.js";
import userValidationSchema from "../validation/user.validation.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from req.body ✅
  // validate fields ✅
  // check user exists or not ✅
  // get avatar image file from req.files ✅
  // updload avatar to cloudinary ✅
  // create user and check wheater user created successfully ✅
  // return user object exluding password and refresh token ✅

  const userData = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    fullName: req.body.fullName,
  };

  const validationResult = userValidationSchema.safeParse(userData);

  if (!validationResult.success) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "All the fields are required",
          validationResult.error.errors
        )
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
    return res
      .status(409)
      .json(new ApiError(409, "user with email or username already exists"));
  }

  const localFileLocation = req.file?.path;

  if (!localFileLocation) {
    return res.status(409).json(new ApiError(409, "file is required"));
  }

  const avatarUrl = await uploadOnCloudinary(localFileLocation);

  if (!avatarUrl) {
    return res
      .status(500)
      .json(new ApiError(500, "something went wrong while uploading file"));
  }

  const user = await userModel.create({
    username: validatedUserData.username,
    email: validatedUserData.email,
    password: validatedUserData.password,
    fullName: validatedUserData.fullName,
    avatarUrl,
  });

  if (!user) {
    return res
      .status(500)
      .json(new ApiError(500, "something went wrong while updating database"));
  }

  const createdUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  console.log(createdUser);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user created successfully!"));
});

export { registerUser };
