import { useCallback, useEffect, useRef, useState } from "react";
import { useToken } from "@/hooks/use-token";
import { buildChatSocketUrl, parseChatSocketPayload } from "@/services/chatSocket";

export type ChatSocketStatus = "idle" | "connecting" | "open" | "closed" | "error";

interface UseChatSocketOptions {
  /** Whether the socket should be connected. Defaults to true. */
  enabled?: boolean;
  onMessage: (text: string) => void;
}

export function useChatSocket({ enabled = true, onMessage }: UseChatSocketOptions) {
  const { getToken } = useToken();
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  // `getToken` is a new function identity on every render (useToken isn't
  // memoized). Reading it via a ref keeps it out of the effect's deps so the
  // socket doesn't get torn down and reopened on every re-render.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const [status, setStatus] = useState<ChatSocketStatus>("idle");

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    const token = getTokenRef.current() || "";
    const socket = new WebSocket(buildChatSocketUrl(token));
    socketRef.current = socket;
    setStatus("connecting");

    socket.onopen = () => setStatus("open");
    socket.onclose = () => setStatus("closed");
    socket.onerror = () => setStatus("error");
    socket.onmessage = (event) => {
      const text = parseChatSocketPayload(event.data);
      if (text) onMessageRef.current(text);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const sendMessage = useCallback((text: string): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    socket.send(JSON.stringify({ message: text }));
    return true;
  }, []);

  return { status, sendMessage };
}
