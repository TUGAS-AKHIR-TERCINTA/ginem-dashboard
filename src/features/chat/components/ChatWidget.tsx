import { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useChatMutation } from "@/hooks/services";
import { parseChatReply } from "@/services/chatService";

type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

const drawerWidth = { xs: "100%", sm: 420, md: 440 };

export function ChatWidget() {
  const chatMutation = useChatMutation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await chatMutation.mutateAsync({ message: trimmed });

      const replyText = parseChatReply(res);

      const botMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: String(replyText),
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!open) return;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, open]);

  return (
    <>
      {/* Collapsed launcher — bottom center */}
      {!open && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 5, md: 8 },
            right: "0%",
            transform: "translateX(-50%)",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Tooltip title="Buka chat">
            <Paper
              elevation={8}
              onClick={handleOpen}
              sx={(theme) => ({
                cursor: "pointer",
                px: 2,
                py: 1,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                maxWidth: "calc(100vw - 24px)",
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(15,23,42,0.96)"
                    : "linear-gradient(90deg, #ffffff, #e5f2ff)",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(148,163,184,0.4)"
                    : "1px solid rgba(59,130,246,0.35)",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: 12,
                  transform: "translateY(-1px)",
                },
              })}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: "primary.main",
                }}
              >
                <ChatBubbleOutlineIcon
                  fontSize="small"
                  sx={{ color: "primary.contrastText" }}
                />
              </Avatar>

              <Box sx={{ overflow: "hidden", flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: "text.secondary",
                  }}
                >
                  Ask Ginem
                </Typography>
              </Box>
            </Paper>
          </Tooltip>
        </Box>
      )}

      {/* Right sidebar — full chat UI */}
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        ModalProps={{
          keepMounted: false,
        }}
        PaperProps={{
          sx: {
            width: drawerWidth,
            maxWidth: "100vw",
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid",
            borderColor: "divider",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(15,23,42,0.98)"
                : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          },
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
              <ChatBubbleOutlineIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Chat Support
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tanyakan apa pun tentang Ginem
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={handleClose}
            size="small"
            aria-label="Tutup chat"
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 2,
            backgroundColor: "background.default",
            minHeight: 0,
          }}
        >
          {messages.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 4 }}
            >
              Mulai percakapan dengan mengirim pesan pertama Anda.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <Stack
                    key={msg.id}
                    direction="row"
                    justifyContent={isUser ? "flex-end" : "flex-start"}
                  >
                    <Box
                      sx={{
                        maxWidth: "85%",
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: isUser
                          ? "primary.main"
                          : "rgba(148, 163, 184, 0.18)",
                        color: isUser ? "primary.contrastText" : "text.primary",
                        fontSize: 13,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.text}
                    </Box>
                  </Stack>
                );
              })}
              <div ref={messagesEndRef} />
            </Stack>
          )}
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="Ketik pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={sending || !input.trim()}
            >
              {sending ? (
                <CircularProgress size={20} />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
