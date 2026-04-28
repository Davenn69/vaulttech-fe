import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RegisterRequest, RegisterResponse } from "../types/registerTypes";
import { AxiosError } from "axios";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { errorHandler, successHandler } from "@/lib/cores/utils/api";
import { supabase } from "@/lib/cores/utils/supabase";
import { folderStorage } from "@/lib/cores/utils/local";

export function useRegister() {
  const router = useRouter();
  return useMutation<
    ApiResponse<RegisterResponse>,
    AxiosError<ApiResponseError>,
    RegisterRequest
  >({
    mutationFn: async (credentials: RegisterRequest) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            username: credentials.username,
          }),
        },
      );

      const data: ApiResponse<RegisterResponse> | ApiResponseError =
        await res.json();

      if (!res.ok) {
        throw {
          response: {
            data,
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
          },
        } as AxiosError<ApiResponseError>;
      }

      return data as ApiResponse<RegisterResponse>;
    },
    onSuccess: async (response: ApiResponse<RegisterResponse>) => {
      console.log("how");
      console.log(response.data.session);
      // Set session for user
      const session = response.data.session as
        | {
            accessToken?: string;
            refreshToken?: string;
            access_token?: string;
            refresh_token?: string;
          }
        | undefined;

      const accessToken = session?.accessToken ?? session?.access_token;
      const refreshToken = session?.refreshToken ?? session?.refresh_token;

      console.log(`here ${accessToken}`);
      console.log(`here ${refreshToken}`);

      if (!accessToken || !refreshToken) {
        throw {
          response: {
            data: {
              message:
                "Register succeeded, but session tokens are missing in response.",
            },
          },
        } as AxiosError<ApiResponseError>;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) {
        throw {
          response: {
            data: {
              message: sessionError.message,
            },
          },
        } as AxiosError<ApiResponseError>;
      }

      successHandler(response);
      const folderId = response.data.initialFolder;
      folderStorage.setParentFolderId(folderId);
      router.replace(`/repo/${folderId}`);
    },
    onError: (error: AxiosError<ApiResponseError>) => {
      errorHandler(error);
    },
  });
}
