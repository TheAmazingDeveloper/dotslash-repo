class ApiResponse {
  constructor(success, data = null, message = "error") {
    this.success = success;
    this.data = data;
    this.message = message;
  }
}

export default ApiResponse;
