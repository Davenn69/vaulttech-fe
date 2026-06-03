"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppButton from "@/lib/cores/components/button";
import TextField from "@/lib/cores/components/custom_text_field";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import { textTheme } from "@/lib/cores/constants/textTheme";
import { useRegisterFunction } from "@/lib/features/register/viewmodel/registerVM";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(36, "Username must be under 36 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { onSubmit, isLoading } = useRegisterFunction();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    },
  });

  return (
    <PageWrapper isLoading={isLoading} className="min-h-dvh items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <Card className="border-white/10 bg-[#0f1726]/85 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <CardHeader className="space-y-2 p-8 pb-4">
            <CardTitle className={textTheme.heading1}>Create account</CardTitle>
            <CardDescription className="text-gray1">
              Set up your VaultTech account.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="username"
                    label="Username"
                    hint="Choose a username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="email"
                    label="Email"
                    type="email"
                    hint="name@company.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="password"
                    label="Password"
                    isPassword
                    hint="Create a password"
                    autoComplete="new-password"
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="confirmPassword"
                    label="Confirm password"
                    isPassword
                    hint="Re-enter your password"
                    autoComplete="new-password"
                    error={fieldState.error?.message}
                  />
                )}
              />

              <AppButton label="Register" type="submit" />

              <p className="text-center text-sm text-gray1">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-white transition-colors hover:text-blue2"
                >
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
