import { useApiGet, useTableDataQuery } from "@/hooks/api";
import {
  DASHBOARD_API,
  type DashboardStats,
} from "@/services/dashboardService";

export function useDashboardStatsQuery() {
  return useApiGet<DashboardStats>(DASHBOARD_API.stats);
}

export function useDashboardLogsQuery(params: {
  page: number;
  size: number;
  search?: string;
}) {
  return useTableDataQuery(DASHBOARD_API.logs, {
    page: params.page,
    size: params.size,
    filter: { search: params.search },
  });
}
