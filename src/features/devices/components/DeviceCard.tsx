import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
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
  const [tokenCopied, setTokenCopied] = useState(false);
  const status = String(device?.deviceStatus ?? "offline");
  const statusColor = getStatusColor(status);
  const isOnline = statusColor === "success";

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

  // Spline area colors (ApexCharts demo style: https://apexcharts.com/javascript-chart-demos/area-charts/spline/)
  const chartColors = isOnline
    ? { main: "#00E396", gradientTo: "#00E396" } // green (2nd default in ApexCharts)
    : { main: "#008FFB", gradientTo: "#77B6FF" }; // blue (1st default in ApexCharts)

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      sparkline: { enabled: false },
    },
    stroke: {
      curve: "smooth", // spline
      width: 2,
      colors: [chartColors.main],
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: [chartColors.gradientTo],
        opacityFrom: 0.85,
        opacityTo: 0.45,
        stops: [0, 100],
      },
    },
    colors: [chartColors.main],
    xaxis: {
      categories: chartCategories,
      labels: {
        style: { fontSize: "11px", colors: "#666" },
        maxHeight: 70,
        rotate: -45,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "11px", colors: "#666" } },
      title: { text: undefined },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: false },
    },
    grid: {
      borderColor: "rgba(0,0,0,0.06)",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 8, bottom: 0, left: 8 },
    },
    tooltip: {
      theme: "light",
      x: { format: "MM/DD HH:mm" },
      y: { formatter: (val) => String(val) },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    markers: { size: 0 },
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
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        transition:
          "box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack spacing={2.5}>
          {/* Top row: icon + name + status */}
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
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                  borderRadius: 2.5,
                  bgcolor: isOnline ? "success.light" : "grey.100",
                  color: isOnline ? "success.dark" : "grey.700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid",
                  borderColor: isOnline ? "success.main" : "grey.300",
                }}
              >
                <DeviceHubOutlinedIcon sx={{ fontSize: 30 }} />
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
                        sx={{ mt: -0.5, flexShrink: 0 }}
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
              variant="outlined"
              sx={{ fontWeight: 700, flexShrink: 0 }}
            />
          </Stack>

          {/* Area chart */}
          <Box>
            {logs.length > 0 ? (
              <Box
                sx={{
                  minHeight: 200,
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
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
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No log data
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-end"
            sx={{
              pt: 0.5,
              "& .MuiIconButton-root": {
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.selected",
                },
              },
            }}
          >
            <Tooltip title="Detail">
              <IconButton size="small" onClick={onDetail}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update">
              <IconButton size="small" color="primary" onClick={onEdit}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
