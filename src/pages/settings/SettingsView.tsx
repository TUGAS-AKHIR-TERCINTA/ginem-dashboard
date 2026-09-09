import { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  useDisconnectWhatsappMutation,
  useWhatsappQrQuery,
  useWhatsappStatusQuery,
  useLLMModelsQuery,
  useSelectedLLMQuery,
  useSelectLLMMutation,
} from "@/hooks/services";
import { settingsService } from "@/services/settingsService";
import { useApiErrorHandler } from "@/hooks/api/useApiErrorHandler";
import { useAppContext } from "@/context/app.context";
import PageHeader from "@/components/common/PageHeader";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import { IconMenus } from "@/assets/icons";
import { ROUTES } from "@/routes/routes";

export default function SettingsView() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const onError = useApiErrorHandler();
  const { setAppAlert } = useAppContext();

  const {
    data: status,
    isLoading: loadingStatus,
    refetch: refetchStatus,
  } = useWhatsappStatusQuery();

  const isConnecting = connecting || status?.connectionStatus === "connecting";

  const { data: qrData, isFetching: loadingQR } = useWhatsappQrQuery({
    enabled: isConnecting,
    refetchInterval: isConnecting ? 5000 : false,
  });

  const disconnect = useDisconnectWhatsappMutation();

  // LLM Settings
  const { data: models, isLoading: modelsLoading } = useLLMModelsQuery();
  const { data: selectedModel, isLoading: selectedLoading, error: selectedError } = useSelectedLLMQuery();
  const selectModel = useSelectLLMMutation();


  // Use first model as default if selected endpoint fails
  const defaultSelectedModel = !selectedError && selectedModel ? selectedModel : models?.items?.[0];

  const groupedModels = models?.items ? Object.values(models.items).reduce(
    (acc: Record<string, any[]>, model: any) => {
      const provider = model.provider;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, any[]>,
  ) : {};


  const handleConnect = async () => {
    try {
      setConnectLoading(true);
      setError(null);
      await settingsService.connectWhatsapp();
      setConnecting(true);
      refetchStatus();
    } catch (err) {
      onError(err);
      setError("Failed to connect");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      await disconnect.mutateAsync();
      setConnecting(false);
      refetchStatus();
    } catch {
      setError("Failed to disconnect");
    }
  };

  const handleSelectModel = async (modelId: string) => {
    try {
      setModelError(null);
      await selectModel.mutateAsync({ modelId });
      setAppAlert({
        isDisplayAlert: true,
        message: "Model changed successfully",
        alertType: "success",
      });
    } catch (err) {
      onError(err);
      setModelError("Failed to change model");
    }
  };

  const getStatusColor = () => {
    const connectionStatus = isConnecting
      ? "connecting"
      : status?.connectionStatus;
    switch (connectionStatus) {
      case "connected":
        return "success";
      case "connecting":
        return "warning";
      default:
        return "default";
    }
  };

  const displayStatus = isConnecting
    ? "connecting"
    : (status?.connectionStatus ?? "disconnected");

  const showQrLoading =
    connectLoading || (isConnecting && loadingQR && !qrData);

  return (
    <Box marginBottom={5}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Settings",
            link: ROUTES.settings,
            icon: <IconMenus.settings fontSize="small" />,
          },
        ]}
      />
      <PageHeader
        title="Settings"
        subtitle="WhatsApp connection and model preferences"
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                WhatsApp Connection
              </Typography>

              {loadingStatus ? (
                <CircularProgress size={20} />
              ) : (
                status && (
                  <Stack spacing={1} mb={2}>
                    <Chip
                      label={displayStatus.toUpperCase()}
                      color={
                        getStatusColor() as "default" | "success" | "warning"
                      }
                    />

                    {status.lastDisconnectReason && (
                      <Typography variant="caption" color="text.secondary">
                        {status.lastDisconnectReason}
                      </Typography>
                    )}
                  </Stack>
                )
              )}

              <Divider sx={{ mb: 3 }} />

              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={260}
                mb={3}
                sx={{
                  border: "1px dashed #ccc",
                  borderRadius: 2,
                  backgroundColor: "background.default",
                }}
              >
                {showQrLoading ? (
                  <CircularProgress />
                ) : qrData && isConnecting ? (
                  <Box
                    component="img"
                    src={`data:${qrData.mimeType};base64,${qrData.qrImageBase64}`}
                    sx={{ width: 220, height: 220 }}
                  />
                ) : (
                  <Typography color="text.secondary">
                    Click connect to start pairing
                  </Typography>
                )}
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleConnect}
                  disabled={
                    connectLoading ||
                    disconnect.isPending ||
                    status?.connectionStatus === "connected"
                  }
                >
                  Connect
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleDisconnect}
                  disabled={
                    connectLoading ||
                    disconnect.isPending ||
                    status?.connectionStatus !== "connected"
                  }
                >
                  Disconnect
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                LLM Settings
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose which model will be used for AI responses.
              </Typography>

              {selectedLoading || modelsLoading ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  {defaultSelectedModel && (
                    <Stack spacing={2} mb={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Currently Selected:
                        </Typography>
                        <Chip
                          label={`${defaultSelectedModel.provider} - ${defaultSelectedModel.name}`}
                          color="primary"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Stack>
                  )}

                  {modelError && <Alert severity="error">{modelError}</Alert>}

                  <FormControl fullWidth disabled={selectModel.isPending}>
                    <InputLabel>Select Model</InputLabel>
                    <Select
                      value={defaultSelectedModel?.id || ""}
                      label="Select Model"
                      onChange={(e) => handleSelectModel(e.target.value)}
                    >
                      {Object.entries(groupedModels).map(
                        ([provider, providerModels]: [string, any]) => [
                          <MenuItem key={`${provider}-header`} disabled>
                            <strong>{provider}</strong>
                          </MenuItem>,
                          ...providerModels?.map((model: any) => (
                            <MenuItem key={model.id} value={model.id}>
                              {model.name}
                            </MenuItem>
                          )),
                        ],
                      ).flat()}
                    </Select>
                  </FormControl>

                  {selectModel.isPending && (
                    <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Changing model...
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
