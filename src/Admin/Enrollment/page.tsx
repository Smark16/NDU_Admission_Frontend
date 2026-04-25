/**
 * Admin: Student Programme Enrollment Management
 *
 * Allows admins to:
 * - View all academic enrollment records with status filters
 * - Create/activate enrollment for a student after commitment fee confirmation
 * - Update enrollment status (enrolled, suspended, withdrawn, etc.)
 */

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material"
import {
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  AccountTree as CurriculumIcon,
  ReceiptLong as ChargesIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Enrollment {
  id: number
  student: number
  student_id: string
  student_name: string
  program: number
  program_name: string
  program_short: string
  program_batch: number
  batch_name: string
  calendar_type: string
  current_year_of_study: number
  current_term_number: number
  status: "pending" | "enrolled" | "suspended" | "completed" | "withdrawn"
  enrolled_at: string | null
  enrolled_by: number | null
  enrolled_by_name: string | null
  notes: string
  created_at: string
  updated_at: string
}

interface Program {
  id: number
  name: string
  short_form: string
  max_years: number
  calendar_type: "semester" | "trimester"
}

interface ProgramBatch {
  id: number
  name: string
  academic_year?: string
}

interface AdmittedStudent {
  id: number
  student_id: string
  full_name: string
  admitted_program_id: number | null
  admitted_program_name: string | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Commitment Fee",
  enrolled: "Enrolled",
  suspended: "Suspended",
  completed: "Completed",
  withdrawn: "Withdrawn",
}

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  pending: "warning",
  enrolled: "success",
  suspended: "error",
  completed: "info",
  withdrawn: "default",
}

// ---------------------------------------------------------------------------
// Sub-component: Create/Edit Enrollment Dialog
// ---------------------------------------------------------------------------

