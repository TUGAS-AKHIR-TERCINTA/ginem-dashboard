import { useApiGet, useTableDataQuery } from "@/hooks/api";
import { useServiceDeleteMutation } from "@/hooks/api/useApiMutations";
import { RULE_API, ruleService } from "@/services/ruleService";
import type { IRule, IRuleExecutionLog } from "@/types/Rule";

export function useRuleListQuery(params: {
  page: number;
  size: number;
  search?: string;
  isActive?: boolean;
}) {
  return useTableDataQuery<IRule>(RULE_API.list, {
    page: params.page,
    size: params.size,
    filter: {
      search: params.search,
      isActive: params.isActive == null ? undefined : String(params.isActive),
    },
  });
}

export function useRuleDetailQuery(ruleId?: string) {
  return useApiGet<IRule>(ruleId ? RULE_API.detail(ruleId) : "", {
    enabled: Boolean(ruleId),
  });
}

export function useRuleExecutionLogsQuery(params: {
  page: number;
  size: number;
  ruleId?: string | number;
  enabled?: boolean;
}) {
  return useTableDataQuery<IRuleExecutionLog>(RULE_API.executionLogs, {
    page: params.page,
    size: params.size,
    filter: {
      ruleId:
        params.ruleId == null || params.ruleId === ""
          ? undefined
          : String(params.ruleId),
    },
    enabled: params.enabled ?? true,
  });
}

export function useDeleteRuleMutation() {
  return useServiceDeleteMutation(ruleService.delete, {
    invalidateTablePaths: [RULE_API.list, RULE_API.executionLogs],
    successMessage: "Rule deleted.",
  });
}
