import { apiClient } from "./api";
import type { PaginatedResponse } from "./types";

export const LOGGER_API = {
  list: "/logs",
} as const;

export interface LoggerListParams {
  page: number;
  size: number;
  search?: string;
}

export const loggerService = {
  getList: (params: LoggerListParams): Promise<PaginatedResponse<unknown>> =>
    apiClient.getTableData({
      path: LOGGER_API.list,
      page: params.page,
      size: params.size,
      filter: { search: params.search },
    }),
};
