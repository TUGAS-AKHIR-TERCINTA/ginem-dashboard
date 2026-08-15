import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  formatExecutionAction,
  formatRuleAction,
  formatRuleCondition,
  formatRuleTrigger,
  getRuleActionChipColor,
  type IRuleAction,
  type IRuleCondition,
  type IRuleExecutionAction,
  type IRuleTrigger,
} from "@/types/Rule";

export function RuleTriggerChip({
  trigger,
}: {
  trigger?: IRuleTrigger | null;
}) {
  return (
    <Chip
      size="small"
      label={formatRuleTrigger(trigger)}
      variant="outlined"
      color="primary"
    />
  );
}

export function RuleConditionChips({
  conditions,
  logic,
}: {
  conditions: IRuleCondition[];
  logic?: string | null;
}) {
  if (conditions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  const joiner = logic?.trim() || "AND";

  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
      {conditions.map((condition, index) => (
        <Stack
          key={`${condition.deviceId}-${index}`}
          direction="row"
          spacing={0.75}
          alignItems="center"
        >
          {index > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {joiner}
            </Typography>
          ) : null}
          <Chip
            size="small"
            label={formatRuleCondition(condition)}
            variant="outlined"
          />
        </Stack>
      ))}
    </Stack>
  );
}

export function RuleActionChips({ actions }: { actions: IRuleAction[] }) {
  if (actions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
      {actions.map((action, index) => (
        <Chip
          key={`${action.deviceId}-${index}`}
          size="small"
          label={formatRuleAction(action)}
          color={getRuleActionChipColor(action.state)}
          variant="outlined"
        />
      ))}
    </Stack>
  );
}

export function ExecutionActionChips({
  actions,
}: {
  actions: IRuleExecutionAction[];
}) {
  if (actions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
      {actions.map((action, index) => {
        const chip = (
          <Chip
            size="small"
            label={formatExecutionAction(action)}
            color={
              action.skipped ? "warning" : getRuleActionChipColor(action.state)
            }
            variant="outlined"
          />
        );
        return action.reason ? (
          <Tooltip key={`${action.deviceId}-${index}`} title={action.reason}>
            <span>{chip}</span>
          </Tooltip>
        ) : (
          <span key={`${action.deviceId}-${index}`}>{chip}</span>
        );
      })}
    </Stack>
  );
}
