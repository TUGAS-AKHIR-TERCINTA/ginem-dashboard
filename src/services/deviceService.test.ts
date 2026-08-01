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
import { DEVICE_API, deviceService } from "./deviceService";

describe("deviceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getList fetches paginated devices with search filter", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    await deviceService.getList({ page: 2, size: 25, search: "sensor" });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: DEVICE_API.list,
      page: 2,
      size: 25,
      filter: { search: "sensor" },
    });
  });

  it("getDetail fetches device by id", async () => {
    await deviceService.getDetail(7);

    expect(apiClient.get).toHaveBeenCalledWith("/devices/detail/7");
  });

  it("create posts new device payload", async () => {
    const payload = {
      deviceName: "Sensor A",
      deviceType: "sensor",
    };

    await deviceService.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith(DEVICE_API.list, payload);
  });

  it("update patches device payload", async () => {
    const payload = {
      deviceId: 1,
      deviceName: "Sensor A",
      deviceStatus: "online",
      deviceMetadata: {},
    };

    await deviceService.update(payload);

    expect(apiClient.patch).toHaveBeenCalledWith(DEVICE_API.list, payload);
  });

  it("delete removes device by id", async () => {
    await deviceService.delete(9);

    expect(apiClient.remove).toHaveBeenCalledWith("/devices/9");
  });
});
