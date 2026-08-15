import Box from "@mui/material/Box";
import { useCallback, useEffect, useState } from "react";
import { useRuleListQuery, useDeleteRuleMutation } from "@/hooks/services";
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
  Pagination,
  Paper,
  Select,
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
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { ROUTES } from "@/routes/routes";
import {
  formatRuleCooldown,
  getRuleDisplayName,
  getRuleOriginalPrompt,
  type IRule,
  type IRuleAction,
  type IRuleCondition,
} from "@/types/Rule";
import {
  RuleActionChips,
  RuleConditionChips,
  RuleTriggerChip,
} from "@/features/rules/components/RuleChips";
import { muiTableContainerSx } from "@/styles/tableStyles";
import DeleteModalRule from "@/features/rules/components/DeleteModalRule";

type ActiveFilter = "all" | "true" | "false";

function parseActiveFilter(raw: string | null): ActiveFilter {
  if (raw === "true" || raw === "false") return raw;
  return "all";
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

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  });

  const { data, isFetching, isError, refetch, dataUpdatedAt } =
    useRuleListQuery({
      page: paginationModel.page + 1,
      size: paginationModel.pageSize,
      search,
      isActive,
    });
  const deleteRule = useDeleteRuleMutation();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<{
    ruleId: number;
    ruleName: string;
  } | null>(null);

  const tableData = data?.items ?? [];
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

  const handleOpenDeleteModal = (row: IRule) => {
    setRuleToDelete({
      ruleId: row.ruleId,
      ruleName: getRuleDisplayName(row),
    });
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!deleteRule.isPending) {
      setOpenDeleteModal(false);
      setRuleToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete || deleteRule.isPending) return;
    try {
      await deleteRule.mutateAsync(ruleToDelete.ruleId);
      handleCloseDeleteModal();
    } catch (error: unknown) {
      console.error(error);
    }
  };

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
              Automation flow from trigger to device actions
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

        <RuleListToolbar
          searchParam={search}
          activeFilter={activeFilter}
          loading={loading}
          onRefresh={() => refetch()}
          onApply={handleApply}
          onReset={handleReset}
        />

        {loading && tableData.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 3 }}>
            Loading...
          </Typography>
        ) : !loading && tableData.length === 0 ? (
          <NoRowsOverlay
            title="No rules"
            subtitle="Try adjusting your search or status filter."
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
            <Table size="small" stickyHeader sx={{ minWidth: 1280 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Rule</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Actions</TableCell>
                  <TableCell>Cooldown</TableCell>
                  <TableCell>Last triggered</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row: IRule) => {
                  const conditions: IRuleCondition[] = row.conditions ?? [];
                  const actions: IRuleAction[] = row.actions ?? [];
                  return (
                    <TableRow
                      key={row.ruleId}
                      hover
                      sx={{ "& td": { verticalAlign: "top" } }}
                    >
                      <TableCell>{row.ruleId}</TableCell>
                      <TableCell sx={{ minWidth: 220, maxWidth: 320 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {getRuleDisplayName(row)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {getRuleOriginalPrompt(row)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.isActive ? "Active" : "Inactive"}
                          color={row.isActive ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <RuleTriggerChip trigger={row.trigger} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <RuleConditionChips
                          conditions={conditions}
                          logic={row.conditionLogic}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <RuleActionChips actions={actions} />
                      </TableCell>
                      <TableCell>
                        {formatRuleCooldown(row.cooldownSec)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.lastTriggeredAt || "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Detail">
                          <IconButton
                            size="small"
                            aria-label={`Open rule ${row.ruleId}`}
                            onClick={() =>
                              navigate(ROUTES.ruleDetail(row.ruleId))
                            }
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete rule ${row.ruleId}`}
                            onClick={() => handleOpenDeleteModal(row)}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {rowCount > 0 ? (
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
        ) : null}
      </Paper>

      <DeleteModalRule
        open={openDeleteModal}
        loading={deleteRule.isPending}
        ruleName={ruleToDelete?.ruleName ?? null}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
