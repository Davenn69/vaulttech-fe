import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label?: string;
  hint?: string;
  onSubmit?: () => void;
  error?: string;
};

const TextField = ({
  id,
  label,
  hint,
  onSubmit,
  error,
  ...field
}: TextFieldProps) => {
  return (
    <FieldSet className="w-full">
      <FieldGroup className="gap-1">
        {label ? <FieldLabel>{label}</FieldLabel> : null}
        <Input
          {...field}
          id={id}
          placeholder={hint}
          className="p-4 rounded-10 w-full bg-gray3 border-gray2 focus:border-gray5 text-white"
        />
        {error ? (
          <FieldError className="text-error1">{error}</FieldError>
        ) : null}
      </FieldGroup>
    </FieldSet>
  );
};

export default TextField;
