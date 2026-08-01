import { apiClient } from "./api";

export const DASHBOARD_API = {
  stats: "/stats",
  logs: "/logs",
} as const;

export interface DashboardStats {
  devices: number;
  users: number;
  schedulerLogs: number;
  appLogs: number;
  vectorIndexes: number;
}

export interface DashboardLogsParams {
  page: number;
  size: number;
  search?: string;
}

export const dashboardService = {
  getStats: () => apiClient.get<DashboardStats>(DASHBOARD_API.stats),

  getLogs: (params: DashboardLogsParams) =>
    apiClient.getTableData({
      path: DASHBOARD_API.logs,
      page: params.page,
      size: params.size,
      filter: { search: params.search },
    }),
};
