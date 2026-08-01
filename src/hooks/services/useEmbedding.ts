import { useTableDataQuery } from "@/hooks/api";
import {
  useServiceDeleteMutation,
  useServicePostMutation,
} from "@/hooks/api/useApiMutations";
import { EMBEDDING_API, embeddingService } from "@/services/embeddingService";
import type { IIndexing } from "@/types/Indexing";

export function useEmbeddingListQuery(params: {
  page: number;
  size: number;
  search?: string;
}) {
  return useTableDataQuery<IIndexing>(EMBEDDING_API.list, {
    page: params.page,
    size: params.size,
    filter: { search: params.search },
  });
}

export function useCreateEmbeddingMutation() {
  return useServicePostMutation(embeddingService.create, {
    invalidateTablePaths: [EMBEDDING_API.list],
  });
}

export function useDeleteEmbeddingMutation() {
  return useServiceDeleteMutation(embeddingService.delete, {
    invalidateTablePaths: [EMBEDDING_API.list],
  });
}
