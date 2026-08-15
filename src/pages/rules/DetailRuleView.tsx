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
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import { IconMenus } from "@/assets/icons";
import { convertTime } from "@/utils/convertTime";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { muiTableContainerSx } from "@/styles/tableStyles";
import { ROUTES } from "@/routes/routes";
import {
  getExecutionLogMessage,
  getExecutionLogRowId,
  getRuleDisplayName,
  getRuleOriginalPrompt,
  type IRuleExecutionLog,
} from "@/types/Rule";

function getLogStatusColor(
  status: string,
): "default" | "success" | "warning" | "error" {
  const s = String(status ?? "").toLowerCase();
  if (s === "success" || s === "completed" || s === "ok") return "success";
  if (s === "pending" || s === "running") return "warning";
  if (s === "failed" || s === "error") return "error";
  return "default";
}

export default function DetailRuleView() {
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
  const logsErrorMessage = logsError
    ? "Failed to load execution logs."
    : null;
  const logs = logsData?.items ?? [];
  const logsTotal = logsData?.totalItems ?? 0;
  const displayName = rule ? getRuleDisplayName(rule) : "Detail";

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
              Rule info
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created at
                  </Typography>
                  <Typography variant="body2">
                    {rule.createdAt ? convertTime(rule.createdAt) : "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Updated at
                  </Typography>
                  <Typography variant="body2">
                    {rule.updatedAt ? convertTime(rule.updatedAt) : "—"}
                  </Typography>
                </Box>
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Original prompt
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {getRuleOriginalPrompt(rule)}
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
                        <TableCell>Status</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Executed at</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((item: IRuleExecutionLog, index: number) => {
                        const status = String(item.status ?? "—");
                        const executedAt = item.executedAt ?? item.createdAt;
                        return (
                          <TableRow
                            key={getExecutionLogRowId(item, index)}
                            hover
                          >
                            <TableCell>
                              {getExecutionLogRowId(item, index)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={status}
                                color={getLogStatusColor(status)}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {getExecutionLogMessage(item)}
                            </TableCell>
                            <TableCell>
                              {executedAt ? convertTime(executedAt) : "—"}
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
