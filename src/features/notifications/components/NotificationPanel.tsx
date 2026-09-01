import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

const drawerWidth = { xs: "100%", sm: 420, md: 440 };

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Notifikasi
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pembaruan dan aktivitas terbaru
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" aria-label="Tutup notifikasi">
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <NotificationsNoneOutlinedIcon
            sx={{ fontSize: 28, color: "primary.main" }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Belum ada notifikasi.
        </Typography>
      </Box>

      <Divider />
    </Drawer>
  );
}
