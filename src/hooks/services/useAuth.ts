import { useMutation } from "@tanstack/react-query";
import { useApiErrorHandler } from "@/hooks/api/useApiErrorHandler";
import {
  authService,
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
} from "@/services/authService";

export function useLoginMutation() {
  const onError = useApiErrorHandler();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onError,
  });
}

export function useRegisterMutation() {
  const onError = useApiErrorHandler();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onError,
  });
}

export type { LoginResponse };
