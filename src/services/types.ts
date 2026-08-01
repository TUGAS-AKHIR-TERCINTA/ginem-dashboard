export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages?: number;
  currentPage?: number;
  page?: number;
  size?: number;
}

export interface TableQueryParams {
  path: string;
  page?: number;
  size?: number;
  filter?: Record<string, string | undefined>;
}
