import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

export type DeleteModalSchedulerProps = {
  open: boolean;
  loading: boolean;
  jobId?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteModalScheduler({
  open,
  loading,
  jobId,
  onClose,
  onConfirm,
}: DeleteModalSchedulerProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: (t) => t.shadows[24],
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 0,
          pt: 2.5,
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "error.light",
            color: "error.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DeleteOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" component="span">
            Delete scheduler log?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25 }}
          >
            This action cannot be undone.
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          You are about to remove scheduler log
          <Typography
            component="span"
            variant="body2"
            fontWeight={700}
            color="text.primary"
            sx={{ mx: 0.5 }}
          >
            {jobId ?? "this item"}
          </Typography>
          from your scheduler logs.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={
            loading ? null : <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
          }
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
