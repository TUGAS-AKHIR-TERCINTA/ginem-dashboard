import {
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  Box,
  Drawer as MuiDrawer,
  List,
  Typography,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  AlertTitle,
  useMediaQuery,
  InputBase,
  Stack,
  Divider,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  DarkMode,
  LightMode,
  Search as SearchIcon,
  NotificationsNoneOutlined,
  ChatBubbleOutlineOutlined,
  Close as CloseIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAppContext } from "@/context/app.context";
import { useToken } from "@/hooks/use-token";
import { IconMenus } from "@/assets/icons";
import { ColorModeContext } from "@/context/colorMode.context";
import { ChatWidget } from "@/features/chat/components/ChatWidget";
import { ROUTES } from "@/routes/routes";
import { brand } from "@/styles/theme";
import { useMyProfileQuery } from "@/hooks/services";

const drawerWidth = 260;

type NavItem = {
  title: string;
  link: string;
  icon: ReactElement;
};

const mainNav: NavItem[] = [
  {
    title: "Dashboard",
    link: ROUTES.home,
    icon: <IconMenus.dashboard fontSize="small" />,
  },
  {
    title: "Devices",
    link: ROUTES.devices,
    icon: <IconMenus.device fontSize="small" />,
  },
  {
    title: "Scheduler",
    link: ROUTES.scheduler,
    icon: <IconMenus.schedule fontSize="small" />,
  },
  {
    title: "Embedding",
    link: ROUTES.indexing,
    icon: <IconMenus.vectorIndexes fontSize="small" />,
  },
  {
    title: "Logger",
    link: ROUTES.logger,
    icon: <IconMenus.logger fontSize="small" />,
  },
];

const manageNav: NavItem[] = [
  {
    title: "Admin",
    link: ROUTES.admins,
    icon: <IconMenus.admin fontSize="small" />,
  },
  {
    title: "Settings",
    link: ROUTES.settings,
    icon: <IconMenus.settings fontSize="small" />,
  },
  {
    title: "Profile",
    link: ROUTES.profile,
    icon: <IconMenus.profile fontSize="small" />,
  },
];

function isRouteActive(pathname: string, link: string) {
  if (link === ROUTES.home) return pathname === ROUTES.home;
  return pathname === link || pathname.startsWith(`${link}/`);
}

