import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DeviceHubOutlinedIcon from "@mui/icons-material/DeviceHubOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import moment from "moment";

export interface DeviceLogItem {
  deviceLogId: number;
  deviceLogData: string;
  createdAt: string;
}

export interface DeviceCardItem {
  deviceId: number;
  deviceToken?: string | null;
  deviceName?: string | null;
  deviceType?: string | null;
  deviceStatus?: string | null;
  deviceFirmwareVersion?: string | null;
  deviceMetadata?: Record<string, string> | null;
  deviceLogs?: DeviceLogItem[];
  createdAt?: string | null;
}

interface DeviceCardProps {
  device: DeviceCardItem;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
  convertTime: (time: string) => string;
}

function getStatusColor(status: string): "success" | "default" {
  return String(status ?? "").toLowerCase() === "online"
    ? "success"
    : "default";
}

export default function DeviceCard({
  device,
  onDetail,
  onEdit,
  onDelete,
}: DeviceCardProps) {
  const theme = useTheme();
  const [tokenCopied, setTokenCopied] = useState(false);
  const status = String(device?.deviceStatus ?? "offline");
  const statusColor = getStatusColor(status);
  const isOnline = statusColor === "success";

  const primaryMain = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const isDark = theme.palette.mode === "dark";
  const mutedLabel = theme.palette.text.secondary;
  const gridColor = alpha(primaryMain, isDark ? 0.16 : 0.08);

  const logs = (device?.deviceLogs ?? []).slice();
  logs.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const chartCategories = logs.map((l) =>
    moment(l.createdAt).format("MM/DD HH:mm"),
  );
  const chartData = logs.map((l) => {
    const n = parseFloat(l.deviceLogData);
    return Number.isFinite(n) ? n : 0;
  });

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
      sparkline: { enabled: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 650,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
      colors: [primaryMain],
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: isDark ? "dark" : "light",
        type: "vertical",
        shadeIntensity: 0.35,
        gradientToColors: [primaryLight],
        inverseColors: false,
        opacityFrom: isDark ? 0.55 : 0.42,
        opacityTo: isDark ? 0.05 : 0.02,
        stops: [0, 88, 100],
      },
    },
    colors: [primaryMain],
    xaxis: {
      categories: chartCategories,
      labels: {
        style: { fontSize: "10px", colors: mutedLabel, fontWeight: 500 },
        maxHeight: 56,
        rotate: -35,
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "10px", colors: mutedLabel, fontWeight: 500 },
        formatter: (val) =>
          Number.isFinite(val) ? String(Math.round(val * 100) / 100) : "",
      },
      title: { text: undefined },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: false },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 8, right: 10, bottom: 0, left: 4 },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      style: { fontSize: "12px" },
      x: { format: "MM/DD HH:mm" },
      y: { formatter: (val) => String(val) },
      marker: { show: true },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    markers: {
      size: 0,
      hover: { size: 5, sizeOffset: 2 },
      colors: [primaryMain],
      strokeColors: theme.palette.background.paper,
      strokeWidth: 2,
    },
    plotOptions: {
      area: {
        fillTo: "origin",
      },
    },
  };

  const chartSeries = [{ name: "Value", data: chartData }];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: alpha(primaryMain, isDark ? 0.22 : 0.1),
        backgroundImage: `linear-gradient(
          165deg,
          ${alpha(primaryMain, isDark ? 0.1 : 0.04)} 0%,
          ${theme.palette.background.paper} 42%,
          ${theme.palette.background.paper} 100%
        )`,
        boxShadow: isDark
          ? `0 10px 28px ${alpha("#000", 0.35)}`
          : `0 10px 28px ${alpha(primaryMain, 0.07)}`,
        transition:
          "box-shadow 0.28s ease, border-color 0.28s ease, transform 0.28s ease",
        "&:hover": {
          borderColor: alpha(primaryMain, isDark ? 0.45 : 0.28),
          boxShadow: isDark
            ? `0 14px 36px ${alpha("#000", 0.45)}`
            : `0 14px 36px ${alpha(primaryMain, 0.14)}`,
          transform: "translateY(-2px)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${primaryMain}, ${primaryLight})`,
          opacity: 0.9,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack spacing={2.25}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  bgcolor: alpha(primaryMain, isDark ? 0.18 : 0.1),
                  border: "1px solid",
                  borderColor: alpha(primaryMain, isDark ? 0.35 : 0.18),
                  boxShadow: `inset 0 1px 0 ${alpha("#fff", isDark ? 0.06 : 0.55)}`,
                }}
              >
                <DeviceHubOutlinedIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="text.primary"
                  sx={{
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {device?.deviceName || "—"}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  spacing={0.5}
                  sx={{ mt: 0.25 }}
                >
                  <Typography
                    component="div"
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "0.7rem",
                      lineHeight: 1.3,
                      wordBreak: "break-all",
                      userSelect: "text",
                      cursor: "text",
                      py: 0.25,
                    }}
                  >
                    {device?.deviceToken || "—"}
                  </Typography>
                  {device?.deviceToken ? (
                    <Tooltip
                      title={
                        tokenCopied ? "Disalin ke clipboard" : "Salin token"
                      }
                    >
                      <IconButton
                        size="small"
                        aria-label="Salin device token"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              device.deviceToken ?? "",
                            );
                            setTokenCopied(true);
                            window.setTimeout(
                              () => setTokenCopied(false),
                              2000,
                            );
                          } catch {
                            /* noop */
                          }
                        }}
                        sx={{
                          mt: -0.5,
                          flexShrink: 0,
                          color: "primary.main",
                          "&:hover": {
                            bgcolor: alpha(primaryMain, 0.08),
                          },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Stack>
              </Box>
            </Stack>
            <Chip
              size="small"
              label={
                status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
              }
              color={statusColor}
              variant={isOnline ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
                flexShrink: 0,
                ...(isOnline
                  ? {
                      bgcolor: alpha(theme.palette.success.main, 0.14),
                      color: "success.dark",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.success.main, 0.35),
                    }
                  : {
                      borderColor: alpha(primaryMain, 0.22),
                      color: "text.secondary",
                    }),
              }}
            />
          </Stack>

          <Box>
            {logs.length > 0 ? (
              <Box
                sx={{
                  minHeight: 200,
                  borderRadius: 2.5,
                  overflow: "hidden",
                  px: 0.5,
                  pt: 1,
                  bgcolor: alpha(primaryMain, isDark ? 0.08 : 0.035),
                  border: "1px solid",
                  borderColor: alpha(primaryMain, isDark ? 0.2 : 0.1),
                  boxShadow: `inset 0 1px 0 ${alpha("#fff", isDark ? 0.04 : 0.7)}`,
                }}
              >
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={200}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  bgcolor: alpha(primaryMain, isDark ? 0.08 : 0.035),
                  borderRadius: 2.5,
                  border: "1px dashed",
                  borderColor: alpha(primaryMain, isDark ? 0.28 : 0.18),
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="primary.main"
                >
                  No log data
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Chart will appear when logs arrive
                </Typography>
              </Box>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={0.75}
            justifyContent="flex-end"
            sx={{ pt: 0.25 }}
          >
            <Tooltip title="Detail">
              <IconButton
                size="small"
                onClick={onDetail}
                aria-label="Detail"
                sx={{
                  border: "1px solid",
                  borderColor: alpha(primaryMain, isDark ? 0.22 : 0.12),
                  borderRadius: 2,
                  color: "primary.main",
                  bgcolor: alpha(primaryMain, isDark ? 0.06 : 0.03),
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha(primaryMain, isDark ? 0.16 : 0.1),
                  },
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update">
              <IconButton
                size="small"
                onClick={onEdit}
                aria-label="Update"
                sx={{
                  border: "1px solid",
                  borderColor: alpha(primaryMain, isDark ? 0.22 : 0.12),
                  borderRadius: 2,
                  color: "primary.main",
                  bgcolor: alpha(primaryMain, isDark ? 0.06 : 0.03),
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha(primaryMain, isDark ? 0.16 : 0.1),
                  },
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={onDelete}
                aria-label="Delete"
                sx={{
                  border: "1px solid",
                  borderColor: alpha(theme.palette.error.main, 0.28),
                  borderRadius: 2,
                  color: "error.main",
                  bgcolor: alpha(theme.palette.error.main, 0.04),
                  "&:hover": {
                    borderColor: "error.main",
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
