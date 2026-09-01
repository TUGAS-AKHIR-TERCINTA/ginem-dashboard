import { CONFIGS } from "@/config/env";

export const CHAT_WS_PATH = "/chat/ws";

export interface ChatSocketPayload {
  type?: string;
  reply?: string;
  message?: string;
  content?: string;
  data?: {
    reply?: string;
    message?: string;
    content?: string;
  };
}

/** Builds the chat WebSocket URL from the REST base URL, e.g. http://host/api/v1 -> ws://host/api/v1/chat/ws?token=... */
export function buildChatSocketUrl(token: string): string {
  const httpBase = CONFIGS.baseUrl || "";
  const wsBase = httpBase.replace(/^http/i, "ws").replace(/\/+$/, "");
  return `${wsBase}${CHAT_WS_PATH}?token=${encodeURIComponent(token)}`;
}

/**
 * Extracts a chat reply from an incoming socket frame. The backend sends
 * `{ type: "chat.reply", data: { reply } }`, but a flat `{ reply }` (or
 * `message`/`content`) shape is also accepted. Returns null for frames that
 * aren't a chat reply (e.g. connection/ack/system events), so callers don't
 * render those as fake bot messages.
 */
export function parseChatSocketPayload(raw: string): string | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ChatSocketPayload;
    const reply =
      parsed?.data?.reply ??
      parsed?.data?.message ??
      parsed?.data?.content ??
      parsed?.reply ??
      parsed?.message ??
      parsed?.content;
    return reply ? String(reply) : null;
  } catch {
    return raw;
  }
}
