"use client"

import { useContext, useEffect, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  Stack,
  Typography,
  InputAdornment,
  FormControlLabel,
  Switch,
  Paper,
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
} from "@mui/material"
import { Edit, Delete, Add, Search, CalendarToday } from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"
import { AuthContext } from "../../../Context/AuthContext"

interface Program {
  id: number
  name: string
  short_form:string
}

interface Batch {
  id: number
  name: string
  code: string
  programs: Program[]
  academic_year:string
  application_start_date: string
  application_end_date: string
  admission_start_date: string
  admission_end_date: string
  created_by:string
  is_active: boolean
}

interface FormData {
  name: string
  code: string
  programs: number[]
  application_start_date: string
  application_end_date: string
  admission_start_date: string
  admission_end_date: string
  created_by:string 
  is_active: boolean
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  code: "",
  programs: [],
  application_start_date: "",
  application_end_date: "",
  admission_start_date: "",
  admission_end_date: "",
  created_by: "",
  is_active: true,
}

export default function BatchManagement() {
  const AxiosInstance = useAxios()
  const {loggeduser} = useContext(AuthContext) || {}
  const [batches, setBatches] = useState<Batch[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [batchToDelete, setBatchToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // === FETCH BATCHES ===
  const fetchBatches = async () => {
    setIsLoading(true)
    try {
      const response = await AxiosInstance.get("/api/admissions/batches/")
      setBatches(response.data)
    } catch (error: any) {
      showNotification("Failed to load batches", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // === FETCH PROGRAMS ===
  const fetchPrograms = async () => {
    try {
      const response = await AxiosInstance.get("/api/program/list_programs")
      setPrograms(response.data)
    } catch (error: any) {
      showNotification("Failed to load programs", "error")
    }
  }

  // === INITIAL LOAD ===
  useEffect(() => {
    fetchBatches()
    fetchPrograms()
  }, [])

  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // === FILTER BATCHES ===
  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedBatches = filteredBatches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // === DIALOG HANDLERS ===
  const handleOpenDialog = (batch?: Batch) => {
    if (batch) {
      setEditingId(batch.id)
      
      setFormData({
        name: batch.name,
        code: batch.code,
        programs: batch.programs.map((p) => p.id),
        application_start_date: batch.application_start_date,
        application_end_date: batch.application_end_date,
        admission_start_date: batch.admission_start_date,
        admission_end_date: batch.admission_end_date,
        created_by:batch.created_by,
        is_active: batch.is_active,
      })
    } else {
      setEditingId(null)
      setFormData(INITIAL_FORM_DATA)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setIsSubmitting(false)
  }

  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Validate forms
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Intake name is required";
    } 

    if (!formData.code) {
      errors.code = "Intake code is required";
    }

     if (formData.programs.length===0) {
      errors.programs = "Intake programs are required";
    }

    if (!formData.application_start_date) {
      errors.application_start_date = "Intake start date is required";
    }

    if (!formData.application_end_date) {
      errors.application_end_date = "Intake end date is required";
    }

    if (!formData.admission_start_date) {
      errors.admission_start_date = "admission startdate is required";
    }

    if (!formData.admission_end_date) {
      errors.admission_end_date = "admission enddate is required";
    }

    if (formData.application_start_date && formData.application_end_date) {
      const start = new Date(formData.application_start_date);
      const end = new Date(formData.application_end_date);
      if (start >= end) {
        errors.application_end_date = "End date must be after start date";
      }
      if (start < new Date()) {
        errors.application_start_date = "Start date cannot be in the past";
      }
    }

    if (formData.admission_start_date && formData.admission_end_date) {
      const start = new Date(formData.admission_start_date);
      const end = new Date(formData.admission_end_date);
      if (start >= end) {
        errors.admission_start_date = "End date must be after start date";
      }
      if (start < new Date()) {
        errors.admission_start_date = "Start date cannot be in the past";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  console.log('formdata', formData)
  // === SAVE (POST / PUT) ===
  const handleSave = async () => {

    if(!validateForm()){
       showNotification("Please fill all required fields and select at least one program", "error")
       return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        created_by:Number(loggeduser?.user_id),
        programs: formData.programs,
      }

      if (editingId) {
        // === UPDATE (PUT) ===
        const response = await AxiosInstance.put(`/api/admissions/edit_batch/${editingId}`, payload)
        setBatches((prev) =>
          prev.map((b) => (b.id === editingId ? response.data : b))
        )
        showNotification("Batch updated successfully", "success")
      } else {
        // === CREATE (POST) ===
        const response = await AxiosInstance.post("/api/admissions/create_batch", payload)
        setBatches((prev) => [...prev, response.data])
        showNotification("Batch created successfully", "success")
      }

      handleCloseDialog()
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || "Operation failed"
      showNotification(msg, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // === DELETE ===
  const handleConfirmDelete = async () => {
    if (!batchToDelete) return

    try {
      await AxiosInstance.delete(`/api/admissions/delete_batch/${batchToDelete}`)
      setBatches((prev) => prev.filter((b) => b.id !== batchToDelete))
      showNotification("Batch deleted successfully", "success")
    } catch (error: any) {
      if(error.response?.data.detail){
        showNotification(`${error.response?.data.detail}`, "error")
      }else{
        showNotification("Failed to delete batch", "error")
      }
    } finally {
      setDeleteDialogOpen(false)
      setBatchToDelete(null)
    }
  }

  // === UI HELPERS ===
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const getStatusChip = (batch: Batch) => {
    if (!batch.is_active) return <Chip label="Inactive" color="default" size="small" />
    return <Chip label="Active" color="success" size="small" />
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Notification */}
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 3 }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                <CalendarToday sx={{ mr: 1, verticalAlign: "middle" }} />
                Intake Management
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage admission intakes and periods
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add New Intake
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredBatches.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <CalendarToday sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Intakes Found
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Create First Intake
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Academic year</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Programs</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Application</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Admission</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBatches.map((batch, idx) => (
                <TableRow key={batch.id} hover>
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {batch.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={batch.code} size="small" />
                  </TableCell>
                   <TableCell>
                    <Chip label={batch.academic_year} size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" gap={0.5} flexWrap="wrap">
                      {batch.programs.map((p) => (
                        <Chip key={p.id} label={p.short_form} size="small" color="info" variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      <strong>Start:</strong> {formatDate(batch.application_start_date)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>End:</strong> {formatDate(batch.application_end_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      <strong>Start:</strong> {formatDate(batch.admission_start_date)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>End:</strong> {formatDate(batch.admission_end_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(batch)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(batch)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setBatchToDelete(batch.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredBatches.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </TableContainer>
      )}

      {/* === ADD / EDIT DIALOG === */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Intake" : "Create New Intake"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Intake Name"
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              label="Intake Code"
              value={formData.code}
              onChange={(e) => handleFormChange("code", e.target.value)}
              fullWidth
              required
              error={!!formErrors.code}
              helperText={formErrors.code}
            />

            {/* === SEARCHABLE PROGRAM SELECT === */}
             <FormControl fullWidth required error={!!formErrors.programs}>
            <Autocomplete
              multiple
              options={programs}
              getOptionLabel={(option) => option.name}
              value={programs.filter((p) => formData.programs.includes(p.id))}
              onChange={(_, newValue) => {
                handleFormChange("programs", newValue.map((v) => v.id))
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Programs"
                  placeholder="Search and select programs..."
                  required={formData.programs.length === 0}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              loading={programs.length === 0}
              noOptionsText="No programs found"
            />
              {formErrors.programs && <FormHelperText>{formErrors.programs}</FormHelperText>}
             </FormControl>

            <TextField
              label="Application Start"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.application_start_date}
              onChange={(e) => handleFormChange("application_start_date", e.target.value)}
              fullWidth
              error={!!formErrors.application_start_date}
              helperText={formErrors.application_start_date}
            />
            <TextField
              label="Application End"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.application_end_date}
              onChange={(e) => handleFormChange("application_end_date", e.target.value)}
              fullWidth
              error={!!formErrors.application_end_date}
              helperText={formErrors.application_end_date}
            />
            <TextField
              label="Admission Start"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.admission_start_date}
              onChange={(e) => handleFormChange("admission_start_date", e.target.value)}
              fullWidth
              error={!!formErrors.admission_start_date}
              helperText={formErrors.admission_start_date}
            />
            <TextField
              label="Admission End"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.admission_end_date}
              onChange={(e) => handleFormChange("admission_end_date", e.target.value)}
              fullWidth
              error={!!formErrors.admission_end_date}
              helperText={formErrors.admission_end_date}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleFormChange("is_active", e.target.checked)}
                />
              }
              label="Active Intake"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM === */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Intake?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}