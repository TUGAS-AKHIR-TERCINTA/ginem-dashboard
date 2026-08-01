import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  Divider,
  Grid,
  useTheme,
} from "@mui/material";
import { ROUTES } from "@/routes/routes";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import { IconMenus } from "@/assets/icons";
import { convertTime } from "@/utils/convertTime";
import { useMyProfileQuery } from "@/hooks/services";

/* ============================================================
   COMPONENT
============================================================ */
const ProfileView = () => {
  const theme = useTheme();

  const { data: myProfile } = useMyProfileQuery();

  return (
    <Box>
      {/* ================= BREADCRUMB ================= */}
      <BreadCrumberStyle
        navigation={[
          {
            label: "Profile",
            link: ROUTES.profile,
            icon: <IconMenus.profile fontSize="small" />,
          },
        ]}
      />

      {/* ================= PROFILE HEADER ================= */}
      <Card
        sx={{
          mt: 3,
          p: 4,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(13,17,23,0.9))"
              : "linear-gradient(135deg, rgba(79,70,229,0.1), #FFFFFF)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 110,
              height: 110,
              bgcolor: "primary.main",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            {myProfile?.userName.charAt(0)}
          </Avatar>

          <Box flex={1}>
            <Typography variant="h4" fontWeight={800}>
              {myProfile?.userName ?? "_"}
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" mt={1}>
              <Typography color="text.secondary" fontSize={14}>
                {myProfile?.userEmail ?? "_"}
              </Typography>
            </Stack>

            <Typography color="text.secondary" fontSize={14} mt={1.5}>
              Bergabung sejak {convertTime(myProfile?.createdAt + "") ?? "_"}
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* ================= DETAIL INFO ================= */}
      <Card sx={{ mt: 3, p: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Informasi Akun
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoItem label="Username" value={myProfile?.userName ?? "_"} />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem label="Email" value={myProfile?.userEmail ?? "_"} />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              label="Last Login"
              value={convertTime(myProfile?.updatedAt ?? "_")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              label="Account Created"
              value={convertTime(myProfile?.createdAt + "") ?? "_"}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

/* ============================================================
   REUSABLE INFO ITEM
============================================================ */
const InfoItem = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => {
  return (
    <Box>
      <Typography color="text.secondary" fontSize={13} mb={0.5}>
        {label}
      </Typography>
      <Typography
        fontSize={16}
        fontWeight={highlight ? 700 : 500}
        color={highlight ? "primary.main" : "text.primary"}
        textTransform={highlight ? "capitalize" : "none"}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default ProfileView;
