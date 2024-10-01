class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    };
  }
}

export { ApiResponse };
