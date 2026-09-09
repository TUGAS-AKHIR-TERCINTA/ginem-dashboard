import { useApiGet } from "@/hooks/api/useApiGet";
import { useServicePostMutation } from "@/hooks/api/useApiMutations";
import { llmSettingsService, LLM_SETTINGS_API } from "@/services/llmSettingsService";
import type { LLMModel, LLMModelsResponse } from "@/types/LLMModel";

export function useLLMModelsQuery(search?: string) {
  return useApiGet<LLMModelsResponse>(
    `${LLM_SETTINGS_API.list}${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );
}

export function useSelectedLLMQuery() {
  // This endpoint might not be implemented in backend, so we retry less aggressively
  // and let the component handle the error gracefully
  return useApiGet<LLMModel>(LLM_SETTINGS_API.selected);
}

export function useSelectLLMMutation() {
  return useServicePostMutation<any, { modelId: string }>(
    (payload) => llmSettingsService.selectModel(payload.modelId),
    {
      invalidateGetPaths: [LLM_SETTINGS_API.selected],
    },
  );
}

export const useLLMSettingsService = () => llmSettingsService;
