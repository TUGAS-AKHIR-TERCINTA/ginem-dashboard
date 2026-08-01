import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import {
  useCreateDeviceMutation,
  useDeleteDeviceMutation,
  useDeviceListQuery,
  useUpdateDeviceMutation,
} from "@/hooks/services";
import {
  Alert,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import BreadCrumberStyle from "@/components/common/Breadcrumb";
import { IconMenus } from "@/assets/icons";
import DeviceCard, {
  DeviceCardItem,
} from "@/features/devices/components/DeviceCard";
import { convertTime } from "@/utils/convertTime";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import { IDevice } from "@/types/Device";
import FormDevice, {
  DeviceCreateFormState,
  DeviceEditFormState,
} from "@/features/devices/components/FormDevice";
import DeleteModalDevice from "@/features/devices/components/DeleteModalDevice";

function NoRowsOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100%", py: 6, px: 2 }}
      spacing={0.5}
    >
      <Typography fontWeight={700}>{title}</Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}

const initialFormState: DeviceCreateFormState = {
  deviceName: "",
  deviceType: "",
  deviceFirmwareVersion: "",
  deviceMetadataRoom: "",
  deviceMetadataVoltage: "",
};

const initialEditFormState: DeviceEditFormState = {
  deviceName: "",
  deviceStatus: "",
  deviceFirmwareVersion: "",
  deviceMetadataRoom: "",
  deviceMetadataVoltage: "",
};

