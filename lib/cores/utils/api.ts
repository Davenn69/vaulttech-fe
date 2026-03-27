import axios, { AxiosError } from "axios";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

console.log(API_BASE_URL);
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", response);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  },
);

export const api = {
  get: <T>(url: string, params?: any) =>
    apiClient.get<T>(url, { params }).then((res) => res.data),

  post: <T>(url: string, data?: any) =>
    apiClient.post<T>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: any) =>
    apiClient.put<T>(url, data).then((res) => res.data),

  delete: <T>(url: string) => apiClient.delete<T>(url).then((res) => res.data),
};

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
