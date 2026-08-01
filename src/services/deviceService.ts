import type { IDevice } from "@/types/Device";
import { apiClient } from "./api";
import type { PaginatedResponse } from "./types";

export const DEVICE_API = {
  list: "/devices",
  detail: (deviceId: string | number) => `/devices/detail/${deviceId}`,
} as const;

export interface DeviceListParams {
  page: number;
  size: number;
  search?: string;
}

export interface DeviceCreatePayload {
  deviceName: string;
  deviceType: string;
  deviceFirmwareVersion?: string;
  deviceMetadata?: Record<string, string>;
}

export interface DeviceUpdatePayload {
  deviceId: number;
  deviceName: string;
  deviceStatus: string;
  deviceFirmwareVersion?: string;
  deviceMetadata: Record<string, string>;
}

export const deviceService = {
  getList: (params: DeviceListParams): Promise<PaginatedResponse<IDevice>> =>
    apiClient.getTableData<IDevice>({
      path: DEVICE_API.list,
      page: params.page,
      size: params.size,
      filter: { search: params.search },
    }),

  getDetail: (deviceId: string | number) =>
    apiClient.get<IDevice>(DEVICE_API.detail(deviceId)),

  create: (payload: DeviceCreatePayload) =>
    apiClient.post(DEVICE_API.list, payload),

  update: (payload: DeviceUpdatePayload) =>
    apiClient.patch(DEVICE_API.list, payload),

  delete: (deviceId: number) =>
    apiClient.remove(`${DEVICE_API.list}/${deviceId}`),
};
