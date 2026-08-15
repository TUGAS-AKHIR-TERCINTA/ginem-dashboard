export interface IRule {
  ruleId: number;
  name?: string | null;
  ruleName?: string | null;
  originalPrompt?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface IRuleExecutionLog {
  ruleExecutionLogId?: number;
  executionLogId?: number;
  id?: number;
  ruleId?: number;
  status?: string | null;
  message?: string | null;
  error?: string | null;
  result?: string | number | boolean | null;
  executedAt?: string | null;
  createdAt?: string | null;
}

export function getRuleDisplayName(rule: IRule): string {
  const name = rule.ruleName ?? rule.name;
  return name?.trim() ? name : "—";
}

export function getRuleOriginalPrompt(rule: IRule): string {
  return rule.originalPrompt?.trim() ? rule.originalPrompt : "—";
}

export function getExecutionLogRowId(
  log: IRuleExecutionLog,
  index: number,
): number | string {
  return log.ruleExecutionLogId ?? log.executionLogId ?? log.id ?? `log-${index}`;
}

export function getExecutionLogMessage(log: IRuleExecutionLog): string {
  if (typeof log.message === "string" && log.message.trim()) {
    return log.message;
  }
  if (typeof log.error === "string" && log.error.trim()) {
    return log.error;
  }
  if (log.result == null || log.result === "") {
    return "—";
  }
  return String(log.result);
}
