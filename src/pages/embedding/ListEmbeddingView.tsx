import Box from "@mui/material/Box";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useCreateEmbeddingMutation,
  useDeleteEmbeddingMutation,
  useEmbeddingListQuery,
  useUploadEmbeddingMutation,
} from "@/hooks/services";
import {
  Alert,
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
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
import TextFieldsIcon from "@mui/icons-material/TextFields";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppContext } from "@/context/app.context";
import { IIndexing } from "@/types/Indexing";
import DeleteModalIndexing from "@/features/embedding/components/DeleteModalIndexing";

const CONTENT_PREVIEW_MAX = 200;

function truncateContentForCell(raw: unknown): string {
  const s = String(raw ?? "");
  if (s.length <= CONTENT_PREVIEW_MAX) return s;
  return `${s.slice(0, CONTENT_PREVIEW_MAX)}…`;
}

type SourceType = "text" | "pdf";

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

type SourceTypeCardProps = {
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
};

function SourceTypeCard({
  selected,
  icon,
  title,
  description,
  onClick,
  disabled,
}: SourceTypeCardProps) {
  return (
    <Paper
      variant="outlined"
      onClick={disabled ? undefined : onClick}
      sx={{
        p: 2.5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flex: 1,
        minWidth: 180,
        transition: "all 0.2s ease",
        borderColor: selected ? "primary.main" : "divider",
        borderWidth: selected ? 2 : 1,
        bgcolor: selected
          ? (theme) => alpha(theme.palette.primary.main, 0.04)
          : "background.paper",
        "&:hover": disabled
          ? {}
          : {
              borderColor: "primary.main",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            },
      }}
    >
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: selected
              ? (theme) => alpha(theme.palette.primary.main, 0.12)
              : (theme) => alpha(theme.palette.text.primary, 0.06),
            color: selected ? "primary.main" : "text.secondary",
            transition: "all 0.2s ease",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
        {selected && (
          <CheckCircleIcon
            sx={{ color: "primary.main", fontSize: 20 }}
          />
        )}
      </Stack>
    </Paper>
  );
}

type FileDropZoneProps = {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
};

function FileDropZone({
  file,
  onFileSelect,
  disabled,
  accept = ".pdf",
}: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (file) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderColor: "success.main",
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              color: "error.main",
            }}
          >
            <PictureAsPdfIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)}
            </Typography>
          </Box>
          <Tooltip title="Remove file">
            <IconButton
              size="small"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled}
      />
      <Paper
        variant="outlined"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 4,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          borderStyle: "dashed",
          borderWidth: 2,
          borderColor: isDragOver ? "primary.main" : "divider",
          bgcolor: isDragOver
            ? (theme) => alpha(theme.palette.primary.main, 0.04)
            : "background.paper",
          transition: "all 0.2s ease",
          "&:hover": disabled
            ? {}
            : {
                borderColor: "primary.main",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
              },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          >
            <UploadFileIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box textAlign="center">
            <Typography variant="body1" fontWeight={600}>
              Drop your PDF here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse files
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">
            Supported format: PDF
          </Typography>
        </Stack>
      </Paper>
    </Box>
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
  const uploadIndexing = useUploadEmbeddingMutation();
  const deleteIndexing = useDeleteEmbeddingMutation();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<SourceType>("text");
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
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
    setSourceType("text");
    setTextContent("");
    setSelectedFile(null);
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (submitLoading) return;
    setAddModalOpen(false);
    resetAddForm();
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (sourceType === "text") {
      const content = textContent.trim();
      if (!content) {
        setFormError("Please enter some text content.");
        return;
      }

      setSubmitLoading(true);
      try {
        await createIndexing.mutateAsync({
          documents: [{ content, source: "text" }],
        });
        setAppAlert({
          isDisplayAlert: true,
          message: "Content submitted for indexing.",
          alertType: "success",
        });
        setAddModalOpen(false);
        resetAddForm();
      } finally {
        setSubmitLoading(false);
      }
    } else {
      if (!selectedFile) {
        setFormError("Please select a PDF file to upload.");
        return;
      }

      setSubmitLoading(true);
      try {
        await uploadIndexing.mutateAsync(selectedFile);
        setAppAlert({
          isDisplayAlert: true,
          message: "PDF uploaded and submitted for indexing.",
          alertType: "success",
        });
        setAddModalOpen(false);
        resetAddForm();
      } finally {
        setSubmitLoading(false);
      }
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

      {/* Add Content Modal */}
      <Dialog
        open={addModalOpen}
        onClose={handleCloseAddModal}
        fullWidth
        maxWidth="sm"
        aria-labelledby="add-indexing-dialog-title"
      >
        <DialogTitle id="add-indexing-dialog-title">
          <Typography variant="h6" fontWeight={700}>
            Add knowledge source
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Choose how you want to add content for indexing
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {formError ? (
              <Alert severity="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            ) : null}

            {/* Source Type Selection */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <SourceTypeCard
                selected={sourceType === "text"}
                icon={<TextFieldsIcon sx={{ fontSize: 28 }} />}
                title="Text Input"
                description="Type or paste text content"
                onClick={() => setSourceType("text")}
                disabled={submitLoading}
              />
              <SourceTypeCard
                selected={sourceType === "pdf"}
                icon={<PictureAsPdfIcon sx={{ fontSize: 28 }} />}
                title="Upload PDF"
                description="Upload a PDF document"
                onClick={() => setSourceType("pdf")}
                disabled={submitLoading}
              />
            </Stack>

            <Divider />

            {/* Content Input Area */}
            {sourceType === "text" ? (
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ mb: 1.5 }}
                >
                  Enter your text
                </Typography>
                <TextField
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  multiline
                  minRows={6}
                  maxRows={12}
                  fullWidth
                  placeholder="Paste or type the text content you want to index..."
                  disabled={submitLoading}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontFamily: "inherit",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {textContent.length} characters
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ mb: 1.5 }}
                >
                  Upload your PDF
                </Typography>
                <FileDropZone
                  file={selectedFile}
                  onFileSelect={setSelectedFile}
                  disabled={submitLoading}
                  accept=".pdf"
                />
              </Box>
            )}

            {submitLoading && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {sourceType === "text"
                    ? "Indexing content..."
                    : "Uploading and processing PDF..."}
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={handleCloseAddModal} disabled={submitLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              submitLoading ||
              (sourceType === "text" && !textContent.trim()) ||
              (sourceType === "pdf" && !selectedFile)
            }
            startIcon={
              submitLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
          >
            {submitLoading ? "Processing..." : "Submit"}
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
