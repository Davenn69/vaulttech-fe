import { Button } from "@/components/ui/button";
import { ButtonVariant, buttonVariants } from "../types/buttonTypes";

export type ButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  borderRadius?: string;
  size?: string;
  backgroundColor?: string;
  variant?: ButtonVariant;
};

const AppButton = ({
  label,
  onClick,
  disabled = false,
  borderRadius = "rounded-10",
  size = "text-base",
  variant = "blue",
}: ButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${borderRadius} font-bold ${size} p-4 ${buttonVariants[variant]}`}
    >
      {label}
    </Button>
  );
};

export default AppButton;
