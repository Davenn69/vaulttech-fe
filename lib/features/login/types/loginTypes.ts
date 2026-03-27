export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
  };
  initialFolder: string;
}
