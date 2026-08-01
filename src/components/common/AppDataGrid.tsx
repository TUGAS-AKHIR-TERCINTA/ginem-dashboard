import Box from "@mui/material/Box";
import { DataGrid, type DataGridProps } from "@mui/x-data-grid";
import { dataGridSx, tableSurfaceSx } from "@/styles/tableStyles";

type AppDataGridProps = DataGridProps & {
  /** When false, skip the outer paper surface (e.g. already inside a Card). */
  withSurface?: boolean;
};

/**
 * Shared DataGrid wrapper — consistent density, borders, header, and hover.
 * Pass additional `sx` to extend (merged after base styles).
 */
export default function AppDataGrid({
  withSurface = true,
  sx,
  disableRowSelectionOnClick = true,
  autoHeight = true,
  ...props
}: AppDataGridProps) {
  const grid = (
    <DataGrid
      {...props}
      autoHeight={autoHeight}
      disableRowSelectionOnClick={disableRowSelectionOnClick}
      sx={sx ? ([dataGridSx, sx] as DataGridProps["sx"]) : dataGridSx}
    />
  );

  if (!withSurface) return grid;

  return <Box sx={tableSurfaceSx}>{grid}</Box>;
}
