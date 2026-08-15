export interface IRuleTrigger {
  deviceId: number;
  deviceName?: string | null;
  metric?: string | null;
  eventType?: string | null;
}

export interface IRuleCondition {
  deviceId: number;
  deviceName?: string | null;
  metric?: string | null;
  operator?: string | null;
  threshold?: number | string | null;
  unit?: string | null;
}

export interface IRuleAction {
  deviceId: number;
  deviceName?: string | null;
  actionType?: string | null;
  state?: string | null;
}

export interface IRule {
  ruleId: number;
  name?: string | null;
  originalPrompt?: string | null;
  conditionLogic?: string | null;
  isActive?: boolean | null;
  cooldownSec?: number | null;
  lastTriggeredAt?: string | null;
  trigger?: IRuleTrigger | null;
  conditions?: IRuleCondition[] | null;
  actions?: IRuleAction[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface IRuleEventSnapshot {
  deviceId?: number;
  metrics?: Record<string, number | string> | null;
  rawPayload?: Record<string, string | number> | null;
  receivedAt?: string | null;
}

export interface IRuleConditionDetail {
  ok?: boolean;
  metric?: string | null;
  reading?: number | string | null;
  deviceId?: number;
  operator?: string | null;
  threshold?: number | string | null;
}

export interface IRuleConditionResult {
  logic?: string | null;
  passed?: boolean | null;
  details?: IRuleConditionDetail[] | null;
}

export interface IRuleExecutionAction {
  deviceId?: number;
  state?: string | null;
  skipped?: boolean | null;
  published?: boolean | null;
  reason?: string | null;
  deviceLogId?: number | null;
  deviceLogData?: string | null;
}

export interface IRuleActionResult {
  actions?: IRuleExecutionAction[] | null;
}

export interface IRuleExecutionLog {
  ruleExecutionLogId?: number;
  executionLogId?: number;
  id?: number;
  ruleId?: number;
  success?: boolean | null;
  errorMessage?: string | null;
  latencyMs?: number | null;
  eventSnapshot?: IRuleEventSnapshot | null;
  conditionResult?: IRuleConditionResult | null;
  actionResult?: IRuleActionResult | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function getRuleDisplayName(rule: IRule): string {
  return rule.name?.trim() ? rule.name : "—";
}

export function getRuleOriginalPrompt(rule: IRule): string {
  return rule.originalPrompt?.trim() ? rule.originalPrompt : "—";
}

export function formatRuleTrigger(trigger?: IRuleTrigger | null): string {
  if (!trigger) return "—";
  const device = trigger.deviceName?.trim() || `Device ${trigger.deviceId}`;
  const parts = [device];
  if (trigger.metric?.trim()) parts.push(trigger.metric.trim());
  if (trigger.eventType?.trim()) parts.push(trigger.eventType.trim());
  return parts.join(" · ");
}

export function formatRuleCondition(condition: IRuleCondition): string {
  const device = condition.deviceName?.trim() || `Device ${condition.deviceId}`;
  const metric = condition.metric?.trim() || "value";
  const operator = condition.operator?.trim() || "?";
  const threshold =
    condition.threshold == null || condition.threshold === ""
      ? "—"
      : String(condition.threshold);
  const unit = condition.unit?.trim();
  const base = `${device} ${metric} ${operator} ${threshold}`;
  return unit ? `${base} ${unit}` : base;
}

export function formatRuleAction(action: IRuleAction): string {
  const device = action.deviceName?.trim() || `Device ${action.deviceId}`;
  const state = action.state?.trim();
  if (state) return `${device} → ${state.toUpperCase()}`;
  return `${device} · ${action.actionType?.trim() || "action"}`;
}

export function formatRuleCooldown(sec?: number | null): string {
  if (sec == null) return "—";
  return `${sec}s`;
}

export function getRuleActionChipColor(
  state?: string | null,
): "success" | "default" {
  return String(state ?? "").toLowerCase() === "on" ? "success" : "default";
}

export function getExecutionLogRowId(
  log: IRuleExecutionLog,
  index: number,
): number | string {
  return (
    log.ruleExecutionLogId ?? log.executionLogId ?? log.id ?? `log-${index}`
  );
}

export function formatExecutionEvent(log: IRuleExecutionLog): string {
  const snapshot = log.eventSnapshot;
  if (!snapshot) return "—";
  const device =
    snapshot.deviceId == null ? "Device" : `Device ${snapshot.deviceId}`;
  const value = snapshot.metrics?.value;
  if (value == null || value === "") return device;
  return `${device} · ${value}`;
}

export function formatExecutionCondition(log: IRuleExecutionLog): string {
  const result = log.conditionResult;
  if (!result) return "—";
  const detail = result.details?.[0];
  if (!detail) return result.passed ? "Passed" : "Failed";
  const metric = detail.metric?.trim() || "value";
  return `${metric} ${detail.reading} ${detail.operator} ${detail.threshold}`;
}

export function formatExecutionAction(action: IRuleExecutionAction): string {
  const device =
    action.deviceId == null ? "Device" : `Device ${action.deviceId}`;
  const state = action.state?.trim();
  const base = state ? `${device} → ${state.toUpperCase()}` : device;
  if (action.skipped) return `${base} · skipped`;
  if (action.published) return `${base} · published`;
  return base;
}

export function getExecutionLogError(log: IRuleExecutionLog): string | null {
  return log.errorMessage?.trim() ? log.errorMessage : null;
}
