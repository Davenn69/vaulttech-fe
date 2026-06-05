"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import AppButton from "@/lib/cores/components/button";
import TextField from "@/lib/cores/components/custom_text_field";
import PageWrapper from "@/lib/cores/components/page_wrapper";
import { textTheme } from "@/lib/cores/constants/textTheme";
import { useLoginFunction } from "../../../lib/features/login/viewmodel/loginVM";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export default function LoginPage() {
  const { onSubmit, isLoading } = useLoginFunction();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <PageWrapper
      isLoading={isLoading}
      className="min-h-dvh items-center px-4 py-8 sm:px-6"
    >
      <div className="w-full max-w-md">
        <Card className="border-white/10 bg-[#0f1726]/85 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <CardHeader className="space-y-2 p-8 pb-4">
            <CardTitle className={textTheme.heading1}>Log in</CardTitle>
            <CardDescription className="text-gray1">
              Access your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                    hint="Enter your password"
                    autoComplete="current-password"
                    error={fieldState.error?.message}
                  />
                )}
              />

              <AppButton label="Log in" type="submit" />

              <p className="text-center text-sm text-gray1">
                No account yet?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-white transition-colors hover:text-blue2"
                >
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
