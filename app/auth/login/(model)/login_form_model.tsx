interface LoginFormModel {
  user: string;
  password: string;
}

export interface AuthStore {
  form: LoginFormModel;
  setUser: (user: string) => void;
  setPassword: (password: string) => void;
  resetForm: () => void;
}
