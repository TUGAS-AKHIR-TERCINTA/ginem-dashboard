import { apiClient } from "./api";

export const CHAT_API = {
  send: "/chat",
} as const;

export interface ChatPayload {
  message: string;
}

export interface ChatResponse {
  data?: {
    reply?: string;
    message?: string;
    content?: string;
  };
}

const DEFAULT_REPLY = "Terima kasih, pesan Anda sudah diterima.";

export function parseChatReply(response: ChatResponse): string {
  const reply =
    response?.data?.reply ?? response?.data?.message ?? response?.data?.content;
  return reply ? String(reply) : DEFAULT_REPLY;
}

export const chatService = {
  sendMessage: (payload: ChatPayload) =>
    apiClient.post<ChatResponse>(CHAT_API.send, payload),
};
