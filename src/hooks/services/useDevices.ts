import { useApiGet, useTableDataQuery } from "@/hooks/api";
import {
  useServiceDeleteMutation,
  useServicePatchMutation,
  useServicePostMutation,
} from "@/hooks/api/useApiMutations";
import { DEVICE_API, deviceService } from "@/services/deviceService";
import type { IDevice } from "@/types/Device";

export function useDeviceListQuery(params: {
  page: number;
  size: number;
  search?: string;
  refetchInterval?: number | false;
}) {
  return useTableDataQuery<IDevice>(DEVICE_API.list, {
    page: params.page,
    size: params.size,
    filter: { search: params.search },
    refetchInterval: params.refetchInterval,
  });
}

export function useDeviceDetailQuery(deviceId?: string) {
  return useApiGet<IDevice>(deviceId ? DEVICE_API.detail(deviceId) : "", {
    enabled: Boolean(deviceId),
  });
}

export function useCreateDeviceMutation() {
  return useServicePostMutation(deviceService.create, {
    invalidateTablePaths: [DEVICE_API.list],
  });
}

export function useUpdateDeviceMutation() {
  return useServicePatchMutation(deviceService.update, {
    invalidateTablePaths: [DEVICE_API.list],
  });
}

export function useDeleteDeviceMutation() {
  return useServiceDeleteMutation(deviceService.delete, {
    invalidateTablePaths: [DEVICE_API.list],
  });
}