interface EnrollDialogProps {
  open: boolean
  editingEnrollment: Enrollment | null
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

const EnrollDialog: React.FC<EnrollDialogProps> = ({
  open,
  editingEnrollment,
  onClose,
  onSaved,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [saving, setSaving] = useState(false)

  // Search state (for creating new enrollment)
  const [studentSearch, setStudentSearch] = useState("")
  const [searchResults, setSearchResults] = useState<AdmittedStudent[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<AdmittedStudent | null>(null)

  // Programs & batches
  const [programs, setPrograms] = useState<Program[]>([])
  const [batches, setBatches] = useState<ProgramBatch[]>([])
  const [loadingBatches, setLoadingBatches] = useState(false)

  // Form fields
  const [programId, setProgramId] = useState<number | "">("")
  const [batchId, setBatchId] = useState<number | "">("")
  const [yearOfStudy, setYearOfStudy] = useState(1)
  const [termNumber, setTermNumber] = useState(1)
  const [enrollStatus, setEnrollStatus] = useState<string>("enrolled")
  const [notes, setNotes] = useState("")

  const isEditing = !!editingEnrollment

  // Derived
  const selectedProgram = programs.find((p) => p.id === programId)
  const maxYears = selectedProgram?.max_years ?? 6
  const maxTerms = selectedProgram?.calendar_type === "trimester" ? 3 : 2

  // Load programs on open
  useEffect(() => {
    if (!open) return
    AxiosInstance.get<Program[]>("/api/program/list_programs_with_batches")
      .then((r) => setPrograms(r.data))
      .catch(() => {})

    if (editingEnrollment) {
      setProgramId(editingEnrollment.program)
      setBatchId(editingEnrollment.program_batch)
      setYearOfStudy(editingEnrollment.current_year_of_study)
      setTermNumber(editingEnrollment.current_term_number)
      setEnrollStatus(editingEnrollment.status)
      setNotes(editingEnrollment.notes || "")
    } else {
      resetForm()
    }
  }, [open, editingEnrollment])

  // Load batches when program changes
  useEffect(() => {
    if (!programId) { setBatches([]); return }
    setLoadingBatches(true)
    AxiosInstance.get<{ batches: ProgramBatch[] }>(`/api/program/program/${programId}/batches`)
      .then((r) => setBatches(r.data.batches ?? r.data))
      .catch(() => setBatches([]))
      .finally(() => setLoadingBatches(false))
  }, [programId])

  const resetForm = () => {
    setStudentSearch("")
    setSearchResults([])
    setSelectedStudent(null)
    setProgramId("")
    setBatchId("")
    setYearOfStudy(1)
    setTermNumber(1)
    setEnrollStatus("enrolled")
    setNotes("")
  }

  const handleStudentSearch = async () => {
    if (!studentSearch.trim()) return
    setSearching(true)
    try {
      const { data } = await AxiosInstance.get("/api/admissions/admitted_students", {
        params: { search: studentSearch, is_admitted: true, page_size: 10 },
      })
      const results: AdmittedStudent[] = (data.results ?? data).map((s: any) => ({
        id: s.id,
        student_id: s.student_id,
        full_name: s.full_name ?? `${s.application?.first_name ?? ""} ${s.application?.last_name ?? ""}`.trim(),
        admitted_program_id: s.admitted_program ?? null,
        admitted_program_name: s.admitted_program_name ?? null,
      }))
      setSearchResults(results)
    } catch {
      onError("Failed to search students")
    } finally {
      setSearching(false)
    }
  }

  const handleSelectStudent = (student: AdmittedStudent) => {
    setSelectedStudent(student)
    setSearchResults([])
    if (student.admitted_program_id) {
      setProgramId(student.admitted_program_id)
    }
  }

  const handleSave = async () => {
    if (!isEditing && !selectedStudent) { onError("Select a student first"); return }
    if (!programId) { onError("Select a programme"); return }
    if (!batchId) { onError("Select a batch"); return }

    setSaving(true)
    try {
      if (isEditing) {
        // PATCH status / position
        await AxiosInstance.patch(`/api/program/admin/enrollment/${editingEnrollment!.id}`, {
          status: enrollStatus,
          current_year_of_study: yearOfStudy,
          current_term_number: termNumber,
          program_batch: batchId,
          notes,
        })
      } else {
        // POST create
        await AxiosInstance.post(`/api/program/admin/student/${selectedStudent!.id}/enroll`, {
          program: programId,
          program_batch: batchId,
          current_year_of_study: yearOfStudy,
          current_term_number: termNumber,
          status: enrollStatus,
          notes,
        })
      }
      onSaved()
      onClose()
      resetForm()
    } catch (e: any) {
      onError(e.response?.data?.detail || "Failed to save enrollment")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Update Enrollment" : "Enroll Student"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Student search (only for new enrollment) */}
          {!isEditing && (
            <>
              {selectedStudent ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`${selectedStudent.full_name} (${selectedStudent.student_id})`}
                    color="primary"
                    onDelete={() => setSelectedStudent(null)}
                  />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      label="Search student (name or ID)"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleStudentSearch()}
                      size="small"
                      fullWidth
                    />
                    <CustomButton
                      text={searching ? "..." : "Search"}
                      onClick={handleStudentSearch}
                      disabled={searching}
                      sx={{ whiteSpace: "nowrap" }}
                    />
                  </Box>
                  {searchResults.length > 0 && (
                    <Paper variant="outlined" sx={{ maxHeight: 180, overflow: "auto" }}>
                      {searchResults.map((s) => (
                        <Box
                          key={s.id}
                          sx={{ p: 1, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                          onClick={() => handleSelectStudent(s)}
                        >
                          <Typography variant="body2" fontWeight={600}>{s.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.student_id}{s.admitted_program_name ? ` · ${s.admitted_program_name}` : ""}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}
                </>
              )}
            </>
          )}

          {isEditing && (
            <Typography variant="body2" color="text.secondary">
              Student: <strong>{editingEnrollment?.student_name}</strong> ({editingEnrollment?.student_id})
            </Typography>
          )}

          {/* Program */}
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select
              value={programId}
              label="Programme"
              onChange={(e: SelectChangeEvent<number | "">) => {
                setProgramId(Number(e.target.value) || "")
                setBatchId("")
              }}
            >
              <MenuItem value="">Select programme</MenuItem>
              {programs.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name} ({p.short_form})</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Batch */}
          <FormControl fullWidth size="small" disabled={!programId || loadingBatches}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={batchId}
              label="Batch"
              onChange={(e: SelectChangeEvent<number | "">) => setBatchId(Number(e.target.value) || "")}
            >
              <MenuItem value="">Select batch</MenuItem>
              {batches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}{b.academic_year ? ` (${b.academic_year})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Year & Term */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Year of Study"
              type="number"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
              size="small"
              fullWidth
              inputProps={{ min: 1, max: maxYears }}
              helperText={`1–${maxYears}`}
            />
            <TextField
              label="Term Number"
              type="number"
              value={termNumber}
              onChange={(e) => setTermNumber(Number(e.target.value))}
              size="small"
              fullWidth
              inputProps={{ min: 1, max: maxTerms }}
              helperText={`1–${maxTerms}`}
            />
          </Box>

          {/* Status */}
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={enrollStatus}
              label="Status"
              onChange={(e) => setEnrollStatus(e.target.value)}
            >
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <MenuItem key={val} value={val}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CustomButton text="Cancel" variant="outlined" onClick={onClose} />
        <CustomButton
          text={saving ? "Saving…" : isEditing ? "Update" : "Enroll"}
          onClick={handleSave}
          disabled={saving}
        />
      </DialogActions>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const AdminEnrollmentPage: React.FC = () => {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false, message: "", type: "success",
  })

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterStatus) params.status = filterStatus
      const { data } = await AxiosInstance.get("/api/program/admin/enrollments", { params })
      setEnrollments(data.results ?? data)
    } catch {
      showSnackbar("Failed to load enrollments", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEnrollments() }, [filterStatus])

  const showSnackbar = (message: string, type: "success" | "error") => {
    setSnackbar({ open: true, message, type })
  }

  const filtered = enrollments.filter((e) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      e.student_name.toLowerCase().includes(q) ||
      e.student_id.toLowerCase().includes(q) ||
      e.program_name.toLowerCase().includes(q)
    )
  })

  const stats = {
    total: enrollments.length,
    enrolled: enrollments.filter((e) => e.status === "enrolled").length,
    pending: enrollments.filter((e) => e.status === "pending").length,
    suspended: enrollments.filter((e) => e.status === "suspended").length,
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <SchoolIcon sx={{ fontSize: 32, color: "#3e397b" }} />
          <Typography variant="h4" fontWeight={600}>
            Student Programme Enrollment
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage academic enrollment records. Enrollment is activated after a student pays the commitment fee.
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {[
          { label: "Total", value: stats.total, color: "#667eea" },
          { label: "Enrolled", value: stats.enrolled, color: "#4caf50" },
          { label: "Pending", value: stats.pending, color: "#ff9800" },
          { label: "Suspended", value: stats.suspended, color: "#f44336" },
        ].map((s) => (
          <Card key={s.label} sx={{ minWidth: 120, background: s.color, color: "white" }}>
            <CardContent sx={{ pb: "12px !important" }}>
              <Typography variant="caption">{s.label}</Typography>
              <Typography variant="h5" fontWeight={600}>{s.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters + Action */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          placeholder="Search by name or student ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} /> }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All statuses</MenuItem>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <CustomButton
          icon={<AddIcon />}
          text="Enroll Student"
          onClick={() => { setEditingEnrollment(null); setDialogOpen(true) }}
        />
      </Paper>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Programme</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell align="center">Year / Term</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Enrolled At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No enrollment records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{e.student_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{e.student_id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{e.program_short}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{e.batch_name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">Y{e.current_year_of_study} / T{e.current_term_number}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={STATUS_LABELS[e.status] ?? e.status}
                        color={STATUS_COLORS[e.status] ?? "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <CustomButton
                          text="Edit"
                          icon={<EditIcon fontSize="small" />}
                          size="small"
                          variant="outlined"
                          onClick={() => { setEditingEnrollment(e); setDialogOpen(true) }}
                          sx={{ borderColor: "#3e397b", color: "#3e397b", fontSize: "0.75rem" }}
                        />
                        <CustomButton
                          text="Curriculum"
                          icon={<CurriculumIcon fontSize="small" />}
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/admin/student/${e.student}/curriculum`)}
                          sx={{ borderColor: "#1565c0", color: "#1565c0", fontSize: "0.75rem" }}
                        />
                        <CustomButton
                          text="Charges"
                          icon={<ChargesIcon fontSize="small" />}
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/admin/student/${e.student}/charges`)}
                          sx={{ borderColor: "#b71c1c", color: "#b71c1c", fontSize: "0.75rem" }}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit dialog */}
      <EnrollDialog
        open={dialogOpen}
        editingEnrollment={editingEnrollment}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          fetchEnrollments()
          showSnackbar(editingEnrollment ? "Enrollment updated" : "Student enrolled successfully", "success")
        }}
        onError={(msg) => showSnackbar(msg, "error")}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default AdminEnrollmentPage
