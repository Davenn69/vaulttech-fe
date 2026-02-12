import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type TextFieldProps = {
  id: string;
  label?: string;
  hint?: string;
  onSubmit?: () => void;
  error?: string;
};

const TextField = ({ id, label, hint, onSubmit, error }: TextFieldProps) => {
  return (
    <FieldSet className="w-full">
      <FieldGroup className="gap-1">
        {label ? <FieldLabel>{label}</FieldLabel> : null}
        <Input
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