function NavSection({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="caption"
        sx={{
          px: 2,
          mb: 1,
          display: "block",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "text.secondary",
          opacity: 0.85,
        }}
      >
        {label}
      </Typography>
      <List disablePadding sx={{ px: 1.25 }}>
        {items.map((item) => {
          const active = isRouteActive(pathname, item.link);
          return (
            <ListItemButton
              key={item.link}
              component={Link}
              to={item.link}
              onClick={onNavigate}
              sx={(theme) => ({
                mb: 0.5,
                borderRadius: 2.5,
                py: 1.1,
                px: 1.5,
                color: active ? "primary.main" : "text.secondary",
                backgroundColor: active
                  ? alpha(theme.palette.primary.main, 0.12)
                  : "transparent",
                "&:hover": {
                  backgroundColor: active
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.primary.main, 0.06),
                },
              })}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? "primary.main" : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  color: "inherit",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  showClose,
  onClose,
}: {
  pathname: string;
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${brand.indigo}, ${brand.violet})`,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              boxShadow: `0 8px 20px ${alpha(brand.indigo, 0.35)}`,
            }}
          >
            G
          </Box>
          <Box>
            <Typography fontWeight={800} lineHeight={1.1} color="text.primary">
              Ginem AI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Control panel
            </Typography>
          </Box>
        </Stack>
        {showClose ? (
          <IconButton aria-label="Close menu" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", pb: 2 }}>
        <NavSection
          label="Main menu"
          items={mainNav}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <NavSection
          label="Manage"
          items={manageNav}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </Box>
    </Box>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const { toggleColorMode } = useContext(ColorModeContext);
  const { appAlert, setAppAlert, isLoading } = useAppContext();
  const { removeToken } = useToken();
  const { data: profile } = useMyProfileQuery();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState("");

  const displayName = useMemo(() => {
    const name = profile?.userName?.trim();
    if (!name) return "there";
    return name.split(" ")[0] ?? name;
  }, [profile?.userName]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = [...mainNav, ...manageNav].find((item) =>
      item.title.toLowerCase().includes(q),
    );
    if (match) {
      navigate(match.link);
      setSearch("");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage:
          theme.palette.mode === "light"
            ? `radial-gradient(900px 320px at 70% -10%, ${alpha(brand.violet, 0.18)}, transparent 55%),
               radial-gradient(700px 280px at 100% 0%, ${alpha(brand.sky, 0.12)}, transparent 50%)`
            : `radial-gradient(900px 320px at 70% -10%, ${alpha(brand.indigo, 0.2)}, transparent 55%)`,
      }}
    >
      {/* Desktop sidebar */}
      {!isMobile ? (
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            borderRight: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <SidebarContent pathname={pathname} />
        </Box>
      ) : (
        <MuiDrawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: { width: drawerWidth, borderRadius: 0 },
          }}
        >
          <SidebarContent
            pathname={pathname}
            showClose
            onClose={() => setMobileDrawerOpen(false)}
            onNavigate={() => setMobileDrawerOpen(false)}
          />
        </MuiDrawer>
      )}

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top header */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: theme.zIndex.appBar,
            px: { xs: 2, md: 3 },
            py: 1.75,
            backdropFilter: "blur(16px)",
            backgroundColor: alpha(
              theme.palette.background.default,
              theme.palette.mode === "light" ? 0.75 : 0.85,
            ),
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flex: 1, minWidth: 0 }}
            >
              {isMobile ? (
                <IconButton
                  edge="start"
                  aria-label="Open menu"
                  onClick={() => setMobileDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
              ) : null}

              <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                  maxWidth: 520,
                  px: 1.75,
                  py: 0.85,
                  borderRadius: 999,
                  bgcolor: alpha(
                    brand.indigo,
                    theme.palette.mode === "light" ? 0.08 : 0.15,
                  ),
                  border: `1px solid ${alpha(brand.indigo, 0.12)}`,
                }}
              >
                <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                <InputBase
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pages…"
                  inputProps={{ "aria-label": "Search pages" }}
                  sx={{ flex: 1, fontSize: 14 }}
                />
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Tooltip title="Chat">
                <IconButton
                  aria-label="Open chat"
                  onClick={() => navigate(ROUTES.chat)}
                  sx={{
                    bgcolor: alpha(brand.indigo, 0.06),
                    "&:hover": { bgcolor: alpha(brand.indigo, 0.12) },
                  }}
                >
                  <ChatBubbleOutlineOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton
                  aria-label="Notifications"
                  sx={{
                    bgcolor: alpha(brand.indigo, 0.06),
                    "&:hover": { bgcolor: alpha(brand.indigo, 0.12) },
                  }}
                >
                  <NotificationsNoneOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  theme.palette.mode === "dark"
                    ? "Switch to light"
                    : "Switch to dark"
                }
              >
                <IconButton
                  aria-label="Toggle color mode"
                  onClick={toggleColorMode}
                  sx={{
                    bgcolor: alpha(brand.indigo, 0.06),
                    "&:hover": { bgcolor: alpha(brand.indigo, 0.12) },
                  }}
                >
                  {theme.palette.mode === "dark" ? (
                    <LightMode fontSize="small" />
                  ) : (
                    <DarkMode fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, my: 1 }}
              />

              <Tooltip title="Account">
                <IconButton
                  onClick={(e) => setAnchorElUser(e.currentTarget)}
                  sx={{ borderRadius: 2, px: 1, gap: 1 }}
                >
                  <Box
                    sx={{
                      textAlign: "right",
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      lineHeight={1.2}
                    >
                      Hi, {displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile?.userEmail ?? "Account"}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: brand.indigo,
                      fontWeight: 700,
                      boxShadow: `0 0 0 3px ${alpha(brand.indigo, 0.2)}`,
                    }}
                  >
                    {(profile?.userName?.[0] ?? "U").toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={() => setAnchorElUser(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{ sx: { mt: 1, minWidth: 160, borderRadius: 2 } }}
              >
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null);
                    navigate(ROUTES.profile);
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null);
                    navigate(ROUTES.settings);
                  }}
                >
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    removeToken();
                    navigate(ROUTES.home);
                    window.location.reload();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 2.5, md: 3.5 },
            pb: { xs: 4, md: 5 },
          }}
        >
          {isLoading ? (
            <Backdrop open sx={{ color: "#fff", zIndex: theme.zIndex.modal }}>
              <CircularProgress color="inherit" />
            </Backdrop>
          ) : (
            <Outlet />
          )}
        </Box>

        <Snackbar
          open={appAlert?.isDisplayAlert}
          autoHideDuration={4000}
          onClose={() =>
            setAppAlert({
              isDisplayAlert: false,
              alertType: undefined,
              message: "",
            })
          }
        >
          <Alert severity={appAlert?.alertType}>
            <AlertTitle>{appAlert?.alertType}</AlertTitle>
            {appAlert?.message}
          </Alert>
        </Snackbar>
      </Box>

      <ChatWidget />
    </Box>
  );
}
