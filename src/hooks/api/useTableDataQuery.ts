import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { queryKeys } from "@/services/query-keys";
import { useApiErrorHandler } from "./useApiErrorHandler";

export function useTableDataQuery<T>(
  path: string,
  options: {
    page: number;
    size: number;
    filter?: Record<string, string | undefined>;
    enabled?: boolean;
    refetchInterval?: number | false;
  },
) {
  const onError = useApiErrorHandler();
  const filterKey = JSON.stringify(
    Object.fromEntries(
      Object.entries(options.filter ?? {}).filter(
        ([, value]) => value != null && value !== "",
      ),
    ),
  );

  return useQuery({
    queryKey: queryKeys.table(path, {
      page: options.page,
      size: options.size,
      filterKey,
    }),
    queryFn: async () => {
      try {
        return await apiClient.getTableData<T>({
          path,
          page: options.page,
          size: options.size,
          filter: options.filter,
        });
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
  });
}
