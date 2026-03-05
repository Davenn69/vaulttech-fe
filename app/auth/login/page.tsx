"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, Form, useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import AppButton from "@/lib/cores/components/button";
import TextField from "@/lib/cores/components/custom_text_field";
import { Gap } from "@/lib/cores/components/gap";
import { textTheme } from "@/lib/cores/constants/textTheme";
import { buttonVariants } from "@/lib/cores/types/buttonTypes";
import { useLoginFunction } from "../../../lib/features/login/viewmodel/loginVM";
import PageWrapper from "@/lib/cores/components/page_wrapper";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[0-9]/, "At least one number"),
});

export default function LoginPage() {
  const { onSubmit, isLoading, error } = useLoginFunction();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <PageWrapper isLoading={isLoading}>
      <div className="w-full h-full flex content-center justify-center">
        <Gap value="pt-4" />
        <Card className="border border-gray2 px-12 py-4">
          <CardHeader className="flex justify-center items-center pt-4">
            <CardTitle className={textTheme.heading1}>
              Login to vaulttech
            </CardTitle>
            <CardDescription>Sign in now to start</CardDescription>
          </CardHeader>

          <CardContent className="w-full flex flex-col">
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <Gap value="pt-8" />
              <AppButton label="Login" type="submit" />
              <Gap value="pt-4" />
              {/* <p>
              Forgot your password? <a href="">click here</a>
            </p> */}
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
