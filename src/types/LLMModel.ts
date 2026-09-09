export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  isSelected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LLMModelsResponse {
  totalItems: number;
  items: LLMModel[];
}
