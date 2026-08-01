import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", () => ({
  apiClient: {
    get: vi.fn(),
    getTableData: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
  },
}));

import { apiClient } from "@/services/api";
import { SETTINGS_API, settingsService } from "./settingsService";

describe("settingsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getWhatsappStatus fetches connection status", async () => {
    const status = { connectionStatus: "connected" };
    vi.mocked(apiClient.get).mockResolvedValue(status);

    const result = await settingsService.getWhatsappStatus();

    expect(apiClient.get).toHaveBeenCalledWith(SETTINGS_API.whatsappStatus);
    expect(result).toEqual(status);
  });

  it("getWhatsappQr fetches QR code data", async () => {
    await settingsService.getWhatsappQr();

    expect(apiClient.get).toHaveBeenCalledWith(SETTINGS_API.whatsappConnect);
  });

  it("connectWhatsapp triggers connect endpoint", async () => {
    await settingsService.connectWhatsapp();

    expect(apiClient.get).toHaveBeenCalledWith(SETTINGS_API.whatsappConnect);
  });

  it("disconnectWhatsapp posts to disconnect endpoint", async () => {
    await settingsService.disconnectWhatsapp();

    expect(apiClient.post).toHaveBeenCalledWith(
      SETTINGS_API.whatsappDisconnect,
      {},
    );
  });
});
