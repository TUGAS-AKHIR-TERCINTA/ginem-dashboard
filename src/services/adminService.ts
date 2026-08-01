import type { IUser } from "@/types/User";
import type { AdminCreateValues } from "@/utils/validators/adminSchema";
import { apiClient } from "./api";
import type { PaginatedResponse } from "./types";

export const ADMIN_API = {
  list: "/admins",
} as const;

export interface AdminListParams {
  page: number;
  size: number;
  search?: string;
}

export interface AdminUpdatePayload {
  userId: number;
  userName: string;
  userEmail: string;
  userPassword?: string;
}

export const adminService = {
  getList: (params: AdminListParams): Promise<PaginatedResponse<IUser>> =>
    apiClient.getTableData<IUser>({
      path: ADMIN_API.list,
      page: params.page,
      size: params.size,
      filter: { search: params.search },
    }),

  create: (payload: AdminCreateValues) =>
    apiClient.post(ADMIN_API.list, payload),

  update: (payload: AdminUpdatePayload) =>
    apiClient.patch(ADMIN_API.list, payload),

  delete: (userId: number) => apiClient.remove(`${ADMIN_API.list}/${userId}`),
};
