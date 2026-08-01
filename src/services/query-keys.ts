export const queryKeys = {
  all: ["api"] as const,
  get: (path: string) => [...queryKeys.all, "get", path] as const,
  table: (
    path: string,
    params: { page: number; size: number; filterKey: string },
  ) => [...queryKeys.all, "table", path, params] as const,
  tableRoot: (path: string) => [...queryKeys.all, "table", path] as const,
};
