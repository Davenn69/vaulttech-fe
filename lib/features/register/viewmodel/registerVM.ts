import { useRegister } from "../hooks/useRegister";
import { RegisterRequest } from "../types/registerTypes";

export function useRegisterFunction() {
  const register = useRegister();

  const onSubmit = (values: RegisterRequest) => {
    register.mutate(values);
  };

  return {
    onSubmit,
    isLoading: register.isPending,
    error: register.error,
  };
}
