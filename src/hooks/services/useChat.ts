import { useServicePostMutation } from "@/hooks/api/useApiMutations";
import { chatService, type ChatResponse } from "@/services/chatService";

export function useChatMutation() {
  return useServicePostMutation<ChatResponse, { message: string }>(
    chatService.sendMessage,
  );
}
