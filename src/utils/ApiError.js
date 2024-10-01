class ApiError extends Error {
  constructor(
    status,
    message = "something went wrong",
    errors = [],
    success = false
  ) {
    super(message);
    this.status = status;
    this.success = success;
    this.message = message;
    this.errors = errors;
  }

  toJSON() {
    return {
      status: this.status,
      success: this.success,
      message: this.message,
      errors: this.errors,
    };
  }
}

export { ApiError };
