import { apiClient } from "./api";

export const SETTINGS_API = {
  whatsappStatus: "/whatsapp/connection-status",
  whatsappConnect: "/whatsapp/connect?type=base64",
  whatsappDisconnect: "/whatsapp/disconnect",
} as const;

export interface WhatsappStatusData {
  connectionStatus: string;
  lastDisconnectReason?: string;
}

export interface WhatsappQrData {
  connectionStatus: string;
  timedOut: boolean;
  mimeType: string;
  qrImageBase64: string;
}

export const settingsService = {
  getWhatsappStatus: () =>
    apiClient.get<WhatsappStatusData>(SETTINGS_API.whatsappStatus),

  getWhatsappQr: () =>
    apiClient.get<WhatsappQrData>(SETTINGS_API.whatsappConnect),

  connectWhatsapp: () =>
    apiClient.get<WhatsappQrData>(SETTINGS_API.whatsappConnect),

  disconnectWhatsapp: () => apiClient.post(SETTINGS_API.whatsappDisconnect, {}),
};
