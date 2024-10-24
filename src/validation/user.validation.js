import { z } from "zod";

// Custom regex for username validation
const usernameRegex = /^[a-zA-Z0-9_]+$/;

// Custom regex for fullName validation
const fullNameRegex = /^[a-zA-Z\s]+$/;

const userValidationSchema = z.object({
  username: z
    .preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z
        .string()
        .min(1, { message: "username is required" })
        .regex(usernameRegex, {
          message:
            "username can only contain alphabets, numbers, and underscores",
        })
    )
    .transform((val) => val.toLowerCase()),
  email: z
    .preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z.string().email({ message: "Invalid email address" })
    )
    .transform((val) => val.toLowerCase()),
  password: z.string().min(8, { message: "password is required" }),
  fullName: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z
      .string()
      .min(1, { message: "full name is required" })
      .regex(fullNameRegex, { message: "full name can only contain alphabets" })
  ),
});

export default userValidationSchema;
