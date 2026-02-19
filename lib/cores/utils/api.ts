import { AxiosError } from "axios";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import toast from "react-hot-toast";

export function errorHandler(error: AxiosError<ApiResponseError>): void {
  console.log(error.response?.data);
  console.log(`error status ${error.response?.status}`);
  console.log(`error headers ${error.response?.headers}`);
  toast.error(error.response?.data?.message ?? "");
}

export function successHandler<T>(response: ApiResponse<T>) {
  console.log(response);
  toast.success(response.message);
}
