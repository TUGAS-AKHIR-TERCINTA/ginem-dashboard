import { createTheme, alpha } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

/** Brand accents inspired by the dashboard reference (light fintech shell). */
export const brand = {
  indigo: "#4F46E5",
  indigoDeep: "#3730A3",
  violet: "#7C3AED",
  mint: "#5EEAD4",
  mintDeep: "#14B8A6",
  coral: "#FB7185",
  coralDeep: "#F43F5E",
  cyan: "#22D3EE",
  cyanDeep: "#06B6D4",
  orange: "#FB923C",
  sky: "#38BDF8",
  softBg: "#F3F0FF",
  softBgAlt: "#F8F7FC",
  sidebarText: "#312E81",
  sidebarMuted: "#6B7280",
} as const;

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: brand.indigo,
        light: "#818CF8",
        dark: brand.indigoDeep,
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: brand.violet,
        light: "#A78BFA",
        dark: "#5B21B6",
      },
      success: { main: brand.mintDeep },
      warning: { main: brand.orange },
      error: { main: brand.coralDeep },
      info: { main: brand.cyanDeep },
      background: {
        default: isDark ? "#0B1020" : brand.softBgAlt,
        paper: isDark ? "#141B2D" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F1F5F9" : "#1E1B4B",
        secondary: isDark ? "#94A3B8" : brand.sidebarMuted,
      },
      divider: isDark ? "rgba(148,163,184,0.16)" : "rgba(79,70,229,0.08)",
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: [
        "Plus Jakarta Sans",
        "Inter",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
      h4: { fontWeight: 800, letterSpacing: "-0.02em" },
      h5: { fontWeight: 800, letterSpacing: "-0.02em" },
      h6: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
      overline: { letterSpacing: "0.12em", fontWeight: 700 },
    },
    shadows: [
      "none",
      "0 1px 2px rgba(49,46,129,0.04)",
      "0 4px 12px rgba(49,46,129,0.06)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 12px 32px rgba(49,46,129,0.1)",
      "0 16px 40px rgba(49,46,129,0.12)",
      "0 20px 48px rgba(49,46,129,0.14)",
      "0 24px 56px rgba(49,46,129,0.16)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 8px 24px rgba(49,46,129,0.08)",
      "0 24px 56px rgba(49,46,129,0.16)",
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0B1020" : brand.softBgAlt,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          contained: {
            paddingInline: 20,
            paddingBlock: 10,
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 10,
            border: `1px solid ${
              isDark ? "rgba(148,163,184,0.12)" : "rgba(79,70,229,0.08)"
            }`,
            boxShadow: isDark
              ? "0 8px 24px rgba(0,0,0,0.35)"
              : "0 8px 24px rgba(49,46,129,0.06)",
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 10,
          },
          outlined: {
            borderColor: isDark
              ? "rgba(148,163,184,0.12)"
              : "rgba(79,70,229,0.08)",
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              backgroundColor: isDark
                ? alpha("#fff", 0.04)
                : alpha(brand.indigo, 0.03),
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 12 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 6 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { boxShadow: "none" },
        },
      },
    },
  });
}
