import { apiClient } from "./api";

export interface LoginPayload {
  userEmail: string;
  userPassword: string;
}

export interface LoginResponse {
  data: {
    accessToken: string;
  };
}

export interface RegisterPayload {
  userName: string;
  userEmail: string;
  userPassword: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post("/auth/register/users", payload),
};
