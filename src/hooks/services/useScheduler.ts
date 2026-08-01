import { useTableDataQuery } from "@/hooks/api";
import {
  SCHEDULER_API,
  type SchedulerLogItem,
} from "@/services/schedulerService";

export function useSchedulerListQuery(params: {
  page: number;
  size: number;
  search?: string;
}) {
  return useTableDataQuery<SchedulerLogItem>(SCHEDULER_API.list, {
    page: params.page,
    size: params.size,
    filter: { search: params.search },
  });
}
