import axios, { AxiosError } from "axios";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import toast from "react-hot-toast";
import { supabase } from "./supabase";

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken();

    config.headers = config.headers ?? {};

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

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
    console.log("API Error:", error.response || error.message);
    return Promise.reject(error);
  },
);

export const api = {
  get: async <T>(url: string, params?: any) => {
    return apiClient.get<T>(url, { params }).then((res) => res.data);
  },
  post: async <T>(url: string, data?: any) => {
    return apiClient.post<T>(url, data).then((res) => res.data);
  },
  patch: async <T>(url: string, data?: any) => {
    return apiClient.patch<T>(url, data).then((res) => res.data);
  },

  delete: async <T>(url: string) => {
    return apiClient.delete<T>(url).then((res) => res.data);
  },
};

export function errorHandler(error: AxiosError<ApiResponseError>): void {
  console.log(error.response?.data);
  console.log(`error status ${error.response?.status}`);
  console.log(`error headers ${error.response?.headers}`);
  if (error.response?.data.message == null) return;
  toast.error(error.response?.data?.message);
}

export function successHandler<T>(response: ApiResponse<T>) {
  console.log(response);
  toast.success(response.message);
}
