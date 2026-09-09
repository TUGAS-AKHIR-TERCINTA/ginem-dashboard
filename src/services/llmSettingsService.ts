import { apiClient } from "./api";
import type { LLMModel, LLMModelsResponse } from "@/types/LLMModel";

export const LLM_SETTINGS_API = {
  list: "/settings",
  selected: "/settings/selected",
  detail: "/settings",
  select: "/settings/select",
} as const;

export const llmSettingsService = {
  getModels: async (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const response = await apiClient.get<LLMModelsResponse>(
      `${LLM_SETTINGS_API.list}${query}`,
    );
    return response;
  },

  getSelectedModel: async () => {
    const response = await apiClient.get<LLMModel>(LLM_SETTINGS_API.selected);
    return response;
  },

  getModelDetail: async (modelId: string) => {
    const response = await apiClient.get<LLMModel>(
      `${LLM_SETTINGS_API.detail}/${modelId}`,
    );
    return response;
  },

  selectModel: async (modelId: string) => {
    const response = await apiClient.post(`${LLM_SETTINGS_API.select}`, {
      modelId,
    });
    return response;
  },
};
