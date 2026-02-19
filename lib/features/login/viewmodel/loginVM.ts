"use client";

import { useQuery } from "@tanstack/react-query";
import { useLogin } from "../hooks/useLogin";
import { LoginCredentials } from "../types/loginTypes";

export function useLoginFunction() {
  const login = useLogin();

  const onSubmit = (values: LoginCredentials) => {
    login.mutate(values);
  };

  return {
    onSubmit,
    isLoading: login.isPending,
    error: login.error,
  };
}
