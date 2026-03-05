"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppButton from "@/lib/cores/components/button";
import TextField from "@/lib/cores/components/custom_text_field";
import { Gap } from "@/lib/cores/components/gap";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import { textTheme } from "@/lib/cores/constants/textTheme";
import { useRegisterFunction } from "@/lib/features/register/viewmodel/registerVM";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number"),
    username: z.string().max(36, "Username must be under 36 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { onSubmit, isLoading, error } = useRegisterFunction();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    },
  });

  return (
    <PageWrapper isLoading={isLoading}>
      <div className="w-full h-full flex content-center justify-center">
        <Gap value="pt-4" />
        <Card className="border border-gray2 px-12 py-4">
          <CardHeader className="flex justify-center items-center pt-4">
            <CardTitle className={textTheme.heading1}>
              Register an account
            </CardTitle>
            <CardDescription>
              Start registering to unlock VaultTech’s awesome features
            </CardDescription>
          </CardHeader>

          <CardContent className="w-full flex flex-col">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="username"
                    label="Username"
                    hint="Enter your username"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Gap value="pt-4"></Gap>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="email"
                    label="Email"
                    hint="Enter your email"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Gap value="pt-4"></Gap>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="password"
                    label="Password"
                    isPassword={true}
                    hint="Enter your password"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Gap value="pt-4"></Gap>
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    id="confirmPassword"
                    label="Confirm Password"
                    isPassword={true}
                    hint="Re-enter your password"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Gap value="pt-8" />
              <AppButton label="Register" type="submit" />
              <Gap value="pt-4" />
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
