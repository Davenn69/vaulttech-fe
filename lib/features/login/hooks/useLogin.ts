"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginResponse } from "../types/auth";
import { api } from "@/lib/cores/base/service";

export function useLogin() {
  const router = useRouter();
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) =>
      api.post("/auth/login", credentials).then((res) => res.data),
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem("token", data.token);
    },
    onError: (error: Error) => {
      console.log("Login failed", error);
    },
  });
}
