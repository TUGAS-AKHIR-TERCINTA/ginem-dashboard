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
import { EMBEDDING_API, embeddingService } from "./embeddingService";

describe("embeddingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getList fetches paginated indexing records", async () => {
    await embeddingService.getList({ page: 1, size: 10, search: "pdf" });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: EMBEDDING_API.list,
      page: 1,
      size: 10,
      filter: { search: "pdf" },
    });
  });

  it("create posts documents for indexing", async () => {
    const payload = {
      documents: [{ content: "Hello", source: "text" }],
    };

    await embeddingService.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith(EMBEDDING_API.list, payload);
  });

  it("delete removes indexing record by id", async () => {
    await embeddingService.delete(12);

    expect(apiClient.remove).toHaveBeenCalledWith("/indexing/12");
  });
});