export default function ListDeviceView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("search") || "";

  // UI pagination is 0-based; API expects page >= 1
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { data, isFetching, isError, refetch, dataUpdatedAt } =
    useDeviceListQuery({
      page: paginationModel.page + 1,
      size: paginationModel.pageSize,
      search,
      refetchInterval: 5000,
    });

  const tableData = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;
  const loading = isFetching;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const errorMessage = isError
    ? "Failed to load devices. Please try again."
    : null;

  const createDevice = useCreateDeviceMutation();
  const updateDevice = useUpdateDeviceMutation();
  const deleteDevice = useDeleteDeviceMutation();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [addForm, setAddForm] =
    useState<DeviceCreateFormState>(initialFormState);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<{
    deviceId: number;
    deviceName: string;
  } | null>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [deviceToEdit, setDeviceToEdit] = useState<IDevice | null>(null);
  const [editForm, setEditForm] =
    useState<DeviceEditFormState>(initialEditFormState);

  const handleOpenAddModal = () => {
    setAddForm(initialFormState);
    setAddFormError(null);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    if (!createDevice.isPending) {
      setOpenAddModal(false);
      setAddForm(initialFormState);
      setAddFormError(null);
    }
  };

  const handleAddDeviceSubmit = async () => {
    setAddFormError(null);
    if (!addForm.deviceName?.trim()) {
      setAddFormError("Device name is required.");
      return;
    }
    if (!addForm.deviceType?.trim()) {
      setAddFormError("Device type is required.");
      return;
    }
    try {
      const deviceMetadata: Record<string, string> = {};

      if (addForm.deviceMetadataRoom.trim()) {
        deviceMetadata.room = addForm.deviceMetadataRoom.trim();
      }
      if (addForm.deviceMetadataVoltage.trim()) {
        deviceMetadata.voltage = addForm.deviceMetadataVoltage.trim();
      }

      const body: {
        deviceName: string;
        deviceType: string;
        deviceFirmwareVersion?: string;
        deviceMetadata?: Record<string, string>;
      } = {
        deviceName: addForm.deviceName.trim(),
        deviceType: addForm.deviceType.trim(),
        deviceFirmwareVersion:
          addForm.deviceFirmwareVersion.trim() || undefined,
      };
      if (Object.keys(deviceMetadata).length > 0) {
        body.deviceMetadata = deviceMetadata;
      }
      await createDevice.mutateAsync(body);
      handleCloseAddModal();
    } catch (error: unknown) {
      console.error(error);
      setAddFormError(
        error instanceof Error ? error.message : "Failed to add device.",
      );
    }
  };

  const handleOpenDeleteModal = (deviceId: number, deviceName: string) => {
    setDeviceToDelete({ deviceId, deviceName });
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!deleteDevice.isPending) {
      setOpenDeleteModal(false);
      setDeviceToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return;
    try {
      await deleteDevice.mutateAsync(deviceToDelete.deviceId);
      handleCloseDeleteModal();
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const handleOpenEditModal = (row: IDevice) => {
    const meta =
      row?.deviceMetadata && typeof row.deviceMetadata === "object"
        ? (row.deviceMetadata as Record<string, unknown>)
        : {};
    setDeviceToEdit(row);
    setEditForm({
      deviceName: row?.deviceName ?? "",
      deviceStatus: row?.deviceStatus ?? "offline",
      deviceFirmwareVersion: row?.deviceFirmwareVersion ?? "",
      deviceMetadataRoom: typeof meta.room === "string" ? meta.room : "",
      deviceMetadataVoltage:
        typeof meta.voltage === "string" ? meta.voltage : "",
    });
    setEditFormError(null);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    if (!updateDevice.isPending) {
      setOpenEditModal(false);
      setDeviceToEdit(null);
      setEditForm(initialEditFormState);
      setEditFormError(null);
    }
  };

  const handleEditDeviceSubmit = async () => {
    if (!deviceToEdit?.deviceId) return;

    setEditFormError(null);

    if (!editForm.deviceName?.trim()) {
      setEditFormError("Device name is required.");
      return;
    }
    try {
      const deviceMetadata: Record<string, string> = {};

      if (editForm.deviceMetadataRoom.trim())
        deviceMetadata.room = editForm.deviceMetadataRoom.trim();
      if (editForm.deviceMetadataVoltage.trim())
        deviceMetadata.voltage = editForm.deviceMetadataVoltage.trim();

      const body = {
        deviceId: deviceToEdit.deviceId,
        deviceName: editForm.deviceName.trim(),
        deviceStatus: editForm.deviceStatus || "offline",
        deviceFirmwareVersion:
          editForm.deviceFirmwareVersion.trim() || undefined,
        deviceMetadata,
      };

      await updateDevice.mutateAsync(body);

      handleCloseEditModal();
    } catch (error: unknown) {
      console.error(error);
      setEditFormError(
        error instanceof Error ? error.message : "Failed to update device.",
      );
    }
  };

  function CustomToolbar() {
    const initialSearch = searchParams.get("search") || "";

    const [search, setSearch] = useState<string>(initialSearch);

    const currentSearch = searchParams.get("search") || "";

    useEffect(() => {
      setSearch(currentSearch);
    }, [currentSearch]);

    const handleSearch = () => {
      const newSearchParams = new URLSearchParams();
      if (search) {
        newSearchParams.set("search", search);
      }
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setSearchParams(newSearchParams);
    };

    const handleReset = () => {
      setSearch("");
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setSearchParams(new URLSearchParams());
    };

    return (
      <Box
        sx={{
          p: 2,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <BreadCrumberStyle
          navigation={[
            {
              label: "Devices",
              link: "/devices",
              icon: <IconMenus.device fontSize="small" />,
            },
          ]}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Devices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your devices
              {lastUpdated ? ` • Updated ${lastUpdated.toLocaleString()}` : ""}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            Add Device
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
          sx={{ width: "100%" }}
          bgcolor="background.paper"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  size="small"
                  onClick={() => refetch()}
                  disabled={loading}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              size="small"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <Tooltip title="Clear">
                      <IconButton
                        size="small"
                        onClick={() => setSearch("")}
                        edge="end"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" onClick={handleSearch}>
                Apply
              </Button>
              <Button
                variant="text"
                color="inherit"
                onClick={handleReset}
                startIcon={<RestartAltIcon fontSize="small" />}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      {errorMessage ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}

      <Box sx={{ width: "100%" }}>
        <CustomToolbar />

        {(!loading && tableData.length === 0) || rowCount === 0 ? (
          <NoRowsOverlay
            title="No devices"
            subtitle="Try adjusting your search or add a new device."
          />
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {tableData.map((row: IDevice) => (
              <Grid item key={row?.deviceId} xs={12} md={6}>
                <DeviceCard
                  device={row as DeviceCardItem}
                  convertTime={convertTime}
                  onDetail={() => navigate(`/devices/${row?.deviceId}`)}
                  onEdit={() => handleOpenEditModal(row)}
                  onDelete={() =>
                    handleOpenDeleteModal(
                      row?.deviceId,
                      row?.deviceName || "Unknown",
                    )
                  }
                />
              </Grid>
            ))}
          </Grid>
        )}

        {rowCount > 0 && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mt: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {tableData.length} of {rowCount} items
            </Typography>

            <Pagination
              color="primary"
              shape="rounded"
              page={paginationModel.page + 1}
              count={Math.max(
                1,
                Math.ceil(rowCount / paginationModel.pageSize),
              )}
              onChange={(_, page) =>
                setPaginationModel((prev) => ({ ...prev, page: page - 1 }))
              }
            />
          </Stack>
        )}
      </Box>

      <FormDevice
        open={openAddModal}
        submitLoading={createDevice.isPending}
        formError={addFormError}
        mode="create"
        form={addForm}
        setForm={setAddForm}
        onClose={handleCloseAddModal}
        onSubmit={handleAddDeviceSubmit}
      />

      <FormDevice
        open={openEditModal}
        submitLoading={updateDevice.isPending}
        formError={editFormError}
        mode="edit"
        form={editForm}
        setForm={setEditForm}
        onClose={handleCloseEditModal}
        onSubmit={handleEditDeviceSubmit}
      />

      <DeleteModalDevice
        open={openDeleteModal}
        loading={deleteDevice.isPending}
        deviceName={deviceToDelete?.deviceName ?? null}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
