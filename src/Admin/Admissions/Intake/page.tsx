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
  LinearProgress,
} from "@mui/material"
import { Edit, Delete, Add, Search, CalendarToday, Upload } from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"
import { AuthContext } from "../../../Context/AuthContext"
import CustomButton from "../../../ReUsables/custombutton"

interface Program {
  id: number
  name: string
  short_form: string
}

function normalizeProgramRow(p: { id: number; name?: string; short_form?: string }): Program {
  return {
    id: p.id,
    name: p.name ?? "",
    short_form: p.short_form ?? "",
  }
}

/** Merge API list with programmes already on an intake (so edit still shows legacy links). */
function mergeProgramOptions(base: Program[], extra: Program[]): Program[] {
  const m = new Map<number, Program>()
  for (const p of base) m.set(p.id, p)
  for (const p of extra) {
    if (!m.has(p.id)) m.set(p.id, normalizeProgramRow(p))
  }
  return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name))
}

interface Batch {
  id: number
  name: string
  code: string
  programs: Program[]
  academic_year: string
  application_start_date: string
  application_end_date: string
  admission_start_date: string
  admission_end_date: string
  created_by: string
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
  created_by: string
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
  const { loggeduser } = useContext(AuthContext) || {}
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Upload dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

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

  // Programmes that already have academic batches (ProgramBatch) — same rule as enrollment
  const loadProgramOptions = async (mergeExisting?: Program[]) => {
    try {
      const response = await AxiosInstance.get<{
        results?: Program[]
        count?: number
        message?: string
      }>("/api/program/list_programs_with_batches")
      const raw = response.data?.results
      const list: Program[] = Array.isArray(raw) ? raw.map(normalizeProgramRow) : []
      setPrograms(mergeExisting?.length ? mergeProgramOptions(list, mergeExisting) : list)
    } catch (error: any) {
      showNotification("Failed to load programmes (with batches)", "error")
    }
  }

