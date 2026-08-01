import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import type { ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";

interface IBreadCrumberItemType {
  label: string;
  link?: string;
  icon?: ReactElement;
}

interface IBreadCrumberType {
  navigation: IBreadCrumberItemType[];
}

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? "rgba(79,70,229,0.06)"
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: 32,
    borderRadius: 8,
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: 13,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
    "& .MuiChip-icon": {
      color: theme.palette.primary.main,
      marginLeft: 8,
    },
  };
}) as typeof Chip;

const BreadCrumberStyle = ({ navigation }: IBreadCrumberType) => {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2.5 }}>
      {navigation.map((item) =>
        item.link ? (
          <StyledBreadcrumb
            key={item.label}
            component={RouterLink}
            to={item.link}
            label={item.label}
            icon={item.icon}
            clickable
          />
        ) : (
          <StyledBreadcrumb
            key={item.label}
            component="span"
            label={item.label}
            icon={item.icon}
          />
        ),
      )}
    </Breadcrumbs>
  );
};

export default BreadCrumberStyle;
