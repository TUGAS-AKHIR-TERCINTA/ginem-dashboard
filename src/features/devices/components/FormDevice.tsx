import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";

const FIRMWARE_OPTIONS = [
  "",
  "v1.0.0",
  "v1.1.0",
  "v2.0.0",
  "v2.1.0",
  "v2.2.0",
  "v3.0.0",
] as const;
const DEVICE_TYPE_OPTIONS = ["sensor", "actuator", "hybrid"] as const;
const DEVICE_STATUS_OPTIONS = ["online", "offline"] as const;

export type DeviceCreateFormState = {
  deviceName: string;
  deviceType: string;
  deviceFirmwareVersion: string;
  deviceMetadataRoom: string;
  deviceMetadataVoltage: string;
};

export type DeviceEditFormState = {
  deviceName: string;
  deviceStatus: string;
  deviceFirmwareVersion: string;
  deviceMetadataRoom: string;
  deviceMetadataVoltage: string;
};

export type DeviceFormMode = "create" | "edit";

type FormDeviceCreateProps = {
  open: boolean;
  submitLoading: boolean;
  formError: string | null;
  mode: "create";
  form: DeviceCreateFormState;
  setForm: React.Dispatch<React.SetStateAction<DeviceCreateFormState>>;
  onClose: () => void;
  onSubmit: () => void;
};

type FormDeviceEditProps = {
  open: boolean;
  submitLoading: boolean;
  formError: string | null;
  mode: "edit";
  form: DeviceEditFormState;
  setForm: React.Dispatch<React.SetStateAction<DeviceEditFormState>>;
  onClose: () => void;
  onSubmit: () => void;
};

export type FormDeviceProps = FormDeviceCreateProps | FormDeviceEditProps;

export default function FormDevice({
  open,
  submitLoading,
  formError,
  mode,
  form,
  setForm,
  onClose,
  onSubmit,
}: FormDeviceProps) {
  const patchForm = (patch: Record<string, string>) => {
    setForm((prev: DeviceCreateFormState | DeviceEditFormState) => ({
      ...prev,
      ...patch,
    }) as DeviceCreateFormState & DeviceEditFormState);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "edit" ? "Update Device" : "Add Device"}
      </DialogTitle>
      <DialogContent>
        {formError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        ) : null}
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            size="small"
            label="Device Name"
            required
            fullWidth
            value={form.deviceName}
            onChange={(e) => patchForm({ deviceName: e.target.value })}
            placeholder="e.g. Sensor Kebakaran"
          />
          {mode === "create" ? (
            <FormControl size="small" fullWidth required>
              <InputLabel id="device-type-label">Device Type</InputLabel>
              <Select
                labelId="device-type-label"
                id="device-type"
                value={form.deviceType}
                label="Device Type"
                onChange={(e) =>
                  patchForm({ deviceType: String(e.target.value) })
                }
              >
                {DEVICE_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl size="small" fullWidth>
              <InputLabel id="device-status-label">Device Status</InputLabel>
              <Select
                labelId="device-status-label"
                id="device-status"
                value={form.deviceStatus}
                label="Device Status"
                onChange={(e) =>
                  patchForm({ deviceStatus: String(e.target.value) })
                }
              >
                {DEVICE_STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl size="small" fullWidth>
            <InputLabel id="device-firmware-label">Firmware Version</InputLabel>
            <Select
              labelId="device-firmware-label"
              id="device-firmware"
              value={form.deviceFirmwareVersion}
              label="Firmware Version"
              onChange={(e) =>
                patchForm({ deviceFirmwareVersion: String(e.target.value) })
              }
            >
              {FIRMWARE_OPTIONS.map((opt) =>
                opt === "" ? (
                  <MenuItem key="none" value="">
                    <em>None</em>
                  </MenuItem>
                ) : (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ pt: 0.5 }}
          >
            Metadata (optional)
          </Typography>
          <TextField
            size="small"
            label="Room"
            fullWidth
            value={form.deviceMetadataRoom}
            onChange={(e) => patchForm({ deviceMetadataRoom: e.target.value })}
            placeholder="e.g. bedroom"
          />
          <TextField
            size="small"
            label="Voltage"
            fullWidth
            value={form.deviceMetadataVoltage}
            onChange={(e) =>
              patchForm({ deviceMetadataVoltage: e.target.value })
            }
            placeholder="e.g. 220V"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitLoading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={submitLoading}>
          {mode === "edit"
            ? submitLoading
              ? "Updating..."
              : "Update"
            : submitLoading
              ? "Submitting..."
              : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
