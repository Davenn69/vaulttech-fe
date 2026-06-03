import { Button } from "@/components/ui/button";
import { ButtonVariant, buttonVariants } from "../types/buttonTypes";

export type ButtonProps = {
  label: string;
  type?: "button" | "submit" | "reset";
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
  type = undefined,
  disabled = false,
  borderRadius = "rounded-xl",
  size = "text-base",
  variant = "blue",
}: ButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`w-full ${borderRadius} px-4 py-3 font-semibold shadow-sm transition-transform duration-150 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue1/40 ${size} ${buttonVariants[variant]}`}
    >
      {label}
    </Button>
  );
};

export default AppButton;
