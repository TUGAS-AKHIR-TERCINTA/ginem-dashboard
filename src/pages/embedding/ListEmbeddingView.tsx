import Box from "@mui/material/Box";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCreateEmbeddingMutation,
  useDeleteEmbeddingMutation,
  useEmbeddingListQuery,
} from "@/hooks/services";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppContext } from "@/context/app.context";
import { IIndexing } from "@/types/Indexing";
import DeleteModalIndexing from "@/features/embedding/components/DeleteModalIndexing";

const INDEX_SOURCE_OPTIONS = ["text", "pdf", "json"] as const;
const CONTENT_PREVIEW_MAX = 200;

function truncateContentForCell(raw: unknown): string {
  const s = String(raw ?? "");
  if (s.length <= CONTENT_PREVIEW_MAX) return s;
  return `${s.slice(0, CONTENT_PREVIEW_MAX)}…`;
}

type IndexingDocumentDraft = {
  content: string;
  source: string;
};

function defaultDocumentRow(): IndexingDocumentDraft {
  return { content: "", source: "text" };
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

type EmbeddingListToolbarProps = {
  searchParamKey: string;
  loading: boolean;
  onRefresh: () => void;
  onApplySearch: (search: string) => void;
  onResetFilters: () => void;
};

function EmbeddingListToolbar({
  searchParamKey,
  loading,
  onRefresh,
  onApplySearch,
  onResetFilters,
}: EmbeddingListToolbarProps) {
  const [search, setSearch] = useState<string>(searchParamKey);

  useEffect(() => {
    setSearch(searchParamKey);
  }, [searchParamKey]);

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
          placeholder="Search vector indexes..."
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
          <Button variant="outlined" onClick={() => onApplySearch(search)}>
            Apply
          </Button>
          <Button
            variant="text"
            color="inherit"
            onClick={() => {
              setSearch("");
              onResetFilters();
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

export default function ListEmbeddingView() {
  const { setAppAlert } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamKey = searchParams.get("search") ?? "";

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const apiPage = paginationModel.page + 1;

  const { data, isFetching, isError, refetch, dataUpdatedAt } =
    useEmbeddingListQuery({
      page: apiPage,
      size: paginationModel.pageSize,
      search: searchParamKey,
    });

  const rows = useMemo(
    () =>
      (data?.items ?? []).map((row: IIndexing) => ({
        ...row,
        id: row.indexingId,
      })),
    [data?.items],
  );
  const rowCount = data?.totalItems ?? 0;
  const loading = isFetching;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const errorMessage = isError
    ? "Failed to load vector indexes. Please try again."
    : null;

  const createIndexing = useCreateEmbeddingMutation();
  const deleteIndexing = useDeleteEmbeddingMutation();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [documentRows, setDocumentRows] = useState<IndexingDocumentDraft[]>([
    defaultDocumentRow(),
  ]);
  const [submitIndexingLoading, setSubmitIndexingLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    indexingId: number;
    preview: string | null;
  } | null>(null);

  const [contentDetail, setContentDetail] = useState<{
    indexingId: number;
    content: string;
  } | null>(null);

  const resetAddForm = () => {
    setDocumentRows([defaultDocumentRow()]);
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (submitIndexingLoading) return;
    setAddModalOpen(false);
    resetAddForm();
  };

  const handleSubmitIndexing = async () => {
    const documents = documentRows
      .map((row) => ({
        content: row.content.trim(),
        source: row.source.trim(),
      }))
      .filter((row) => row.content.length > 0 && row.source.length > 0);

    if (documents.length === 0) {
      setFormError(
        "Add at least one document with non-empty content and source.",
      );
      return;
    }

    setFormError(null);
    setSubmitIndexingLoading(true);
    try {
      await createIndexing.mutateAsync({ documents });
      setAppAlert({
        isDisplayAlert: true,
        message: "Content submitted for indexing.",
        alertType: "success",
      });
      setAddModalOpen(false);
      resetAddForm();
    } finally {
      setSubmitIndexingLoading(false);
    }
  };

  const handleApplySearch = (search: string) => {
    const newSearchParams = new URLSearchParams();
    if (search) newSearchParams.set("search", search);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setSearchParams(newSearchParams);
  };

  const handleResetFilters = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setSearchParams(new URLSearchParams());
  };

  const handleOpenContentDetail = useCallback((row: IIndexing) => {
    setContentDetail({
      indexingId: row.indexingId,
      content: row.content ?? "",
    });
  }, []);

  const handleCloseContentDetail = useCallback(() => {
    setContentDetail(null);
  }, []);

  const handleOpenDeleteModal = useCallback((row: IIndexing) => {
    const raw = row.content?.trim() ?? "";
    if (raw.length > 80) {
      setDeleteTarget({
        indexingId: row.indexingId,
        preview: `${raw.slice(0, 80)}…`,
      });
    } else {
      setDeleteTarget({
        indexingId: row.indexingId,
        preview: raw || null,
      });
    }
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    if (!deleteIndexing.isPending) setDeleteTarget(null);
  }, [deleteIndexing.isPending]);

  const handleConfirmDeleteIndexing = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteIndexing.mutateAsync(deleteTarget.indexingId);
      setAppAlert({
        isDisplayAlert: true,
        message: "Vector index deleted.",
        alertType: "success",
      });
      setDeleteTarget(null);
    } catch {
      // Error handled by mutation hook
    }
  }, [deleteTarget, deleteIndexing, setAppAlert]);

  const columns: GridColDef<IIndexing & { id: number }>[] = useMemo(
    () => [
      {
        field: "indexingId",
        headerName: "ID",
        width: 90,
        type: "number",
        align: "left",
        headerAlign: "left",
      },
      {
        field: "source",
        headerName: "Source",
        width: 130,
        valueGetter: (params) => params.row.source ?? "—",
      },
      {
        field: "content",
        headerName: "Text",
        flex: 1,
        minWidth: 220,
        renderCell: (params) => {
          const full = String(params.value ?? "");
          const display =
            full.length === 0 ? "—" : truncateContentForCell(full);
          return (
            <Tooltip title={full || "—"} placement="top-start">
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  py: 1,
                }}
              >
                {display}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Created at",
        width: 180,
        valueFormatter: (params) =>
          convertTime(String(params.value ?? "")) || "—",
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        align: "center",
        headerAlign: "center",
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="detail"
            icon={<VisibilityOutlinedIcon />}
            label="Detail"
            color="info"
            onClick={() => handleOpenContentDetail(row as IIndexing)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteOutlineIcon />}
            label="Delete"
            color="error"
            onClick={() => handleOpenDeleteModal(row as IIndexing)}
            showInMenu={false}
          />,
        ],
      },
    ],
    [handleOpenContentDetail, handleOpenDeleteModal],
  );

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Embedding",
            link: "/indexing",
            icon: <IconMenus.vectorIndexes fontSize="small" />,
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
              Vector indexes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Indexed content
              {lastUpdated ? ` • Updated ${lastUpdated.toLocaleString()}` : ""}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            add content
          </Button>
        </Stack>

        {errorMessage ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ width: "100%" }}>
          <EmbeddingListToolbar
            searchParamKey={searchParamKey}
            loading={loading}
            onRefresh={() => refetch()}
            onApplySearch={handleApplySearch}
            onResetFilters={handleResetFilters}
          />

          {!loading && rowCount === 0 ? (
            <NoRowsOverlay
              title="No indexed content"
              subtitle="Index content using the button above or adjust your search."
            />
          ) : (
            <Box sx={{ mt: 2, width: "100%" }}>
              <AppDataGrid
                withSurface={false}
                rows={rows}
                columns={columns}
                loading={loading}
                rowCount={rowCount}
                pageSizeOptions={[5, 10, 20, 50]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={setPaginationModel}
              />
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog
        open={addModalOpen}
        onClose={handleCloseAddModal}
        fullWidth
        maxWidth="sm"
        aria-labelledby="add-indexing-dialog-title"
      >
        <DialogTitle id="add-indexing-dialog-title">Add content</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {formError ? (
              <Alert severity="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            ) : null}

            {documentRows.map((row, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      Document {index + 1}
                    </Typography>
                    {documentRows.length > 1 ? (
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          aria-label="Remove document"
                          onClick={() =>
                            setDocumentRows((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Stack>
                  <TextField
                    label="Content"
                    value={row.content}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDocumentRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, content: v } : r,
                        ),
                      );
                    }}
                    multiline
                    minRows={3}
                    fullWidth
                    required
                    placeholder="Text to index…"
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel id={`source-label-${index}`}>Source</InputLabel>
                    <Select
                      labelId={`source-label-${index}`}
                      label="Source"
                      value={row.source}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDocumentRows((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, source: v } : r,
                          ),
                        );
                      }}
                    >
                      {INDEX_SOURCE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<PlaylistAddIcon />}
              onClick={() =>
                setDocumentRows((prev) => [...prev, defaultDocumentRow()])
              }
            >
              Add another document
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseAddModal}
            disabled={submitIndexingLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitIndexing}
            disabled={submitIndexingLoading}
            startIcon={
              submitIndexingLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteModalIndexing
        open={deleteTarget !== null}
        loading={deleteIndexing.isPending}
        indexingId={deleteTarget?.indexingId ?? null}
        previewLabel={deleteTarget?.preview ?? null}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteIndexing}
      />

      <Dialog
        open={contentDetail !== null}
        onClose={handleCloseContentDetail}
        fullWidth
        maxWidth="md"
        aria-labelledby="indexing-content-detail-title"
      >
        <DialogTitle id="indexing-content-detail-title">
          Content
          {contentDetail ? (
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ display: "block", fontWeight: 400, mt: 0.5 }}
            >
              Index #{contentDetail.indexingId}
            </Typography>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            value={contentDetail?.content ?? ""}
            fullWidth
            multiline
            minRows={12}
            maxRows={24}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
                fontSize: "0.875rem",
                whiteSpace: "pre-wrap",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={handleCloseContentDetail}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
