import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import userValidationSchema from "../validation/user.validation.js";
import { userModel } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from req.body ✅
  // validate fields ✅
  // check user exists or not ✅
  // get avatar image file from req.files
  // updload avatar to cloudinary
  // create user
  // check wheater user created successfully
  // return user object exluding password and refresh token

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
});

export { registerUser };
