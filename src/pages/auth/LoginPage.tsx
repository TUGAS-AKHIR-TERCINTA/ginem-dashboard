import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Container,
  TextField,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/hooks/services";
import { useToken } from "@/hooks/use-token";

export default function LoginView() {
  const loginMutation = useLoginMutation();
  const { setToken } = useToken();
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const payload = {
        userEmail,
        userPassword,
      };

      const result = await loginMutation.mutateAsync(payload);

      if (result) {
        setToken(result.data.accessToken);

        navigate("/");

        window.location.reload();
      }
    } catch (error) {
      console.log(error);
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
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your control panel.
            </Typography>
          </Stack>

          <Stack spacing={2}>
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
              autoComplete="current-password"
              onChange={(e) => setUserPassword(e.target.value)}
            />

            <Button
              fullWidth
              size="large"
              variant="contained"
              sx={{ mt: 1, py: 1.2 }}
              onClick={handleSubmit}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in…" : "Login"}
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
