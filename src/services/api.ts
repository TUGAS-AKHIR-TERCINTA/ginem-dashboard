import axios, { type AxiosInstance } from "axios";
import { CONFIGS } from "@/config/env";
import type { PaginatedResponse, TableQueryParams } from "./types";

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(CONFIGS.localStorageKey) || "";
  return {
    Authorization: `Bearer ${token}`,
  };
}

function handleUnauthorized(): void {
  localStorage.removeItem(CONFIGS.localStorageKey);
  window.location.pathname = "/";
}

function normalizeFilters(
  filter?: Record<string, string | undefined>,
): Record<string, string> | undefined {
  if (!filter) return undefined;
  const entries = Object.entries(filter).filter(
    ([, value]) => value != null && value !== "",
  ) as [string, string][];
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/** Shared Axios instance — base URL, auth header, and 401 handling. */
export const api: AxiosInstance = axios.create({
  baseURL: CONFIGS.baseUrl,
});

api.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  config.headers.Authorization = headers.Authorization;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      handleUnauthorized();
    }

    const message = axios.isAxiosError(error)
      ? ((error.response?.data as { message?: string } | undefined)?.message ??
        error.message)
      : error instanceof Error
        ? error.message
        : "Request failed";

    console.log(message);
    return Promise.reject(new Error(message));
  },
);

async function get<T>(path: string): Promise<T> {
  const response = await api.get<{ data: T }>(path);
  return response.data.data;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await api.post<T>(path, body);
  return response.data;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const response = await api.patch<T>(path, body);
  return response.data;
}

async function remove<T>(path: string): Promise<T> {
  const response = await api.delete<T>(path);
  return response.data;
}

async function getTableData<T>(
  params: TableQueryParams,
): Promise<PaginatedResponse<T>> {
  // Backend validates page >= 1 (MUI DataGrid / Pagination UI is 0-based)
  const page = Math.max(1, params.page ?? 1);
  const size = params.size ?? 10;
  const filters = normalizeFilters(params.filter);
  const queryFilter = new URLSearchParams(filters).toString();

  const response = await api.get<{ data: PaginatedResponse<T> }>(
    `${params.path}?pagination=true&page=${page}&size=${size}&${queryFilter}`,
  );

  return {
    ...response.data.data,
    page,
    size,
  };
}

/** Typed HTTP helpers used by TanStack Query hooks and domain services. */
export const apiClient = {
  get,
  post,
  patch,
  remove,
  getTableData,
};
