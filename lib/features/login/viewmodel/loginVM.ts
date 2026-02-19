"use client";

import { create } from "zustand";
import { AuthStore } from "../model/login_form_model";
import { useQuery } from "@tanstack/react-query";
import { useLogin } from "../hooks/useLogin";
import { LoginCredentials } from "../types/auth";

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
