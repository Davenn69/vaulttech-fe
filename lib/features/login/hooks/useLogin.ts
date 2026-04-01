"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginResponse } from "../types/loginTypes";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { supabase } from "@/lib/cores/utils/supabase";

export function useLogin() {
  const router = useRouter();
  return useMutation<
    ApiResponse<LoginResponse>,
    AxiosError<ApiResponseError>,
    LoginCredentials
  >({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data, error } =
        await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;

      const token = data.session?.access_token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.json();
    },
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      console.log(response);
      toast.success(response.message);
      const folderId = response.data.initialFolder;
      router.replace(`/home/${folderId}`);
    },
    onError: (error: AxiosError<ApiResponseError>) => {
      console.log(error.response?.data);
      console.log(`error status ${error.response?.status}`);
      console.log(`error headers ${error.response?.headers}`);
      toast.error(error.response?.data?.message ?? "");
    },
  });
}
