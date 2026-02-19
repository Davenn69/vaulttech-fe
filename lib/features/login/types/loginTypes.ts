export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    session: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      id: string;
    };
  };
}
