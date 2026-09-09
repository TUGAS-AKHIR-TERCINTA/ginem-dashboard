import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "@/services/api";
import { llmSettingsService, LLM_SETTINGS_API } from "./llmSettingsService";

describe("llmSettingsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getModels retrieves list of LLM models", async () => {
    const mockData = {
      totalItems: 6,
      items: [
        { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
        { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
      ],
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockData);

    const result = await llmSettingsService.getModels();

    expect(apiClient.get).toHaveBeenCalledWith(LLM_SETTINGS_API.list);
    expect(result).toEqual(mockData);
  });

  it("getModels with search query", async () => {
    const mockData = {
      totalItems: 1,
      items: [{ id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" }],
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockData);

    await llmSettingsService.getModels("gpt-4o");

    expect(apiClient.get).toHaveBeenCalledWith(
      `${LLM_SETTINGS_API.list}?search=gpt-4o`,
    );
  });

  it("getSelectedModel retrieves the currently selected model", async () => {
    const mockData = { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" };

    vi.mocked(apiClient.get).mockResolvedValue(mockData);

    const result = await llmSettingsService.getSelectedModel();

    expect(apiClient.get).toHaveBeenCalledWith(LLM_SETTINGS_API.selected);
    expect(result).toEqual(mockData);
  });

  it("selectModel posts a model selection", async () => {
    const mockData = { message: "Model selected successfully" };

    vi.mocked(apiClient.post).mockResolvedValue(mockData);

    const result = await llmSettingsService.selectModel("gpt-4o");

    expect(apiClient.post).toHaveBeenCalledWith(LLM_SETTINGS_API.select, {
      modelId: "gpt-4o",
    });
    expect(result).toEqual(mockData);
  });
});
