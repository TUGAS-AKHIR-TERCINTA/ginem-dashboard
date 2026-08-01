import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { useSchedulerListQuery } from "@/hooks/services";
import type { SchedulerLogItem } from "@/services/schedulerService";
import {
  Alert,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import { IconMenus } from "@/assets/icons";
import { convertTime } from "@/utils/convertTime";
import { ROUTES } from "@/routes/routes";
import { useSearchParams } from "react-router-dom";
import { muiTableContainerSx } from "@/styles/tableStyles";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

function NoRowsOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100%", py: 6, px: 2 }}
      spacing={0.5}
    >
      <Typography fontWeight={700}>{title}</Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function ListSchedulerView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  // UI pagination is 0-based; API expects page >= 1
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const { data, isFetching, isError, refetch, dataUpdatedAt } =
    useSchedulerListQuery({
      page: paginationModel.page + 1,
      size: paginationModel.pageSize,
      search,
    });

  const tableData = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;
  const loading = isFetching;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const errorMessage = isError
    ? "Failed to load scheduler logs. Please try again."
    : null;

  function CustomToolbar() {
    const initialSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState<string>(initialSearch);

    const currentSearch = searchParams.get("search") || "";

    useEffect(() => {
      setSearch(currentSearch);
    }, [currentSearch]);

    const handleSearch = () => {
      const newSearchParams = new URLSearchParams();
      if (search) newSearchParams.set("search", search);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setSearchParams(newSearchParams);
    };

    const handleReset = () => {
      setSearch("");
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setSearchParams(new URLSearchParams());
    };

    return (
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                onClick={() => refetch()}
                disabled={loading}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            size="small"
            placeholder="Search scheduler logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Tooltip title="Clear">
                    <IconButton
                      size="small"
                      onClick={() => setSearch("")}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : undefined,
            }}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={handleSearch}>
              Apply
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={handleReset}
              startIcon={<RestartAltIcon fontSize="small" />}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  const getStatusColor = (
    status: string,
  ): "default" | "primary" | "success" | "warning" | "error" => {
    const s = String(status ?? "").toLowerCase();
    if (s === "completed") return "success";
    if (s === "pending") return "warning";
    if (s === "failed" || s === "error") return "error";
    return "default";
  };

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Scheduler",
            link: ROUTES.scheduler,
            icon: <IconMenus.schedule fontSize="small" />,
          },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Scheduler logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduled jobs and execution history
              {lastUpdated ? ` • Updated ${lastUpdated.toLocaleString()}` : ""}
            </Typography>
          </Box>
        </Stack>

        {errorMessage ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ width: "100%" }}>
          <CustomToolbar />

          {(!loading && tableData.length === 0) || rowCount === 0 ? (
            <NoRowsOverlay
              title="No scheduler logs"
              subtitle="Try adjusting your search or wait for new scheduled jobs."
            />
          ) : (
            <TableContainer
              sx={(theme) => ({
                ...((typeof muiTableContainerSx === "function"
                  ? muiTableContainerSx(theme)
                  : muiTableContainerSx) as object),
                mt: 2,
              })}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Job ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Delay</TableCell>
                    <TableCell>Scheduled at</TableCell>
                    <TableCell>Run at</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Executed at</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row: SchedulerLogItem) => {
                    const status = String(row?.status ?? "pending");
                    return (
                      <TableRow
                        key={row?.schedulerLogId}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={row?.jobId}
                          >
                            {row?.jobId || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row?.type || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row?.deviceName || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row?.state ?? "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row?.delayMinutes != null
                              ? `${row.delayMinutes} min`
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {row.scheduledAt
                              ? convertTime(row.scheduledAt)
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {row.runAt ? convertTime(row.runAt) : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              status.charAt(0).toUpperCase() +
                              status.slice(1).toLowerCase()
                            }
                            color={getStatusColor(status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {row?.executedAt
                              ? convertTime(row.executedAt)
                              : "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {rowCount > 0 && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {tableData.length} of {rowCount} items
              </Typography>
              <Pagination
                color="primary"
                shape="rounded"
                page={paginationModel.page + 1}
                count={Math.max(
                  1,
                  Math.ceil(rowCount / paginationModel.pageSize),
                )}
                onChange={(_, page) =>
                  setPaginationModel((prev) => ({ ...prev, page: page - 1 }))
                }
              />
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
