import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "@/hooks/services";
import type { RegisterPayload } from "@/services/authService";
import { ROUTES } from "@/routes/routes";

export default function RegisterView() {
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userName || !userEmail || !userPassword) return;
    try {
      setSubmitting(true);
      const payload: RegisterPayload = {
        userName,
        userEmail,
        userPassword,
      };

      const res = await registerMutation.mutateAsync(payload);

      if (res) {
        navigate("/");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(900px 400px at 20% -10%, rgba(79,70,229,0.25), transparent 50%), #0B1020"
            : "radial-gradient(900px 400px at 20% -10%, rgba(124,58,237,0.16), transparent 50%), radial-gradient(700px 300px at 100% 0%, rgba(56,189,248,0.12), transparent 45%), #F8F7FC",
      })}
    >
      <Container maxWidth="sm">
        <Card sx={{ width: "100%", p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} mb={3} textAlign="center">
            <Typography variant="overline" color="primary">
              Ginem AI
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register to start using the control panel.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <TextField
              label="Full name"
              value={userName}
              size="medium"
              fullWidth
              onChange={(e) => setUserName(e.target.value)}
            />
            <TextField
              label="E-mail"
              value={userEmail}
              size="medium"
              fullWidth
              type="email"
              autoComplete="email"
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <TextField
              label="Password"
              value={userPassword}
              size="medium"
              type="password"
              fullWidth
              autoComplete="new-password"
              onChange={(e) => setUserPassword(e.target.value)}
            />

            <Button
              fullWidth
              size="large"
              variant="contained"
              sx={{ mt: 1, py: 1.2 }}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Creating…" : "Create account"}
            </Button>
          </Stack>

          <Stack
            direction="row"
            justifyContent="center"
            spacing={0.5}
            sx={{ mt: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                cursor: "pointer",
                color: "primary.main",
              }}
              onClick={() => navigate(ROUTES.login)}
            >
              Login here
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
