import { lazy, Suspense } from "react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import ErrorPage from "@/pages/NotFound/ErrorPage";
import { useToken } from "@/hooks/use-token";
import { ROUTES } from "@/routes/routes";

const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ListDevicesPage = lazy(() => import("@/pages/devices/ListDeviceView"));
const DeviceDetailPage = lazy(() => import("@/pages/devices/DetailDeviceView"));
const ListSchedulerPage = lazy(
  () => import("@/pages/scheduler/ListSchedulerView"),
);
const ListLoggerPage = lazy(() => import("@/pages/logger/ListLoggerView"));
const ListEmbeddingPage = lazy(
  () => import("@/pages/embedding/ListEmbeddingView"),
);
const ListAdminsPage = lazy(() => import("@/pages/admins/ListAdminsView"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsView"));
const ChatPage = lazy(() => import("@/pages/chat/ChatPage"));

function PageLoader() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={240}
    >
      <CircularProgress size={32} />
    </Box>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export default function AppRoutes() {
  const { getToken } = useToken();
  const isAuth = Boolean(getToken());

  const authChildren = [
    { path: ROUTES.home, element: withSuspense(<LoginPage />) },
    { path: ROUTES.login, element: withSuspense(<LoginPage />) },
    { path: ROUTES.register, element: withSuspense(<RegisterPage />) },
  ];

  const appChildren = [
    { path: ROUTES.home, element: withSuspense(<DashboardPage />) },
    { path: ROUTES.devices, element: withSuspense(<ListDevicesPage />) },
    {
      path: `${ROUTES.devices}/:deviceId`,
      element: withSuspense(<DeviceDetailPage />),
    },
    { path: ROUTES.scheduler, element: withSuspense(<ListSchedulerPage />) },
    {
      path: "/scheduller",
      element: <Navigate to={ROUTES.scheduler} replace />,
    },
    { path: ROUTES.logger, element: withSuspense(<ListLoggerPage />) },
    { path: ROUTES.indexing, element: withSuspense(<ListEmbeddingPage />) },
    { path: ROUTES.admins, element: withSuspense(<ListAdminsPage />) },
    { path: ROUTES.profile, element: withSuspense(<ProfilePage />) },
    {
      path: `${ROUTES.profile}/edit/:userId`,
      element: withSuspense(<ProfilePage />),
    },
    { path: ROUTES.settings, element: withSuspense(<SettingsPage />) },
  ];

  const router = createBrowserRouter([
    {
      path: ROUTES.home,
      element: isAuth ? <AppLayout /> : <AuthLayout />,
      errorElement: <ErrorPage />,
      children: isAuth ? appChildren : authChildren,
    },
    {
      path: ROUTES.chat,
      element: withSuspense(<ChatPage />),
    },
  ]);

  return <RouterProvider router={router} />;
}
