import { create } from "zustand";
import { AuthStore } from "../(model)/login_form_model";

export const useAuth = create<AuthStore>((set) => ({
  form: {
    user: "",
    password: "",
  },
  setUser: (user) => set((state) => ({ form: { ...state.form, user } })),
  setPassword: (password) =>
    set((state) => ({ form: { ...state.form, password } })),
  resetForm: () =>
    set({
      form: {
        user: "",
        password: "",
      },
    }),
}));
