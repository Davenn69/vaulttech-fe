import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppButton from "@/lib/cores/components/button";
import TextField from "@/lib/cores/components/custom_text_field";
import { Gap } from "@/lib/cores/components/gap";
import { textTheme } from "@/lib/cores/constants/textTheme";
import { buttonVariants } from "@/lib/cores/types/buttonTypes";
import { useAuth } from "../../../lib/features/login/(viewmodel)/auth_viewmodel";
export default function LoginPage() {
  const useLogin = useAuth();
  return (
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
          <TextField id="email" label="Email" hint="Enter your email" />
          <Gap value="pt-4"></Gap>
          <TextField
            id="password"
            label="Password"
            hint="Enter your password"
          />
          <Gap value="pt-8" />
          <AppButton label="Login" />
          <Gap value="pt-4" />
          <p>
            Forgot your password? <a href="">click here</a>
          </p>
          <Gap value="pt-4" />
          <Separator
            orientation="horizontal"
            className="border-gray2 border-t"
          />
          <Gap value="pt-8" />
          <AppButton label="Continue with Google" variant="gray" />
        </CardContent>
      </Card>
    </div>
  );
}
