import axios, { AxiosError } from "axios";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import toast from "react-hot-toast";
import { supabase } from "./supabase";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`headers configuration ${config.headers}`);
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
  get: async <T>(url: string, params?: any) => {
    const headers = await getAuthHeaders();
    console.log(`headers ${JSON.stringify(headers)}`);
    return apiClient.get<T>(url, { params, headers }).then((res) => res.data);
  },
  post: async <T>(url: string, data?: any) => {
    const headers = await getAuthHeaders();
    return apiClient.post<T>(url, data, headers).then((res) => res.data);
  },

  put: async <T>(url: string, data?: any) => {
    const headers = await getAuthHeaders();
    return apiClient.put<T>(url, data, headers).then((res) => res.data);
  },

  delete: async <T>(url: string) => {
    const headers = await getAuthHeaders();
    return apiClient.delete<T>(url, headers).then((res) => res.data);
  },
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
