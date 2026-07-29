import { useState } from "react";
import Box from "@mui/material/Box";
import { useDeviceDetailQuery } from "@/hooks/services";
import {
  Alert,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import { IconMenus } from "@/assets/icons";
import { convertTime } from "@/utils/convertTime";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IDeviceValue } from "@/types/Device";
import { muiTableContainerSx } from "@/styles/tableStyles";
import { ROUTES } from "@/routes/routes";

export default function DetailDeviceView() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [tokenCopied, setTokenCopied] = useState(false);

  const {
    data: device,
    isLoading: loading,
    isError,
  } = useDeviceDetailQuery(deviceId);

  const errorMessage = isError ? "Failed to load device." : null;

  const handleCopyToken = async () => {
    if (!device?.deviceToken) return;
    try {
      await navigator.clipboard.writeText(device.deviceToken);
      setTokenCopied(true);
      window.setTimeout(() => setTokenCopied(false), 2000);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const getStatusColor = (
    status: string,
  ): "default" | "primary" | "success" | "warning" | "error" => {
    const s = String(status ?? "").toLowerCase();
    if (s === "online") return "success";
    if (s === "offline") return "warning";
    return "default";
  };

  const metadata = device?.deviceMetadata;
  const metadataEntries =
    metadata && typeof metadata === "object" ? Object.entries(metadata) : [];
  const deviceValues = device?.deviceValues ?? [];

  return (
    <Box sx={{ pb: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Devices",
            link: ROUTES.devices,
            icon: <IconMenus.device fontSize="small" />,
          },
          {
            label: device ? device.deviceName || "Detail" : "Detail",
            link: undefined,
          },
        ]}
      />

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTES.devices)}
          >
            Back
          </Button>
        </Stack>

        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : device ? (
          <>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.25}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  {device.deviceName || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Device ID: {device.deviceId}
                </Typography>
              </Box>
              <Chip
                size="medium"
                label={
                  (device.deviceStatus ?? "offline").charAt(0).toUpperCase() +
                  (device.deviceStatus ?? "offline").slice(1).toLowerCase()
                }
                color={getStatusColor(device.deviceStatus)}
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Device info
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
                  <Typography variant="caption" color="text.secondary">
                    Token
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "ui-monospace, monospace",
                        wordBreak: "break-all",
                        userSelect: "text",
                      }}
                    >
                      {device.deviceToken || "—"}
                    </Typography>
                    {device.deviceToken ? (
                      <Tooltip
                        title={
                          tokenCopied ? "Copied to clipboard" : "Copy token"
                        }
                      >
                        <IconButton
                          size="small"
                          aria-label="Copy device token"
                          onClick={handleCopyToken}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2">
                    {device.deviceType ?? "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Firmware version
                  </Typography>
                  <Typography variant="body2">
                    {device.deviceFirmwareVersion ?? "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created at
                  </Typography>
                  <Typography variant="body2">
                    {convertTime(device.createdAt) || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Updated at
                  </Typography>
                  <Typography variant="body2">
                    {device?.updatedAt ? convertTime(device.updatedAt) : "—"}
                  </Typography>
                </Box>
              </Stack>
              {metadataEntries.length > 0 ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Metadata
                  </Typography>
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={2}
                    sx={{ mt: 0.5 }}
                  >
                    {metadataEntries.map(([key, value]) => (
                      <Chip
                        key={key}
                        size="small"
                        label={`${key}: ${value}`}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Stack>

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Device values
            </Typography>
            {deviceValues.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No device values.
              </Typography>
            ) : (
              <TableContainer sx={muiTableContainerSx}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Created at</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deviceValues.map((item: IDeviceValue) => (
                      <TableRow key={item.deviceValueId} hover>
                        <TableCell>{item.deviceValueId}</TableCell>
                        <TableCell>{item.deviceValueValue ?? "—"}</TableCell>
                        <TableCell>
                          {convertTime(item.createdAt) || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        ) : !loading && !errorMessage ? (
          <Typography color="text.secondary">Device not found.</Typography>
        ) : null}
      </Paper>
    </Box>
  );
}
