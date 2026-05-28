import {
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { InputHTMLAttributes, useState } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  isPassword?: boolean;
};

const TextField = ({
  id,
  label,
  hint,
  error,
  isPassword = false,
  type,
  ...field
}: TextFieldProps) => {
  const [seePassword, setSeePassword] = useState<boolean>(false);
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldSet className="w-full">
      <FieldGroup className="gap-1.5">
        {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
        <div className="relative">
          <Input
            {...field}
            id={id}
            type={isPassword ? (seePassword ? "text" : "password") : type ?? "text"}
            placeholder={hint}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className="h-12 w-full rounded-xl border-gray2/80 bg-black2/80 px-4 text-white placeholder:text-gray4 shadow-sm transition-colors focus:border-blue2 focus:ring-2 focus:ring-blue1/20"
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setSeePassword(!seePassword)}
              aria-label={seePassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue1/40"
            >
              {seePassword ? (
                <Image
                  width={24}
                  height={24}
                  src="/assets/icons/See_Password.svg"
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <Image
                  width={24}
                  height={24}
                  src="/assets/icons/Password_Off.svg"
                  alt=""
                  aria-hidden="true"
                />
              )}
            </button>
          )}
        </div>

        {error ? (
          <FieldError id={errorId} className="text-error1">
            {error}
          </FieldError>
        ) : null}
      </FieldGroup>
    </FieldSet>
  );
};

export default TextField;
