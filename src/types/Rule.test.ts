import { describe, expect, it } from "vitest";
import {
  formatExecutionAction,
  formatExecutionCondition,
  formatExecutionEvent,
  formatRuleAction,
  formatRuleCondition,
  formatRuleCooldown,
  formatRuleTrigger,
  getRuleDisplayName,
  getRuleOriginalPrompt,
  type IRule,
  type IRuleExecutionLog,
} from "./Rule";

const sampleRule: IRule = {
  ruleId: 7,
  name: "Rule: D1 → D3, D2",
  originalPrompt:
    "tolong hidupkan device D3 dan device D2 ketika nilai device D1 bernilai 200",
  conditionLogic: "AND",
  isActive: true,
  cooldownSec: 60,
  lastTriggeredAt: "2026-08-15 10:22:38",
  trigger: {
    deviceId: 5,
    deviceName: "D1",
    metric: "value",
    eventType: "telemetry",
  },
  conditions: [
    {
      deviceId: 5,
      deviceName: "D1",
      metric: "value",
      operator: "==",
      threshold: 200,
      unit: null,
    },
  ],
  actions: [
    {
      deviceId: 7,
      deviceName: "D3",
      actionType: "set_state",
      state: "on",
    },
  ],
};

describe("rule display helpers", () => {
  it("formats name and prompt", () => {
    expect(getRuleDisplayName(sampleRule)).toBe("Rule: D1 → D3, D2");
    expect(getRuleOriginalPrompt({ ruleId: 1 })).toBe("—");
  });

  it("formats trigger, condition, action, and cooldown", () => {
    expect(formatRuleTrigger(sampleRule.trigger)).toBe(
      "D1 · value · telemetry",
    );
    expect(formatRuleCondition(sampleRule.conditions?.[0] ?? { deviceId: 0 })).toBe(
      "D1 value == 200",
    );
    expect(formatRuleAction(sampleRule.actions?.[0] ?? { deviceId: 0 })).toBe(
      "D3 → ON",
    );
    expect(formatRuleCooldown(60)).toBe("60s");
  });

  it("falls back when nested fields are missing", () => {
    expect(formatRuleTrigger(undefined)).toBe("—");
    expect(
      formatRuleCondition({
        deviceId: 5,
        operator: ">",
        threshold: 10,
      }),
    ).toBe("Device 5 value > 10");
    expect(
      formatRuleAction({
        deviceId: 6,
        actionType: "set_state",
      }),
    ).toBe("Device 6 · set_state");
  });

  it("formats execution log event, condition, and action", () => {
    const log: IRuleExecutionLog = {
      ruleExecutionLogId: 24,
      ruleId: 1,
      success: true,
      eventSnapshot: {
        deviceId: 5,
        metrics: { value: 200 },
      },
      conditionResult: {
        logic: "AND",
        passed: true,
        details: [
          {
            ok: true,
            metric: "value",
            reading: 200,
            operator: ">",
            threshold: 5,
          },
        ],
      },
      actionResult: {
        actions: [
          {
            deviceId: 6,
            state: "on",
            skipped: true,
            reason: "target already in desired state",
          },
        ],
      },
    };

    expect(formatExecutionEvent(log)).toBe("Device 5 · 200");
    expect(formatExecutionCondition(log)).toBe("value 200 > 5");
    expect(
      formatExecutionAction(log.actionResult?.actions?.[0] ?? {}),
    ).toBe("Device 6 → ON · skipped");
  });
});
