"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginResponse } from "../types/loginTypes";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { supabase } from "@/lib/cores/utils/supabase";
import { folderStorage } from "@/lib/cores/utils/local";

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
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        },
      );

      return res.json();
    },
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      console.log(response);
      toast.success(response.message);
      const folderId = response.data.initialFolder;
      folderStorage.setParentFolderId(folderId);
      router.replace(`/repo/${folderId}`);
    },
    onError: (error: AxiosError<ApiResponseError>) => {
      toast.error(error.message ?? "");
    },
  });
}
