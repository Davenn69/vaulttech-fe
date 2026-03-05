import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputHTMLAttributes, useState } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label?: string;
  hint?: string;
  onSubmit?: () => void;
  error?: string;
  isPassword?: boolean;
};

const TextField = ({
  id,
  label,
  hint,
  onSubmit,
  error,
  isPassword = false,
  ...field
}: TextFieldProps) => {
  const [seePassword, setSeePassword] = useState<boolean>(false);
  return (
    <FieldSet className="w-full">
      <FieldGroup className="gap-1">
        {label ? <FieldLabel>{label}</FieldLabel> : null}
        <div className="relative">
          <Input
            {...field}
            id={id}
            type={isPassword && !seePassword ? "password" : undefined}
            placeholder={hint}
            className="p-4 rounded-10 w-full bg-gray3 border-gray2 focus:border-gray5 text-white"
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setSeePassword(!seePassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray4 hover:text-white"
            >
              {seePassword ? (
                <img
                  width="24"
                  height="24"
                  src="/assets/icons/See_Password.svg"
                ></img>
              ) : (
                <img
                  width="24"
                  height="24"
                  src="/assets/icons/Password_Off.svg"
                ></img>
              )}
            </button>
          )}
        </div>

        {error ? (
          <FieldError className="text-error1">{error}</FieldError>
        ) : null}
      </FieldGroup>
    </FieldSet>
  );
};

export default TextField;