  useEffect(() => {
    fetchBatches()
    void loadProgramOptions()
  }, [])

  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // === FILTER & PAGINATION ===
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
  const handleOpenDialog = async (batch?: Batch) => {
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
        created_by: batch.created_by,
        is_active: batch.is_active,
      })
      await loadProgramOptions(batch.programs)
    } else {
      setEditingId(null)
      setFormData(INITIAL_FORM_DATA)
      await loadProgramOptions()
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setIsSubmitting(false)
    setFormErrors({})
  }

  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // === VALIDATE FORM ===
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = "Intake name is required"
    if (!formData.code.trim()) errors.code = "Intake code is required"
    if (formData.programs.length === 0) errors.programs = "Select at least one program"

    // Date validations...
    if (!formData.application_start_date) errors.application_start_date = "Start date required"
    if (!formData.application_end_date) errors.application_end_date = "End date required"
    if (formData.application_start_date && formData.application_end_date) {
      const start = new Date(formData.application_start_date)
      const end = new Date(formData.application_end_date)
      if (start >= end) errors.application_end_date = "End must be after start"
    }

    if (!formData.admission_start_date) errors.admission_start_date = "Admission start required"
    if (!formData.admission_end_date) errors.admission_end_date = "Admission end required"
    if (formData.admission_start_date && formData.admission_end_date) {
      const start = new Date(formData.admission_start_date)
      const end = new Date(formData.admission_end_date)
      if (start >= end) errors.admission_end_date = "End must be after start"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // === SAVE BATCH ===
  const handleSave = async () => {
    if (!validateForm()) {
      showNotification("Please fix the errors", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const { created_by: _creatorFromForm, ...formWithoutCreator } = formData
      if (!editingId) {
        const uid = Number(loggeduser?.user_id)
        if (!Number.isFinite(uid)) {
          showNotification("You must be logged in to create an intake", "error")
          setIsSubmitting(false)
          return
        }
      }
      const payload = editingId
        ? formWithoutCreator
        : { ...formData, created_by: Number(loggeduser?.user_id) }

      if (editingId) {
        const response = await AxiosInstance.put(`/api/admissions/edit_batch/${editingId}`, payload)
        setBatches((prev) =>
          prev.map((b) => (b.id === editingId ? response.data : b))
        )
        showNotification("Batch updated", "success")
      } else {
        const response = await AxiosInstance.post("/api/admissions/create_batch", payload)
        setBatches((prev) => [...prev, response.data])
        showNotification("Batch created", "success")
      }

      handleCloseDialog()
    } catch (error: any) {
      const res = error.response
      const d = res?.data
      let msg = "Failed to save batch"
      if (!res) {
        msg = error.message || msg
      } else if (typeof d === "string") {
        msg = d.length > 240 ? `${d.slice(0, 240)}…` : d
      } else if (d && typeof d === "object") {
        if (Array.isArray(d.detail)) {
          msg = d.detail.map((x: unknown) => String(x)).join(" ")
        } else if (typeof d.detail === "string") {
          msg = d.detail
        } else {
          const first = Object.entries(d).find(([, v]) => v != null)
          if (first) {
            const [, val] = first
            if (Array.isArray(val) && val.length > 0) {
              const item = val[0]
              msg = typeof item === "string" ? item : String(item)
            } else if (val != null) {
              msg = String(val)
            }
          }
        }
      }
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
      showNotification("Batch deleted", "success")
    } catch (error: any) {
      showNotification(error.response?.data?.detail || "Delete failed", "error")
    } finally {
      setDeleteDialogOpen(false)
      setBatchToDelete(null)
    }
  }

  // === UPLOAD PROGRAMS ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewError(null)
    }
  }

  const handleUploadPreview = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setPreviewError(null)

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await AxiosInstance.post("/api/program/preview_programs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percent)
          }
        },
      })

      const { programs: previewPrograms, count } = response.data

      // Auto-fill the multi-select with returned IDs; ensure options include uploaded rows
      const previewAsPrograms: Program[] = previewPrograms.map((p: { id: number; name?: string; short_form?: string }) =>
        normalizeProgramRow(p)
      )
      setPrograms((prev) => mergeProgramOptions(prev, previewAsPrograms))
      const programIds = previewPrograms.map((p: { id: number }) => p.id)
      handleFormChange("programs", programIds)

      showNotification(`Successfully previewed ${count} programs`, "success")
      setUploadDialogOpen(false)
      setSelectedFile(null)
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.details || "Upload failed"
      setPreviewError(msg)
      showNotification(msg, "error")
    } finally {
      setUploading(false)
      setUploadProgress(0)
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
    return batch.is_active ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Inactive" color="default" size="small" />
    )
  }

  const renderProgramsChips = (programs: Program[]) => {
    const maxVisible = 5
    const visible = programs.slice(0, maxVisible)
    const remaining = programs.length - maxVisible

    return (
      <Stack direction="row" gap={0.5} flexWrap="wrap">
        {visible.map((p) => (
          <Chip key={p.id} label={p.short_form} size="small" sx={{ color: "#7c1519" }} variant="outlined" />
        ))}
        {remaining > 0 && <Chip label={`+${remaining} more...`} size="small" color="primary" variant="outlined" />}
      </Stack>
    )
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
                Manage admission intakes. Only programmes with an academic batch (Year/structure) can be attached.
              </Typography>
            </Box>
            <CustomButton
              icon={<Add />}
              onClick={() => void handleOpenDialog()}
              text="Add New Intake"
            />
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
              onClick={() => void handleOpenDialog()}
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
                  <TableCell>{renderProgramsChips(batch.programs)}</TableCell>
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
                      onClick={() => void handleOpenDialog(batch)}
                    >
                      <Edit fontSize="small" sx={{ color: "#7c1519" }} />
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

            {/* Programs Section with Upload Button */}
            <Stack direction="row" spacing={1} alignItems="flex-start">
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
                <FormHelperText>
                  Listed programmes have at least one active academic batch. Configure batches under Admin → Batch
                  management for the programme first.
                </FormHelperText>
              </FormControl>
              
              <CustomButton variant="outlined" startIcon={<Upload />} onClick={() => setUploadDialogOpen(true)} text='Upload'/>
            </Stack>

            {/* Date fields */}
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
          <CustomButton
            onClick={handleCloseDialog}
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
            text="Cancel"
            variant="outlined"
          />
          <CustomButton
            onClick={handleSave}
            disabled={isSubmitting}
            text={isSubmitting ? <CircularProgress size={20} /> : editingId ? "Update" : "Create"}
          />
        </DialogActions>
      </Dialog>

      {/* === UPLOAD PROGRAMS DIALOG === */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Programs CSV/XLSX</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Upload a file with a column named <strong>ID</strong> containing program IDs.
            </Typography>

            <Button
              variant="contained"
              component="label"
              startIcon={<Upload />}
              sx={{ alignSelf: "flex-start", bgcolor: "#7c1519" }}
            >
              Choose File
              <input
                type="file"
                hidden
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
            </Button>

            {selectedFile && (
              <Typography variant="body2">
                Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Typography>
            )}

            {uploading && (
              <Box sx={{ width: "100%", mt: 1 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

            {previewError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {previewError}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton variant="outlined" onClick={() => setUploadDialogOpen(false)} disabled={uploading} text='Cancel'/>
          <CustomButton
            onClick={handleUploadPreview}
            disabled={uploading || !selectedFile}
            text={uploading ? "Processing..." : "Preview & Add"}
          />
        </DialogActions>
      </Dialog>

      {/* === DELETE CONFIRM === */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Intake?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton
            onClick={() => setDeleteDialogOpen(false)}
            text="Cancel"
            variant="outlined"
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
          />
          <CustomButton onClick={handleConfirmDelete} text="Delete" />
        </DialogActions>
      </Dialog>
    </Box>
  )
}