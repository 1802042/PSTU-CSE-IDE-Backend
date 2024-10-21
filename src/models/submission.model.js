import mongoose, { Schema } from "mongoose";
import { userModel } from "./user.model.js";
import { string } from "zod";

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "userModel", // Refers to the user model
      required: true,
    },
    status: {
      type: String,
      default: "Processing",
    },
    sourceCode: {
      type: String,
      required: true,
    },
    languageId: {
      type: Number,
      enum: [50, 54, 62, 63, 71],
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    stdin: {
      type: String,
      default: "",
    },
    testCase: {
      type: String,
      default: "",
    },
    stdout: {
      type: String,
      default: "",
    },
    stderr: {
      type: String,
      default: "",
    },
    memory: {
      type: Number, // Memory used in KB
      default: 0,
    },
    cpu: {
      type: String, // CPU time used in MS
      default: "0",
    },
  },
  {
    timestamps: true,
  }
);

export const submissionModel = mongoose.model(
  "submissionModel",
  submissionSchema
);
