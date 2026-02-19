"use client";

import { create } from "zustand";
import { AuthStore } from "../model/login_form_model";
import { useQuery } from "@tanstack/react-query";
import { useLogin } from "../hooks/useLogin";
import { LoginCredentials } from "../types/auth";

export function useLoginFunction() {
  const login = useLogin();

  const onSubmit = (values: LoginCredentials) => {
    console.log("hello");
    login.mutate(values);
  };

  return {
    onSubmit,
    isLoading: login.isPending,
    error: login.error,
  };
}

export const useAuth = create<AuthStore>((set) => ({
  form: {
    user: "",
    password: "",
  },
  setUser: (user) => set((state) => ({ form: { ...state.form, user } })),
  setPassword: (password) =>
    set((state) => ({ form: { ...state.form, password } })),
  resetForm: () =>
    set({
      form: {
        user: "",
        password: "",
      },
    }),
}));
