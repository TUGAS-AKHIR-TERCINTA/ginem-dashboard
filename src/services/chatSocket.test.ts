import { describe, expect, it } from "vitest";
import { buildChatSocketUrl, parseChatSocketPayload } from "./chatSocket";

describe("buildChatSocketUrl", () => {
  it("converts http base url to ws and appends the chat path with token", () => {
    expect(buildChatSocketUrl("abc123")).toBe(
      "ws://localhost:8000/api/v1/chat/ws?token=abc123",
    );
  });

  it("encodes the token", () => {
    expect(buildChatSocketUrl("a b/c")).toBe(
      "ws://localhost:8000/api/v1/chat/ws?token=a%20b%2Fc",
    );
  });
});

describe("parseChatSocketPayload", () => {
  it("returns reply from the backend's chat.reply envelope", () => {
    expect(
      parseChatSocketPayload(
        JSON.stringify({
          type: "chat.reply",
          data: { reply: "Hai! Ada yang bisa saya bantu hari ini?" },
        }),
      ),
    ).toBe("Hai! Ada yang bisa saya bantu hari ini?");
  });

  it("returns reply field when present", () => {
    expect(parseChatSocketPayload(JSON.stringify({ reply: "Hello" }))).toBe(
      "Hello",
    );
  });

  it("falls back to message field", () => {
    expect(
      parseChatSocketPayload(JSON.stringify({ message: "Hi there" })),
    ).toBe("Hi there");
  });

  it("falls back to content field", () => {
    expect(
      parseChatSocketPayload(JSON.stringify({ content: "Response" })),
    ).toBe("Response");
  });

  it("returns null for a JSON payload without a reply field (e.g. system/ack events)", () => {
    expect(parseChatSocketPayload("{}")).toBeNull();
    expect(parseChatSocketPayload(JSON.stringify({ event: "connected" }))).toBeNull();
  });

  it("returns null for an empty frame", () => {
    expect(parseChatSocketPayload("")).toBeNull();
  });

  it("returns raw text when payload is not JSON", () => {
    expect(parseChatSocketPayload("plain text reply")).toBe(
      "plain text reply",
    );
  });
});
