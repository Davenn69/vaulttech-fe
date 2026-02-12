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
  margin?: string;
};

const AppButton = ({
  label,
  onClick,
  disabled = false,
  borderRadius = "rounded-10",
  size = "text-base",
  variant = "blue",
  margin,
}: ButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${borderRadius} font-[500] ${size} p-4 ${buttonVariants[variant]}`}
    >
      {label}
    </Button>
  );
};

export default AppButton;
