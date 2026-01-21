import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type TextFieldProps = {
  id: string;
  label?: string;
  hint?: string;
  onSubmit?: () => void;
};

const TextField = ({ id, label, hint, onSubmit }: TextFieldProps) => {
  return (
    <FieldSet>
      <FieldGroup className="gap-1">
        {label ? <FieldLabel>{label}</FieldLabel> : null}
        <Input
          id={id}
          placeholder={hint}
          className="h-14 rounded-10 w-full bg-gray3 border-gray2 focus:border-gray5 text-white"
        />
        <FieldError className="text-error1">Error</FieldError>
      </FieldGroup>
    </FieldSet>
  );
};

export default TextField;
