import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  useDashboardLogsQuery,
  useDashboardStatsQuery,
} from "@/hooks/services";
import type { DashboardStats } from "@/services/dashboardService";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import PageHeader from "@/components/common/PageHeader";
import { IconMenus } from "@/assets/icons";
import Alert from "@mui/material/Alert";
import DeviceHubOutlinedIcon from "@mui/icons-material/DeviceHubOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import { convertTime } from "@/utils/convertTime";
import { Chip, Stack, alpha } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import AppDataGrid from "@/components/common/AppDataGrid";
import { brand } from "@/styles/theme";
import { ROUTES } from "@/routes/routes";

const statCards: {
  key: keyof DashboardStats;
  label: string;
  hint: string;
  icon: React.ElementType;
  bg: string;
  fg: string;
}[] = [
  {
    key: "devices",
    label: "Devices",
    hint: "Connected hardware",
    icon: DeviceHubOutlinedIcon,
    bg: `linear-gradient(145deg, ${brand.mint} 0%, ${brand.mintDeep} 100%)`,
    fg: "#064E3B",
  },
  {
    key: "users",
    label: "Admins",
    hint: "Team members",
    icon: PeopleOutlinedIcon,
    bg: `linear-gradient(145deg, ${brand.coral} 0%, ${brand.coralDeep} 100%)`,
    fg: "#FFFFFF",
  },
  {
    key: "vectorIndexes",
    label: "Embeddings",
    hint: "Vector indexes",
    icon: StorageOutlinedIcon,
    bg: `linear-gradient(145deg, ${brand.cyan} 0%, ${brand.cyanDeep} 100%)`,
    fg: "#083344",
  },
  {
    key: "schedulerLogs",
    label: "Schedulers",
    hint: "Job activity",
    icon: AccessAlarmIcon,
    bg: `linear-gradient(145deg, ${brand.orange} 0%, #F59E0B 100%)`,
    fg: "#FFFFFF",
  },
];

export default function DashboardView() {
  const {
    data: statsResult,
    isLoading: statsLoading,
    isError: statsError,
  } = useDashboardStatsQuery();

  const stats = statsResult ?? null;
  const error = statsError ? "Failed to load statistics." : null;

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { data: logsData, isFetching: logsLoading } = useDashboardLogsQuery({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    search: "",
  });

  const tableData = logsData?.items ?? [];
  const rowCount = logsData?.totalItems ?? 0;

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
      width: 90,
      headerName: "ID",
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

  return (
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Dashboard",
            link: ROUTES.home,
            icon: <IconMenus.dashboard fontSize="small" />,
          },
        ]}
      />

      <PageHeader
        title="Overview"
        subtitle="Live stats and recent application logs"
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map(({ key, label, hint, icon: Icon, bg, fg }) => (
          <Grid item key={key} xs={12} sm={6} lg={3}>
            <Card
              sx={{
                height: "100%",
                background: bg,
                color: fg,
                border: "none",
                boxShadow: `0 16px 36px ${alpha("#312E81", 0.12)}`,
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  right: -40,
                  top: -40,
                  bgcolor: "rgba(255,255,255,0.18)",
                },
              }}
            >
              <CardContent sx={{ p: 2.75, position: "relative", zIndex: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.28)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.85, fontWeight: 600 }}
                  >
                    {hint}
                  </Typography>
                </Stack>
                {statsLoading ? (
                  <>
                    <Skeleton variant="text" width={80} height={36} />
                    <Skeleton variant="text" width={60} height={22} />
                  </>
                ) : (
                  <>
                    <Typography variant="h4" fontWeight={800} lineHeight={1.1}>
                      {stats?.[key] ?? 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ mt: 0.75, opacity: 0.9 }}
                    >
                      {label}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1.5, px: 1 }}
        >
          <QueryStatsOutlinedIcon color="primary" fontSize="small" />
          <Typography fontWeight={700}>Latest application logs</Typography>
        </Stack>
        <AppDataGrid
          withSurface={false}
          rows={tableData}
          columns={columns}
          getRowId={(row) => row.appLogId}
          loading={logsLoading}
          pageSizeOptions={[5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          paginationMode="server"
        />
      </Card>
    </Box>
  );
}
