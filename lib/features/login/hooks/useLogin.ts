"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginResponse } from "../types/loginTypes";
import { api, nextApi } from "@/lib/cores/base/service";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";

export function useLogin() {
  const router = useRouter();
  return useMutation<
    ApiResponse<LoginResponse>,
    AxiosError<ApiResponseError>,
    LoginCredentials
  >({
    mutationFn: (credentials: LoginCredentials) =>
      nextApi.post("/api/auth/login", credentials).then((res) => {
        console.log(res.config.url);
        console.log(res.config.baseURL);
        console.log(res.data);
        return res.data;
      }),
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      console.log(response);
      toast.success(response.message);

      router.replace("/home/sada");
    },
    onError: (error: AxiosError<ApiResponseError>) => {
      console.log(error.response?.data);
      console.log(`error status ${error.response?.status}`);
      console.log(`error headers ${error.response?.headers}`);
      toast.error(error.response?.data?.message ?? "");
    },
  });
}
