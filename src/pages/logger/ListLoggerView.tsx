import {
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { useState } from "react";
import { useLoggerListQuery } from "@/hooks/services";
import { Button, Chip, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import PageHeader from "@/components/common/PageHeader";
import AppDataGrid from "@/components/common/AppDataGrid";
import { IconMenus } from "@/assets/icons";
import { convertTime } from "@/utils/convertTime";
import { ROUTES } from "@/routes/routes";

export default function ListLoggerView() {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { data, isFetching, refetch } = useLoggerListQuery({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    search: "",
  });

  const tableData = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;
  const loading = isFetching;

  const getLevelChipProps = (
    raw: unknown,
  ): { label: string; color: "error" | "warning" | "info" | "default" } => {
    const level = String(raw ?? "").toLowerCase();
    if (level === "error") {
      return { label: "error", color: "error" };
    }
    if (level === "warn" || level === "warning") {
      return { label: "warn", color: "warning" };
    }
    if (level === "info") {
      return { label: "info", color: "info" };
    }
    return { label: String(raw ?? "—"), color: "default" };
  };

  const columns: GridColDef[] = [
    {
      field: "appLogId",
      headerName: "ID",
      width: 90,
    },
    {
      field: "appLogLevel",
      width: 120,
      headerName: "Level",
      renderCell: (params) => {
        const { label, color } = getLevelChipProps(params.value);
        return (
          <Chip size="small" label={label} color={color} variant="outlined" />
        );
      },
    },
    {
      field: "appLogMessage",
      flex: 2,
      minWidth: 200,
      headerName: "Message",
    },
    {
      field: "createdAt",
      flex: 1,
      minWidth: 160,
      headerName: "Created at",
      valueFormatter: (item) => convertTime(item.value),
    },
  ];

  function CustomToolbar() {
    const [search, setSearch] = useState<string>("");
    return (
      <GridToolbarContainer
        sx={{ justifyContent: "space-between", width: "100%" }}
      >
        <Stack direction="row" spacing={1}>
          <GridToolbarExport />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outlined" onClick={() => refetch()}>
            Search
          </Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Logger",
            link: ROUTES.logger,
            icon: <IconMenus.logger fontSize="small" />,
          },
        ]}
      />
      <PageHeader
        title="Application logs"
        subtitle="Browse and export recent system events"
      />
      <AppDataGrid
        rows={tableData}
        columns={columns}
        getRowId={(row) => row.appLogId}
        loading={loading}
        pageSizeOptions={[5, 10, 25]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        slots={{ toolbar: CustomToolbar }}
        rowCount={rowCount}
        paginationMode="server"
      />
    </>
  );
}
