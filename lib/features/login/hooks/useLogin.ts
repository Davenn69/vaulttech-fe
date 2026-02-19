"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginResponse } from "../types/auth";
import { api } from "@/lib/cores/base/service";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ApiResponseError } from "@/lib/cores/types/api_response";

export function useLogin() {
  const router = useRouter();
  return useMutation<
    LoginResponse,
    AxiosError<ApiResponseError>,
    LoginCredentials
  >({
    mutationFn: (credentials: LoginCredentials) =>
      api.post("/auth/login", credentials).then((res) => {
        console.log(res.config.url);
        console.log(res.config.baseURL);
        console.log(res.data);
        return res.data;
      }),
    onSuccess: (response: LoginResponse) => {
      console.log(response);
      localStorage.setItem("accessToken", response.data.session.accessToken);
      localStorage.setItem("refreshToken", response.data.session.refreshToken);
      toast.success(response.message);

      router.replace("/dashboard");
    },
    onError: (error: AxiosError<ApiResponseError>) => {
      console.log(error.response?.data);
      console.log(`error status ${error.response?.status}`);
      console.log(`error headers ${error.response?.headers}`);
      toast.error(error.response?.data?.message ?? "");
    },
  });
}
