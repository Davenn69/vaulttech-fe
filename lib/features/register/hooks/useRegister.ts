import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RegisterRequest, RegisterResponse } from "../types/registerTypes";
import { AxiosError } from "axios";
import { ApiResponse, ApiResponseError } from "@/lib/cores/types/api_response";
import { api } from "@/lib/cores/base/service";
import toast from "react-hot-toast";
import { errorHandler, successHandler } from "@/lib/cores/utils/api";

export function useRegister() {
  const router = useRouter();
  return useMutation<
    ApiResponse<RegisterResponse>,
    AxiosError<ApiResponseError>,
    RegisterRequest
  >({
    mutationFn: (credentials: RegisterRequest) =>
      api.post("/auth/register", credentials).then((res) => {
        console.log(res.config.url);
        console.log(res.config.baseURL);
        console.log(res.data);
        return res.data;
      }),
    onSuccess: (response: ApiResponse<RegisterResponse>) => {
      successHandler(response);
      localStorage.setItem("accessToken", response.data.session.accessToken);
      localStorage.setItem("refreshToken", response.data.session.refreshToken);

      router.replace("/home");
    },
    onError: (error: AxiosError<ApiResponseError>) => {
      errorHandler(error);
    },
  });
}
