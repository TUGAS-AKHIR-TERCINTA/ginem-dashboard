import type { IIndexing } from "@/types/Indexing";
import { apiClient } from "./api";
import type { PaginatedResponse } from "./types";

export const EMBEDDING_API = {
  list: "/indexing",
} as const;

export interface EmbeddingListParams {
  page: number;
  size: number;
  search?: string;
}

export interface EmbeddingDocumentPayload {
  content: string;
  source: string;
}

export interface EmbeddingCreatePayload {
  documents: EmbeddingDocumentPayload[];
}

export const embeddingService = {
  getList: (
    params: EmbeddingListParams,
  ): Promise<PaginatedResponse<IIndexing>> =>
    apiClient.getTableData<IIndexing>({
      path: EMBEDDING_API.list,
      page: params.page,
      size: params.size,
      filter: { search: params.search },
    }),

  create: (payload: EmbeddingCreatePayload) =>
    apiClient.post(EMBEDDING_API.list, payload),

  delete: (indexingId: number) =>
    apiClient.remove(`${EMBEDDING_API.list}/${indexingId}`),
};
