export interface ApiResponseError {
  message?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
