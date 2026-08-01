import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { queryKeys } from "@/services/query-keys";
import { useAppContext } from "@/context/app.context";
import { useApiErrorHandler } from "./useApiErrorHandler";

type MutationOptions<TData> = {
  onSuccess?: (data: TData) => void;
  invalidateTablePaths?: string[];
  invalidateGetPaths?: string[];
  successMessage?: string;
};

function useInvalidateOnSuccess<TData>(options?: MutationOptions<TData>) {
  const queryClient = useQueryClient();
  const { setAppAlert } = useAppContext();

  return (data: TData) => {
    options?.invalidateTablePaths?.forEach((path) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tableRoot(path) }),
    );
    options?.invalidateGetPaths?.forEach((path) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.get(path) }),
    );
    if (options?.successMessage) {
      setAppAlert({
        isDisplayAlert: true,
        message: options.successMessage,
        alertType: "success",
      });
    }
    options?.onSuccess?.(data);
  };
}

export function useApiPostMutation<TData = unknown, TBody = unknown>(
  options?: MutationOptions<TData>,
) {
  const onError = useApiErrorHandler();
  const onSuccess = useInvalidateOnSuccess(options);

  return useMutation({
    mutationFn: ({ path, body }: { path: string; body: TBody }) =>
      apiClient.post<TData>(path, body),
    onError,
    onSuccess,
  });
}

export function useApiPatchMutation<TData = unknown, TBody = unknown>(
  options?: MutationOptions<TData>,
) {
  const onError = useApiErrorHandler();
  const onSuccess = useInvalidateOnSuccess(options);

  return useMutation({
    mutationFn: ({ path, body }: { path: string; body: TBody }) =>
      apiClient.patch<TData>(path, body),
    onError,
    onSuccess,
  });
}

export function useApiDeleteMutation<TData = unknown>(
  options?: MutationOptions<TData>,
) {
  const onError = useApiErrorHandler();
  const onSuccess = useInvalidateOnSuccess(options);

  return useMutation({
    mutationFn: ({ path }: { path: string }) => apiClient.remove<TData>(path),
    onError,
    onSuccess,
  });
}

export function useServicePostMutation<TData = unknown, TBody = unknown>(
  mutationFn: (body: TBody) => Promise<TData>,
  options?: MutationOptions<TData>,
) {
  const onError = useApiErrorHandler();
  const onSuccess = useInvalidateOnSuccess(options);

  return useMutation({
    mutationFn,
    onError,
    onSuccess,
  });
}

export function useServicePatchMutation<TData = unknown, TBody = unknown>(
  mutationFn: (body: TBody) => Promise<TData>,
  options?: MutationOptions<TData>,
) {
  const onError = useApiErrorHandler();
  const onSuccess = useInvalidateOnSuccess(options);

  return useMutation({
    mutationFn,
    onError,
    onSuccess,
  });
}

export function useServiceDeleteMutation<TData = unknown, TVariables = number>(
  mutationFn: (id: TVariables) => Promise<TData>,
  options?: MutationOptions<TData>,
) {
  const onError = useApiErrorHandler();
  const onSuccess = useInvalidateOnSuccess(options);

  return useMutation({
    mutationFn,
    onError,
    onSuccess,
  });
}
