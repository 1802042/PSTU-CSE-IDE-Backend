// middlewares/errorHandler.middleware.js
import { MulterError } from "multer";
import { ApiError } from "../utils/ApiError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      throw new ApiError(
        StatusCodes.REQUEST_TOO_LONG,
        ReasonPhrases.REQUEST_TOO_LONG,
        err.MulterError
      );
    }

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      err.MulterError
    );
  }

  next(err);
};
