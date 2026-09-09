import { useCallback, useEffect, useRef, useState, KeyboardEvent } from "react";
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
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useChatSocket } from "@/hooks/services";

type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

const SUGGESTED_PROMPTS = [
  { text: "Bagaimana cara mengontrol lampu di ruangan?", iconName: "trending" },
  { text: "Jelaskan cara kerja smart home automation", iconName: "analytics" },
  { text: "Apa saja device IoT yang bisa diintegrasikan?", iconName: "school" },
  { text: "Bagaimana cara setup koneksi WiFi device?", iconName: "help" },
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "trending":
      return <TrendingUpIcon />;
    case "analytics":
      return <AnalyticsIcon />;
    case "school":
      return <SchoolIcon />;
    case "help":
      return <HelpOutlineIcon />;
    default:
      return null;
  }
};

export default function ChatView() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleIncomingMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-assistant`, role: "assistant", text },
    ]);
    setSending(false);
  }, []);

  const { status, sendMessage } = useChatSocket({
    onMessage: handleIncomingMessage,
  });

  const handleSend = (value?: string) => {
    const raw = typeof value === "string" ? value : input;
    const trimmed = raw.trim();
    if (!trimmed || sending || status !== "open") return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    sendMessage(trimmed);
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

  const getStatusColor = () => {
    switch (status) {
      case "open":
        return "success";
      case "connecting":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "open":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Disconnected";
      default:
        return "Initializing...";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: isDark
          ? "linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%)"
          : "linear-gradient(135deg, rgba(226,232,240,0.4) 0%, rgba(241,245,249,0.6) 100%)",
      }}
    >
      {/* Premium top bar with gradient */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2,
          background: isDark
            ? "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 100%)"
            : "linear-gradient(90deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 100%)",
          borderBottom: `1px solid ${
            isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"
          }`,
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            size="small"
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 1.5,
              "&:hover": {
                bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              },
            }}
            aria-label="Kembali"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Stack spacing={0.3}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 16 }}>
              Ginem Chat
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <FiberManualRecordIcon
                sx={{
                  fontSize: 10,
                  color: getStatusColor() === "success" ? "success.main" : getStatusColor() === "warning" ? "warning.main" : "text.disabled",
                }}
              />
              <Typography variant="caption" sx={{ fontSize: 12, color: "text.secondary" }}>
                {getStatusLabel()}
              </Typography>
            </Stack>
          </Stack>
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
          /* Empty state: Premium welcome screen */
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              py: 6,
              maxWidth: 780,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: isDark
                  ? "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.1) 100%)"
                  : "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 100%)",
                border: `2px solid ${isDark ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                boxShadow: isDark
                  ? "0 8px 32px rgba(59,130,246,0.15)"
                  : "0 8px 32px rgba(59,130,246,0.1)",
              }}
            >
              <SmartToyOutlinedIcon
                sx={{ fontSize: 40, color: "primary.main" }}
              />
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ mb: 1, textAlign: "center", fontSize: { xs: 24, sm: 32 } }}
            >
              Halo! 👋
            </Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 1, textAlign: "center", fontSize: 18 }}
            >
              Apa yang ingin Anda tanyakan?
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4, textAlign: "center", maxWidth: 500, fontSize: 15 }}
            >
              Saya siap membantu Anda mengontrol dan mengelola perangkat IoT dengan mudah melalui perintah natural language.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              flexWrap="wrap"
              gap={2}
              justifyContent="center"
              useFlexGap
              sx={{ width: "100%", maxWidth: 700 }}
            >
              {SUGGESTED_PROMPTS.map((item) => (
                <Box
                  key={item.text}
                  onClick={() => handleSend(item.text)}
                  sx={{
                    flex: { xs: "1 1 auto", sm: "1 1 calc(50% - 8px)" },
                    px: 2.5,
                    py: 2,
                    borderRadius: 2.5,
                    border: `1.5px solid ${
                      isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"
                    }`,
                    bgcolor: isDark
                      ? "rgba(59,130,246,0.05)"
                      : "rgba(59,130,246,0.03)",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(59,130,246,0.08)",
                      borderColor: isDark
                        ? "rgba(59,130,246,0.35)"
                        : "rgba(59,130,246,0.3)",
                      transform: "translateY(-2px)",
                      boxShadow: isDark
                        ? "0 12px 24px rgba(59,130,246,0.15)"
                        : "0 12px 24px rgba(59,130,246,0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 32,
                      color: "primary.main",
                      mt: 0.25,
                    }}
                  >
                    {getIconComponent(item.iconName)}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.primary",
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          /* Message list: Premium-styled conversation */
          <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", px: 2, py: 4 }}>
            <Stack spacing={0.5}>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      py: 2,
                      px: { xs: 0, sm: 0 },
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      animation: "fadeIn 0.3s ease-in",
                      "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(8px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    <Stack
                      direction={isUser ? "row-reverse" : "row"}
                      spacing={1.5}
                      alignItems="flex-end"
                      sx={{
                        maxWidth: 600,
                        width: "100%",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: isUser ? "primary.main" : "secondary.main",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                      >
                        {isUser ? (
                          <Typography variant="caption" fontWeight={700}>
                            U
                          </Typography>
                        ) : (
                          <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                      </Avatar>
                      <Box
                        sx={{
                          px: 2.5,
                          py: 1.75,
                          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          bgcolor: isUser
                            ? "primary.main"
                            : isDark
                              ? "rgba(59,130,246,0.1)"
                              : "rgba(59,130,246,0.08)",
                          border: !isUser
                            ? `1.5px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"}`
                            : "none",
                          boxShadow: isUser
                            ? "0 4px 12px rgba(59,130,246,0.3)"
                            : "none",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: isUser ? "primary.contrastText" : "text.primary",
                            fontWeight: 400,
                          }}
                        >
                          {msg.text}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
            {sending && (
              <Box
                sx={{
                  py: 2,
                  display: "flex",
                  justifyContent: "flex-start",
                  animation: "fadeIn 0.3s ease-in",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-end"
                  sx={{ maxWidth: 600 }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "secondary.main",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      borderRadius: "18px 18px 18px 4px",
                      bgcolor: isDark
                        ? "rgba(59,130,246,0.1)"
                        : "rgba(59,130,246,0.08)",
                      border: `1.5px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                    }}
                  >
                    <CircularProgress size={18} thickness={4} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Mengetik...
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Premium Input area */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 2.5,
          borderTop: `1px solid ${
            isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.08)"
          }`,
          background: isDark
            ? "linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.8) 100%)"
            : "linear-gradient(180deg, rgba(226,232,240,0.2) 0%, rgba(241,245,249,0.4) 100%)",
        }}
      >
        <Box
          sx={{
            maxWidth: 750,
            mx: "auto",
            display: "flex",
            alignItems: "flex-end",
            gap: 1.25,
            p: 1.75,
            borderRadius: 2.5,
            border: `1.5px solid ${
              isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"
            }`,
            bgcolor: isDark
              ? "rgba(59,130,246,0.05)"
              : "rgba(59,130,246,0.03)",
            background: isDark
              ? `linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 100%), rgba(59,130,246,0.05)`
              : `linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.02) 100%), rgba(59,130,246,0.03)`,
            backdropFilter: "blur(8px)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: isDark
                ? `0 0 0 2px rgba(59,130,246,0.3), inset 0 2px 8px rgba(59,130,246,0.1)`
                : `0 0 0 2px rgba(59,130,246,0.2), inset 0 2px 8px rgba(59,130,246,0.05)`,
            },
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={
              status === "connecting"
                ? "Menghubungkan ke server..."
                : status !== "open"
                  ? "Tunggu koneksi..."
                  : "Tulis pertanyaan Anda di sini..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || status !== "open"}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: 15,
                fontWeight: 500,
                "& textarea": { py: 0.75, fontWeight: 500 },
                "& ::placeholder": {
                  opacity: 0.6,
                },
              },
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              opacity: status === "open" ? 1 : 0.6,
            }}
          />
          <IconButton
            color="primary"
            onClick={() => handleSend()}
            disabled={sending || status !== "open" || !input.trim()}
            sx={{
              bgcolor: input.trim() && status === "open" ? "primary.main" : "transparent",
              color: input.trim() && status === "open" ? "primary.contrastText" : "primary.main",
              width: 40,
              height: 40,
              flexShrink: 0,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform:
                input.trim() && status === "open"
                  ? "scale(1)"
                  : "scale(0.95)",
              "&:hover:not(:disabled)": {
                bgcolor: "primary.dark",
                transform: "scale(1.05)",
                boxShadow: "0 8px 16px rgba(59,130,246,0.4)",
              },
              "&:disabled": {
                color: "text.disabled",
                bgcolor: "transparent",
              },
            }}
          >
            {sending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1.25,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          🤖 Ginem adalah AI agent yang dapat mengontrol device IoT. Pastikan semua perintah telah Anda verifikasi sebelum dijalankan.
        </Typography>
      </Box>
    </Box>
  );
}
