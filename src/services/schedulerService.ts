import { apiClient } from "./api";
import type { PaginatedResponse } from "./types";

export const SCHEDULER_API = {
  list: "/scheduler-logs",
} as const;

export interface SchedulerListParams {
  page: number;
  size: number;
  search?: string;
}

export interface SchedulerLogItem {
  schedulerLogId: number;
  jobId?: string;
  type?: string;
  deviceName?: string;
  state?: string;
  delayMinutes?: number;
  scheduledAt?: string;
  runAt?: string;
  executedAt?: string;
  status?: string;
}

export const schedulerService = {
  getList: (
    params: SchedulerListParams,
  ): Promise<PaginatedResponse<SchedulerLogItem>> =>
    apiClient.getTableData<SchedulerLogItem>({
      path: SCHEDULER_API.list,
      page: params.page,
      size: params.size,
      filter: { search: params.search },
    }),
};
