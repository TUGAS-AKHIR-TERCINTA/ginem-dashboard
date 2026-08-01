import { useTableDataQuery } from "@/hooks/api";
import {
  useServiceDeleteMutation,
  useServicePatchMutation,
  useServicePostMutation,
} from "@/hooks/api/useApiMutations";
import { ADMIN_API, adminService } from "@/services/adminService";
import type { IUser } from "@/types/User";

export function useAdminListQuery(params: {
  page: number;
  size: number;
  search?: string;
}) {
  return useTableDataQuery<IUser>(ADMIN_API.list, {
    page: params.page,
    size: params.size,
    filter: { search: params.search },
  });
}

export function useCreateAdminMutation() {
  return useServicePostMutation(adminService.create, {
    invalidateTablePaths: [ADMIN_API.list],
  });
}

export function useUpdateAdminMutation() {
  return useServicePatchMutation(adminService.update, {
    invalidateTablePaths: [ADMIN_API.list],
  });
}

export function useDeleteAdminMutation() {
  return useServiceDeleteMutation(adminService.delete, {
    invalidateTablePaths: [ADMIN_API.list],
  });
}
