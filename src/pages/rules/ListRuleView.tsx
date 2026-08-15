import Box from "@mui/material/Box";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRuleListQuery } from "@/hooks/services";
import {
  Alert,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  GridActionsCellItem,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import AppDataGrid from "@/components/common/AppDataGrid";
import { IconMenus } from "@/assets/icons";
import { convertTime } from "@/utils/convertTime";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { ROUTES } from "@/routes/routes";
import {
  getRuleDisplayName,
  getRuleOriginalPrompt,
  type IRule,
} from "@/types/Rule";

const PROMPT_PREVIEW_MAX = 120;

type ActiveFilter = "all" | "true" | "false";

function parseActiveFilter(raw: string | null): ActiveFilter {
  if (raw === "true" || raw === "false") return raw;
  return "all";
}

function truncatePrompt(raw: string): string {
  if (raw.length <= PROMPT_PREVIEW_MAX) return raw;
  return `${raw.slice(0, PROMPT_PREVIEW_MAX)}…`;
}

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

type RuleListToolbarProps = {
  searchParam: string;
  activeFilter: ActiveFilter;
  loading: boolean;
  onRefresh: () => void;
  onApply: (search: string, isActive: ActiveFilter) => void;
  onReset: () => void;
};

function RuleListToolbar({
  searchParam,
  activeFilter,
  loading,
  onRefresh,
  onApply,
  onReset,
}: RuleListToolbarProps) {
  const [search, setSearch] = useState(searchParam);
  const [isActive, setIsActive] = useState<ActiveFilter>(activeFilter);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setIsActive(activeFilter);
  }, [activeFilter]);

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
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh rules"
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
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="rule-active-filter-label">Status</InputLabel>
          <Select
            labelId="rule-active-filter-label"
            label="Status"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value as ActiveFilter)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="Search name or prompt..."
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
                    aria-label="Clear search"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : undefined,
          }}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={() => onApply(search, isActive)}>
            Apply
          </Button>
          <Button
            variant="text"
            color="inherit"
            onClick={() => {
              setSearch("");
              setIsActive("all");
              onReset();
            }}
            startIcon={<RestartAltIcon fontSize="small" />}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function ListRuleView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const activeFilter = parseActiveFilter(searchParams.get("isActive"));
  const isActive = activeFilter === "all" ? undefined : activeFilter === "true";

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const { data, isFetching, isError, refetch, dataUpdatedAt } =
    useRuleListQuery({
      page: paginationModel.page + 1,
      size: paginationModel.pageSize,
      search,
      isActive,
    });

  const rows = useMemo(
    () =>
      (data?.items ?? []).map((row: IRule) => ({
        ...row,
        id: row.ruleId,
      })),
    [data?.items],
  );
  const rowCount = data?.totalItems ?? 0;
  const loading = isFetching;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const errorMessage = isError
    ? "Failed to load rules. Please try again."
    : null;

  const handleApply = useCallback(
    (nextSearch: string, nextActive: ActiveFilter) => {
      const next = new URLSearchParams();
      if (nextSearch.trim()) next.set("search", nextSearch.trim());
      if (nextActive !== "all") next.set("isActive", nextActive);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setSearchParams(next);
    },
    [setSearchParams],
  );

  const handleReset = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handleOpenDetail = useCallback(
    (row: IRule) => {
      if (row.ruleId == null) return;
      navigate(ROUTES.ruleDetail(row.ruleId));
    },
    [navigate],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "ruleId",
        headerName: "ID",
        width: 90,
      },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 160,
        valueGetter: (params) => getRuleDisplayName(params.row as IRule),
      },
      {
        field: "originalPrompt",
        headerName: "Original prompt",
        flex: 2,
        minWidth: 220,
        valueGetter: (params) => getRuleOriginalPrompt(params.row as IRule),
        renderCell: (params) => (
          <Typography
            variant="body2"
            title={String(params.value ?? "")}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {truncatePrompt(String(params.value ?? "—"))}
          </Typography>
        ),
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 120,
        renderCell: (params) => {
          const active = Boolean(params.value);
          return (
            <Chip
              size="small"
              label={active ? "Active" : "Inactive"}
              color={active ? "success" : "default"}
              variant="outlined"
            />
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Created at",
        flex: 1,
        minWidth: 160,
        valueFormatter: (item) =>
          item.value ? convertTime(String(item.value)) : "—",
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 90,
        align: "center",
        headerAlign: "center",
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="detail"
            icon={<VisibilityOutlinedIcon />}
            label="Detail"
            onClick={() => handleOpenDetail(row as IRule)}
            showInMenu={false}
          />,
        ],
      },
    ],
    [handleOpenDetail],
  );

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Rules",
            link: ROUTES.rules,
            icon: <IconMenus.rules fontSize="small" />,
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
              Rules
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automation rules and original prompts
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
          <RuleListToolbar
            searchParam={search}
            activeFilter={activeFilter}
            loading={loading}
            onRefresh={() => refetch()}
            onApply={handleApply}
            onReset={handleReset}
          />

          {!loading && rowCount === 0 ? (
            <NoRowsOverlay
              title="No rules"
              subtitle="Try adjusting your search or status filter."
            />
          ) : (
            <Box sx={{ mt: 2, width: "100%" }}>
              <AppDataGrid
                withSurface={false}
                rows={rows}
                columns={columns}
                loading={loading}
                rowCount={rowCount}
                pageSizeOptions={[10, 20, 50]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={setPaginationModel}
              />
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
