"use client";

import { useState, useMemo, useEffect, useContext } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowForward as ChooseIcon,
  ArrowBack as RemoveIcon,
  ArrowForwardIos as ChooseAllIcon,
  ArrowBackIos as RemoveAllIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People,
} from "@mui/icons-material";
import useAxios from "../../AxiosInstance/UseAxios";
import { AuthContext } from "../../Context/AuthContext";
import CustomButton from "../../ReUsables/custombutton";

interface Permission {
  id: string;
  name: string;
  codename: string
}

interface GroupItem {
  id: string;
  name: string;
  permissions: string[];
}

export default function GroupManagementDialog() {
  const AxiosInstance = useAxios()
  const { showErrorAlert = () => { }, showSuccessAlert = () => { } } = useContext(AuthContext) || {}
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [groupName, setGroupName] = useState("");
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // fetch permissions
  const fetchAllPermissions = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/accounts/list_permissions')
      setPermissions(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      setIsLoading(false)
    }
  }

  // fetch groups
  const fetchAllGroups = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/accounts/list_detailed_groups')
      setGroups(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllGroups()
    fetchAllPermissions()
  }, [])

  const leftPermissions = useMemo(() => {
    return permissions.filter(
      (p) => !selectedRight.includes(p.id) &&
        p.name.toLowerCase().includes(leftSearch.toLowerCase())
    );
  }, [leftSearch, selectedRight, permissions]);

  const rightPermissions = useMemo(() => {
    return permissions.filter(
      (p) => selectedRight.includes(p.id) &&
        p.name.toLowerCase().includes(rightSearch.toLowerCase())
    );
  }, [rightSearch, selectedRight, permissions]);

  const handleChoose = () => {
    setSelectedRight((prev) => [...prev, ...selectedLeft]);
    setSelectedLeft([]);
  };

  const handleRemove = () => {
    setSelectedLeft((prev) => [...prev, ...selectedRight]);
    setSelectedRight([]);
  };

  const handleChooseAll = () => {
    const allLeftIds = leftPermissions.map((p) => p.id);
    setSelectedRight((prev) => [...prev, ...allLeftIds]);
  };

  const handleRemoveAll = () => {
    setSelectedRight([]);
  };

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const formdata = new FormData()
      formdata.append('name', groupName)
      selectedRight.map(id => (
        formdata.append("permissions", id.toString())
      ))
      if (editingId) {
        // Update existing group
        const response = await AxiosInstance.put(`/api/accounts/edit_roles/${editingId}`, formdata)
        setIsLoading(false)
        showSuccessAlert('role editted successfully')
        setGroups((prev) =>
          prev.map((g) =>
            g.id === editingId
              ? { ...g, name: response.data.name, permissions: response.data.permissions }
              : g
          )
        );

      } else {
        const response = await AxiosInstance.post('/api/accounts/create_roles', formdata)
        setIsLoading(false)
        setGroups((prev) => [...prev, response.data]);
        showSuccessAlert('role created successfully')
      }
      resetForm();
    } catch (err: any) {
      console.log(err)
      setIsLoading(false)
      if (err.response?.data.detail) {
        showErrorAlert(`${err.response?.data.detail}`)
      }

    }

  };

  const resetForm = () => {
    setGroupName("");
    setSelectedLeft([]);
    setSelectedRight([]);
    setEditingId(null);
    setLeftSearch("");
    setRightSearch("");
  };

  const handleEdit = (group: GroupItem) => {
    setEditingId(group.id);
    setGroupName(group.name);
    setSelectedRight(group.permissions);
    setSelectedLeft([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTargetId) {
        setIsLoading(true)
        await AxiosInstance.delete(`/api/accounts/delete_roles/${deleteTargetId}`)
        setIsLoading(false)
        showSuccessAlert("role deleted successfully")
        setGroups((prev) => prev.filter((g) => g.id !== deleteTargetId));
        console.log("Deleted group:", deleteTargetId);
      }
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (err: any) {
      console.log(err)
      setIsLoading(false)
      if (err.response?.data.detail) {
        showErrorAlert(`${err.response?.data.detail}`)
      }
    }

  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Existing Roles
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#3e397b" }}>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: 600 }}>Permissions</TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : groups.length === 0 ? (
                  <Card>
                    <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
                      <People sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>No Roles Yet</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>Create your first role to get started.</Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {groups.map((group) => (
                      <TableRow key={group.id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{group.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {group.permissions.length > 0 && (
                              <Chip
                                key={group.id}
                                label={`${group.permissions.length} permissions`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            sx={{color:"#3e397b"}}
                            onClick={() => handleEdit(group)}
                            title="Edit group"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(group.id)}
                            title="Delete group"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 3 }} />
        </Box>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        {editingId ? "Edit Role" : "Add Role"}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Name:
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Permissions:
      </Typography>

      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Left Panel */}
        <Paper
          variant="outlined"
          sx={{ flex: 1, p: 2, maxHeight: 420, overflow: "auto" }}
        >
          <Typography variant="subtitle2" sx={{color:"#3e397b"}} gutterBottom>
            Available permissions
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Choose permissions by selecting them and then select the "Choose" arrow button.
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Filter"
            value={leftSearch}
            onChange={(e) => setLeftSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box
            sx={{
              maxHeight: 260,
              overflow: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
            }}
          >
            {leftPermissions.map((perm) => (
              <Chip
                key={perm.id}
                label={perm.name}
                size="small"
                clickable
                onClick={() => {
                  setSelectedLeft((prev) =>
                    prev.includes(perm.id)
                      ? prev.filter((id) => id !== perm.id)
                      : [...prev, perm.id]
                  );
                }}
                sx={{ 
                  m: 0.5, cursor: "pointer", bgcolor:`${selectedLeft.includes(perm.id) ? "#3e397b" : "default"}`, 
                color:`${selectedLeft.includes(perm.id) ? "white" : "default"}`
              }}
              />
            ))}
            {leftPermissions.length === 0 && (
              <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
                No permissions match the filter.
              </Typography>
            )}
          </Box>
          <CustomButton fullWidth variant="text" icon={<ChooseAllIcon fontSize="small" />} disabled={leftPermissions.length === 0} text="Choose all permissions" onClick={handleChooseAll}/>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Hold down "Control", or "Command" on a Mac, to select more than one.
          </Typography>
        </Paper>

        {/* Arrow Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1,
            pt: 6,
          }}
        >
          <IconButton
            onClick={handleChoose}
            disabled={selectedLeft.length === 0}
            sx={{color:"#3e397b"}}
            size="large"
          >
            <ChooseIcon />
          </IconButton>
          <IconButton
            onClick={handleRemove}
            disabled={selectedRight.length === 0}
            color="error"
            size="large"
          >
            <RemoveIcon />
          </IconButton>
        </Box>

        {/* Right Panel */}
        <Paper
          variant="outlined"
          sx={{ flex: 1, p: 2, maxHeight: 420, overflow: "auto" }}
        >
          <Typography variant="subtitle2" sx={{ color: "background.paper", bgcolor: "#3e397b", px: 1, py: 0.5, borderRadius: 1, display: "inline-block" }} gutterBottom>
            Chosen permissions
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Remove permissions by selecting them and then select the "Remove" arrow button.
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Filter"
            value={rightSearch}
            onChange={(e) => setRightSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box
            sx={{
              maxHeight: 260,
              overflow: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
            }}
          >
            {rightPermissions.map((perm) => (
              <Chip
                key={perm.id}
                label={perm.name}
                size="small"
                clickable
                variant="outlined"
                onClick={() => {
                  setSelectedRight((prev) => prev.filter((id) => id !== perm.id));
                }}
                sx={{ m: 0.5, cursor: "pointer", color:"#3e397b"}}
              />
            ))}
            {rightPermissions.length === 0 && (
              <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
                No chosen permissions.
              </Typography>
            )}
          </Box>
          
          <CustomButton fullWidth variant="text" icon={<RemoveAllIcon fontSize="small" />} onClick={handleRemoveAll} disabled={selectedRight.length === 0} text="Remove all permissions"/>
        </Paper>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={1} justifyContent="flex-start">
        <CustomButton onClick={handleSave} text= {isLoading ? (editingId ? "updating..." : "Adding...")
            : (editingId ? "UPDATE" : "SAVE")}/>
        {editingId && (
          <CustomButton variant="outlined" onClick={resetForm} text="Cancel Edit"/>
        )}
      </Stack>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this group? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={() => setDeleteDialogOpen(false)} variant="outlined" text="Cancel"/>
          <CustomButton onClick={confirmDelete} text={isLoading ? 'Deleting...' : 'Delete'}/>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
