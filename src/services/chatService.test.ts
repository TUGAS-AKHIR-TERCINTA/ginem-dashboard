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
import { CHAT_API, chatService, parseChatReply } from "./chatService";

describe("parseChatReply", () => {
  it("returns reply field when present", () => {
    expect(parseChatReply({ data: { reply: "Hello" } })).toBe("Hello");
  });

  it("falls back to message field", () => {
    expect(parseChatReply({ data: { message: "Hi there" } })).toBe("Hi there");
  });

  it("falls back to content field", () => {
    expect(parseChatReply({ data: { content: "Response" } })).toBe("Response");
  });

  it("returns default reply when response is empty", () => {
    expect(parseChatReply({})).toBe("Terima kasih, pesan Anda sudah diterima.");
  });
});

describe("chatService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sendMessage posts chat payload", async () => {
    const payload = { message: "Hello AI" };
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { reply: "Hello human" },
    });

    const result = await chatService.sendMessage(payload);

    expect(apiClient.post).toHaveBeenCalledWith(CHAT_API.send, payload);
    expect(result).toEqual({ data: { reply: "Hello human" } });
  });
});
