class ApiResponse {
  success: boolean;
  data: any;
  message: string | undefined;
  constructor(data: any, message = '') {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
