export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface RegisterResponse {
  session: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
  };
}
