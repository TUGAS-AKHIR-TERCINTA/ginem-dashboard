import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

/** Shared DataGrid look — use via `sx={dataGridSx}` or `<AppDataGrid />`. */
export const dataGridSx: SxProps<Theme> = (theme) => {
  const isDark = theme.palette.mode === "dark";
  const hairline = isDark
    ? "rgba(148,163,184,0.12)"
    : alpha(theme.palette.primary.main, 0.1);
  const headerBg = isDark
    ? alpha("#fff", 0.04)
    : alpha(theme.palette.primary.main, 0.05);
  const hoverBg = alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04);

  return {
    border: "none",
    borderRadius: 0,
    bgcolor: "transparent",
    fontSize: 14,
    "--DataGrid-rowBorderColor": hairline,
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: headerBg,
      borderBottom: `1px solid ${hairline}`,
      minHeight: "52px !important",
      maxHeight: "52px !important",
      lineHeight: "52px !important",
    },
    "& .MuiDataGrid-columnHeader": {
      outline: "none !important",
      "&:focus, &:focus-within": { outline: "none" },
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: theme.palette.text.secondary,
    },
    "& .MuiDataGrid-columnSeparator": {
      color: hairline,
      opacity: 0.6,
    },
    "& .MuiDataGrid-cell": {
      borderBottom: `1px solid ${hairline}`,
      display: "flex",
      alignItems: "center",
      py: 1.25,
      fontSize: 14,
      color: theme.palette.text.primary,
      outline: "none !important",
      "&:focus, &:focus-within": { outline: "none" },
    },
    "& .MuiDataGrid-row": {
      transition: "background-color 0.15s ease",
      "&:hover": { backgroundColor: hoverBg },
      "&.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
      },
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: `1px solid ${hairline}`,
      minHeight: 52,
      backgroundColor: isDark
        ? alpha("#fff", 0.02)
        : alpha(theme.palette.primary.main, 0.02),
    },
    "& .MuiDataGrid-toolbarContainer": {
      px: 2,
      py: 1.5,
      gap: 1,
      borderBottom: `1px solid ${hairline}`,
      flexWrap: "wrap",
    },
    "& .MuiTablePagination-root": {
      color: theme.palette.text.secondary,
    },
    "& .MuiDataGrid-overlay": {
      backgroundColor: isDark ? "rgba(20,27,45,0.7)" : "rgba(255,255,255,0.7)",
    },
  };
};

/** Outer paper wrapper for DataGrid / MUI tables. */
export const tableSurfaceSx: SxProps<Theme> = (theme) => ({
  width: "100%",
  overflow: "hidden",
  borderRadius: 1.5,
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(148,163,184,0.12)"
      : alpha(theme.palette.primary.main, 0.08)
  }`,
  bgcolor: "background.paper",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 24px rgba(0,0,0,0.28)"
      : "0 8px 24px rgba(49,46,129,0.05)",
});

/** Shared MUI TableContainer look. */
export const muiTableContainerSx: SxProps<Theme> = (theme) => {
  const isDark = theme.palette.mode === "dark";
  const hairline = isDark
    ? "rgba(148,163,184,0.12)"
    : alpha(theme.palette.primary.main, 0.1);

  return {
    borderRadius: 1.5,
    border: `1px solid ${hairline}`,
    bgcolor: "background.paper",
    overflow: "hidden",
    boxShadow: isDark
      ? "0 8px 24px rgba(0,0,0,0.28)"
      : "0 8px 24px rgba(49,46,129,0.05)",
    "& .MuiTableCell-head": {
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "text.secondary",
      bgcolor: isDark
        ? alpha("#fff", 0.04)
        : alpha(theme.palette.primary.main, 0.05),
      borderBottom: `1px solid ${hairline}`,
      py: 1.75,
    },
    "& .MuiTableCell-body": {
      fontSize: 14,
      borderBottom: `1px solid ${hairline}`,
      py: 1.5,
    },
    "& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-body": {
      borderBottom: "none",
    },
    "& .MuiTableRow-hover:hover": {
      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
    },
  };
};
