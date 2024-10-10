import { rateLimit } from "express-rate-limit";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";

// Create a rate limiter
const ipRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      ReasonPhrases.TOO_MANY_REQUESTS
    );
  },
});

export { ipRateLimiter };
