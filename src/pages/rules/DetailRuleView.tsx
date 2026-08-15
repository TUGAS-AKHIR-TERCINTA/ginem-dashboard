import Box from "@mui/material/Box";
import { useState } from "react";
import {
  useRuleDetailQuery,
  useRuleExecutionLogsQuery,
} from "@/hooks/services";
import {
  Alert,
  Button,
  Chip,
  Divider,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import { IconMenus } from "@/assets/icons";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { muiTableContainerSx } from "@/styles/tableStyles";
import { ROUTES } from "@/routes/routes";
import {
  formatExecutionCondition,
  formatExecutionEvent,
  formatRuleCooldown,
  getExecutionLogError,
  getExecutionLogRowId,
  getRuleDisplayName,
  getRuleOriginalPrompt,
  type IRuleAction,
  type IRuleCondition,
  type IRuleExecutionAction,
  type IRuleExecutionLog,
} from "@/types/Rule";
import {
  ExecutionActionChips,
  RuleActionChips,
  RuleConditionChips,
  RuleTriggerChip,
} from "@/features/rules/components/RuleChips";

export default function DetailRuleView() {
  const theme = useTheme();
  const { ruleId } = useParams<{ ruleId: string }>();
  const navigate = useNavigate();
  const [logPagination, setLogPagination] = useState({
    page: 0,
    pageSize: 20,
  });

  const {
    data: rule,
    isLoading: loading,
    isError,
  } = useRuleDetailQuery(ruleId);

  const {
    data: logsData,
    isFetching: logsLoading,
    isError: logsError,
  } = useRuleExecutionLogsQuery({
    page: logPagination.page + 1,
    size: logPagination.pageSize,
    ruleId,
    enabled: Boolean(ruleId),
  });

  const errorMessage = isError ? "Failed to load rule." : null;
  const logsErrorMessage = logsError ? "Failed to load execution logs." : null;
  const logs = logsData?.items ?? [];
  const logsTotal = logsData?.totalItems ?? 0;
  const displayName = rule ? getRuleDisplayName(rule) : "Detail";
  const conditions: IRuleCondition[] = rule?.conditions ?? [];
  const actions: IRuleAction[] = rule?.actions ?? [];
  const logic = rule?.conditionLogic?.trim() || "AND";

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Rules",
            link: ROUTES.rules,
            icon: <IconMenus.rules fontSize="small" />,
          },
          {
            label: displayName,
            link: undefined,
          },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.rules)}
          >
            Back
          </Button>
        </Stack>

        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : rule ? (
          <>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.25}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  {getRuleDisplayName(rule)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rule ID: {rule.ruleId}
                </Typography>
              </Box>
              <Chip
                size="medium"
                label={rule.isActive ? "Active" : "Inactive"}
                color={rule.isActive ? "success" : "default"}
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Original prompt
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              {getRuleOriginalPrompt(rule)}
            </Typography>

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Automation flow
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  When
                </Typography>
                <Stack direction="row" sx={{ mt: 0.75 }}>
                  <RuleTriggerChip trigger={rule.trigger} />
                </Stack>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  If ({logic})
                </Typography>
                <Box sx={{ mt: 0.75 }}>
                  <RuleConditionChips
                    conditions={conditions}
                    logic={rule.conditionLogic}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Then
                </Typography>
                <Box sx={{ mt: 0.75 }}>
                  <RuleActionChips actions={actions} />
                </Box>
              </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={3} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Cooldown
                </Typography>
                <Typography variant="body2">
                  {formatRuleCooldown(rule.cooldownSec)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last triggered
                </Typography>
                <Typography variant="body2">
                  {rule.lastTriggeredAt || "—"}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Execution logs
            </Typography>
            {logsErrorMessage ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {logsErrorMessage}
              </Alert>
            ) : null}
            {logsLoading && logs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Loading logs...
              </Typography>
            ) : logs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No execution logs.
              </Typography>
            ) : (
              <>
                <TableContainer sx={muiTableContainerSx}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Event</TableCell>
                        <TableCell>Condition</TableCell>
                        <TableCell>Actions</TableCell>
                        <TableCell>Latency</TableCell>
                        <TableCell>Executed at</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((item: IRuleExecutionLog, index: number) => {
                        const errorText = getExecutionLogError(item);
                        const executionActions: IRuleExecutionAction[] =
                          item.actionResult?.actions ?? [];
                        const passed = item.conditionResult?.passed;
                        return (
                          <TableRow
                            key={getExecutionLogRowId(item, index)}
                            hover
                            sx={{ "& td": { verticalAlign: "top" } }}
                          >
                            <TableCell>
                              {getExecutionLogRowId(item, index)}
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Chip
                                  size="small"
                                  label={item.success ? "Success" : "Failed"}
                                  color={item.success ? "success" : "error"}
                                  variant="outlined"
                                />
                                {errorText ? (
                                  <Typography
                                    variant="caption"
                                    color="error"
                                    sx={{ maxWidth: 180 }}
                                  >
                                    {errorText}
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>
                            <TableCell>{formatExecutionEvent(item)}</TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Chip
                                  size="small"
                                  label={
                                    passed === true
                                      ? "Passed"
                                      : passed === false
                                        ? "Failed"
                                        : "—"
                                  }
                                  color={
                                    passed === true ? "success" : "default"
                                  }
                                  variant="outlined"
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatExecutionCondition(item)}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                              <ExecutionActionChips
                                actions={executionActions}
                              />
                            </TableCell>
                            <TableCell>
                              {item.latencyMs != null
                                ? `${item.latencyMs} ms`
                                : "—"}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {item.createdAt || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {logsTotal > 0 ? (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing {logs.length} of {logsTotal} items
                    </Typography>
                    <Pagination
                      color="primary"
                      shape="rounded"
                      page={logPagination.page + 1}
                      count={Math.max(
                        1,
                        Math.ceil(logsTotal / logPagination.pageSize),
                      )}
                      onChange={(_, page) =>
                        setLogPagination((prev) => ({
                          ...prev,
                          page: page - 1,
                        }))
                      }
                    />
                  </Stack>
                ) : null}
              </>
            )}
          </>
        ) : !loading && !errorMessage ? (
          <Typography color="text.secondary">Rule not found.</Typography>
        ) : null}
      </Paper>
    </Box>
  );
}
