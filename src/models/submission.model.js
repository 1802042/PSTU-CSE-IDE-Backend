import mongoose, { Schema } from "mongoose";
import { userModel } from "./user.model.js";

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "userModel", // Refers to the user model
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "judging", "completed", "failed"],
      default: "pending",
    },
    code: {
      type: String,
      required: true,
    },
    languageId: {
      type: Number,
      enum: [1, 2, 3, 50], // Define allowed integer values for languageId
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
    cpuTime: {
      type: Number, // CPU time used in milli-seconds
      default: 0,
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
