import { useTableDataQuery } from "@/hooks/api";
import { useServiceDeleteMutation } from "@/hooks/api/useApiMutations";
import {
  SCHEDULER_API,
  schedulerService,
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

export function useDeleteSchedulerLogMutation() {
  return useServiceDeleteMutation(schedulerService.delete, {
    invalidateTablePaths: [SCHEDULER_API.list],
    successMessage: "Scheduler log deleted.",
  });
}
