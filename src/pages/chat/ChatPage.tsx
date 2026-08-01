import { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { useChatMutation } from "@/hooks/services";
import { parseChatReply } from "@/services/chatService";

type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

const SUGGESTED_PROMPTS = [
  "Analisis singkat pasar kripto hari ini",
  "Jelaskan altcoin dan risikonya",
  "Cara menggunakan fitur screener Neuro AI",
  "Indikator teknikal penting untuk pemula",
];

export default function ChatView() {
  const theme = useTheme();
  const chatMutation = useChatMutation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async (value?: string) => {
    const raw = typeof value === "string" ? value : input;
    const trimmed = raw.trim();
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Minimal top bar */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${
            isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="small"
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2 }}
            aria-label="Kembali"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600}>
            Neuro AI
          </Typography>
        </Stack>
      </Box>

      {/* Scrollable content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {messages.length === 0 ? (
          /* Empty state: ChatGPT-style welcome */
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              py: 6,
              maxWidth: 720,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <SmartToyOutlinedIcon
                sx={{ fontSize: 28, color: "primary.main" }}
              />
            </Box>
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ mb: 0.5, textAlign: "center" }}
            >
              Apa yang ingin Anda tanyakan?
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Tanyakan tentang pasar kripto, token, atau fitur Neuro AI.
            </Typography>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              justifyContent="center"
              useFlexGap
            >
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Box
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"
                    }`,
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    transition: "background-color 0.2s, border-color 0.2s",
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.18)",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    {prompt}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          /* Message list: full-width rows, ChatGPT-style */
          <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", px: 2, py: 3 }}>
            <Stack spacing={0}>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      py: 2.5,
                      px: { xs: 0, sm: 2 },
                      bgcolor: isUser
                        ? "transparent"
                        : isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.02)",
                      borderBottom: `1px solid ${
                        isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
                      }`,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="flex-start"
                      justifyContent={isUser ? "flex-end" : "flex-start"}
                      sx={{
                        maxWidth: 720,
                        ml: isUser ? "auto" : 0,
                        mr: isUser ? 0 : "auto",
                      }}
                    >
                      {!isUser && (
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      )}
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          maxWidth: "100%",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mb: 0.5,
                            fontWeight: 600,
                            color: "text.secondary",
                          }}
                        >
                          {isUser ? "Anda" : "Neuro AI"}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 15,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.text}
                        </Typography>
                      </Box>
                      {isUser && (
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="caption" fontWeight={700}>
                            U
                          </Typography>
                        </Avatar>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
            {sending && (
              <Box
                sx={{
                  py: 2.5,
                  px: { xs: 0, sm: 2 },
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                  borderBottom: `1px solid ${
                    isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
                  }`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "primary.main",
                    }}
                  >
                    <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Neuro AI sedang mengetik...
                  </Typography>
                </Stack>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input area: ChatGPT-style bar at bottom */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 2,
          borderTop: `1px solid ${
            isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
          }`,
        }}
      >
        <Box
          sx={{
            maxWidth: 720,
            mx: "auto",
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            p: 1.5,
            borderRadius: 3,
            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"
            }`,
            bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
            },
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Tulis pesan ke Neuro AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: 15,
                "& textarea": { py: 0.5 },
              },
            }}
            sx={{ flex: 1, minWidth: 0 }}
          />
          <IconButton
            color="primary"
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
            sx={{
              bgcolor: input.trim() ? "primary.main" : "transparent",
              color: input.trim() ? "primary.contrastText" : "primary.main",
              "&:hover": {
                bgcolor: input.trim()
                  ? "primary.dark"
                  : "rgba(59,130,246,0.12)",
              },
              "&.Mui-disabled": {
                color: "text.disabled",
                bgcolor: "transparent",
              },
            }}
          >
            {sending ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 1 }}
        >
          Neuro AI bisa salah. Periksa informasi penting.
        </Typography>
      </Box>
    </Box>
  );
}
