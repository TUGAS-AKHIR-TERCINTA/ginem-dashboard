import type { IRule, IRuleExecutionLog } from "@/types/Rule";
import { apiClient } from "./api";
import type { PaginatedResponse } from "./types";

export const RULE_API = {
  list: "/rules",
  detail: (ruleId: string | number) => `/rules/detail/${ruleId}`,
  executionLogs: "/rules/execution-logs",
} as const;

export interface RuleListParams {
  page: number;
  size: number;
  search?: string;
  isActive?: boolean;
}

export interface RuleExecutionLogParams {
  page: number;
  size: number;
  ruleId?: string | number;
}

function isActiveFilterValue(isActive?: boolean): string | undefined {
  return isActive == null ? undefined : String(isActive);
}

function ruleIdFilterValue(
  ruleId?: string | number,
): string | undefined {
  if (ruleId == null || ruleId === "") return undefined;
  return String(ruleId);
}

export const ruleService = {
  getList: (params: RuleListParams): Promise<PaginatedResponse<IRule>> =>
    apiClient.getTableData<IRule>({
      path: RULE_API.list,
      page: params.page,
      size: params.size,
      filter: {
        search: params.search,
        isActive: isActiveFilterValue(params.isActive),
      },
    }),

  getDetail: (ruleId: string | number) =>
    apiClient.get<IRule>(RULE_API.detail(ruleId)),

  getExecutionLogs: (
    params: RuleExecutionLogParams,
  ): Promise<PaginatedResponse<IRuleExecutionLog>> =>
    apiClient.getTableData<IRuleExecutionLog>({
      path: RULE_API.executionLogs,
      page: params.page,
      size: params.size,
      filter: {
        ruleId: ruleIdFilterValue(params.ruleId),
      },
    }),
};
