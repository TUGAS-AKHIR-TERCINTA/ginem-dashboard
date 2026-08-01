import { useTableDataQuery } from "@/hooks/api";
import { LOGGER_API } from "@/services/loggerService";

export function useLoggerListQuery(params: {
  page: number;
  size: number;
  search?: string;
}) {
  return useTableDataQuery(LOGGER_API.list, {
    page: params.page,
    size: params.size,
    filter: { search: params.search },
  });
}
