class ApiResponse {
  constructor(status, message = "success", data = null, success = true) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = success;
  }

  toJSON() {
    return {
      status: this.status,
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }
}

export { ApiResponse };
