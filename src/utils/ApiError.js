class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
    };
  }
}

export { ApiError };
