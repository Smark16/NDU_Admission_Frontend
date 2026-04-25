"use client"

/**
 * Admin: Student Curriculum Override Management
 *
 * Accessed from the Enrollment list by clicking "Manage Path" on a student.
 * Shows the full programme blueprint for the student, with each line annotated
 * with its current path status (standard / exempted / transferred / deferred /
 * backlog / substituted).  Staff can add, edit, or remove overrides.
 */

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Alert, Box, Button, Chip, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  FormControl, InputLabel, MenuItem, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography, Paper,
} from "@mui/material"
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as StandardIcon,
  Block as ExemptIcon,
  SwapHoriz as TransferIcon,
  Schedule as DeferIcon,
  Warning as BacklogIcon,
  Shuffle as SubstituteIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

// ── Types ────────────────────────────────────────────────────────────────────

interface Override {
  id: number
  curriculum_line_id: number
  course_code: string
  course_title: string
  blueprint_year: number
  blueprint_term: number
  override_type: string
  override_type_display: string
  effective_year_of_study: number | null
  effective_term_number: number | null
  transferred_grade: string | null
  transferred_institution: string
  substituted_by_id: number | null
  substituted_by_code: string | null
  notes: string
  decided_by: string | null
  decided_at: string | null
}

interface CurriculumLine {
  curriculum_line_id: number
  course_code: string
  course_title: string
  credit_units: string
  course_type: string
  year_of_study: number
  term_number: number
  sort_order: number
  override: Override | null
  path_status: string
}

interface StudentCurriculum {
  student_id: string
  reg_no: string
  student_name: string
  enrollment_id: number
  program: string
  entry_year: number | null
  entry_term: number | null
  current_year: number
  current_term: number
  enrollment_status: string
  curriculum: CurriculumLine[]
  total_lines: number
  override_count: number
  standard_count: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const OVERRIDE_TYPES = [
  { value: "exempted",    label: "Exempted",           color: "#9c27b0", bg: "#f3e5f5" },
  { value: "transferred", label: "Transferred Credit", color: "#1976d2", bg: "#e3f2fd" },
  { value: "deferred",    label: "Deferred",           color: "#f57c00", bg: "#fff3e0" },
  { value: "backlog",     label: "Backlog",             color: "#d32f2f", bg: "#ffebee" },
  { value: "substituted", label: "Substituted",        color: "#388e3c", bg: "#e8f5e9" },
]

const OVERRIDE_ICONS: Record<string, React.ReactNode> = {
  standard:    <StandardIcon  sx={{ fontSize: 16, color: "#4caf50" }} />,
  exempted:    <ExemptIcon    sx={{ fontSize: 16, color: "#9c27b0" }} />,
  transferred: <TransferIcon  sx={{ fontSize: 16, color: "#1976d2" }} />,
  deferred:    <DeferIcon     sx={{ fontSize: 16, color: "#f57c00" }} />,
  backlog:     <BacklogIcon   sx={{ fontSize: 16, color: "#d32f2f" }} />,
  substituted: <SubstituteIcon sx={{ fontSize: 16, color: "#388e3c" }} />,
}

function PathChip({ status, label }: { status: string; label: string }) {
  const t = OVERRIDE_TYPES.find(t => t.value === status)
  return (
    <Chip
      icon={OVERRIDE_ICONS[status] as any}
      label={label}
      size="small"
      sx={{
        bgcolor: t?.bg || "#f5f5f5",
        color:   t?.color || "#666",
        fontWeight: 600,
        fontSize: "0.72rem",
        border: "none",
        "& .MuiChip-icon": { color: "inherit" },
      }}
    />
  )
}

// ── Empty form ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  override_type: "",
  effective_year_of_study: "" as number | "",
  effective_term_number: "" as number | "",
  transferred_grade: "",
  transferred_institution: "",
  notes: "",
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CurriculumOverridesPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const axios = useAxios()

  const [data, setData]         = useState<StudentCurriculum | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [snack, setSnack]       = useState<{ msg: string; sev: "success" | "error" } | null>(null)

  // dialog
  const [dialogOpen, setDialogOpen]   = useState(false)
  const [editingOverride, setEditing] = useState<Override | null>(null)
  const [targetLine, setTargetLine]   = useState<CurriculumLine | null>(null)
  const [form, setForm]               = useState({ ...EMPTY_FORM })
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState<number | null>(null)

  // filter
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterYear, setFilterYear]     = useState("all")

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`/api/program/admin/student/${studentId}/curriculum`)
      setData(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to load curriculum data.")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  // ── Dialog open helpers ────────────────────────────────────────────────────

  const openAdd = (line: CurriculumLine) => {
    setEditing(null)
    setTargetLine(line)
    setForm({ ...EMPTY_FORM })
    setDialogOpen(true)
  }

  const openEdit = (line: CurriculumLine) => {
    const o = line.override!
    setEditing(o)
    setTargetLine(line)
    setForm({
      override_type:           o.override_type,
      effective_year_of_study: o.effective_year_of_study ?? "",
      effective_term_number:   o.effective_term_number ?? "",
      transferred_grade:       o.transferred_grade ?? "",
      transferred_institution: o.transferred_institution ?? "",
      notes:                   o.notes ?? "",
    })
    setDialogOpen(true)
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.override_type) return
    setSaving(true)
    try {
      if (editingOverride) {
        await axios.patch(`/api/program/admin/override/${editingOverride.id}`, form)
        setSnack({ msg: "Override updated.", sev: "success" })
      } else {
        await axios.post(
          `/api/program/admin/enrollment/${data!.enrollment_id}/overrides`,
          { ...form, curriculum_line_id: targetLine!.curriculum_line_id }
        )
        setSnack({ msg: "Override created.", sev: "success" })
      }
      setDialogOpen(false)
      load()
    } catch (e: any) {
      setSnack({ msg: e.response?.data?.detail || "Save failed.", sev: "error" })
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (overrideId: number) => {
    setDeleting(overrideId)
    try {
      await axios.delete(`/api/program/admin/override/${overrideId}`)
      setSnack({ msg: "Override removed. Student is back on standard path.", sev: "success" })
      load()
    } catch (e: any) {
      setSnack({ msg: e.response?.data?.detail || "Delete failed.", sev: "error" })
    } finally {
      setDeleting(null)
    }
  }

  // ── Filtered lines ────────────────────────────────────────────────────────

  const filtered = (data?.curriculum || []).filter(line => {
    if (filterStatus !== "all" && line.path_status !== filterStatus) return false
    if (filterYear !== "all" && String(line.year_of_study) !== filterYear) return false
    return true
  })

  const years = [...new Set((data?.curriculum || []).map(l => l.year_of_study))].sort()

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <CircularProgress sx={{ color: "#3e397b" }} />
    </Box>
  )

  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  )

  if (!data) return null

  const needsEffective = form.override_type === "deferred" || form.override_type === "backlog"
  const needsTransfer  = form.override_type === "transferred"

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/admin/enrollments")}
          variant="outlined"
          size="small"
          sx={{ borderColor: "#3e397b", color: "#3e397b" }}
        >
          Back to Enrollments
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Curriculum Path — {data.student_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.student_id} · {data.reg_no} · {data.program}
          </Typography>
        </Box>
      </Box>

      {/* Student summary strip */}
      <Paper
        elevation={0}
        sx={{
          mb: 3, p: 2.5, border: "1px solid #e0e0e0", borderRadius: 2,
          background: "linear-gradient(120deg, #2d2960 0%, #3e397b 100%)",
          color: "white",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap">
          {[
            { label: "Entry Point", value: data.entry_year ? `Year ${data.entry_year}, Term ${data.entry_term}` : "—" },
            { label: "Current Position", value: `Year ${data.current_year}, Term ${data.current_term}` },
            { label: "Total Curriculum Lines", value: data.total_lines },
            { label: "Standard Path", value: data.standard_count },
            { label: "Overrides Active", value: data.override_count },
          ].map(s => (
            <Box key={s.label}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>{s.label}</Typography>
              <Typography fontWeight={700}>{s.value}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Path Status</InputLabel>
          <Select value={filterStatus} label="Path Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="standard">Standard</MenuItem>
            {OVERRIDE_TYPES.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Year</InputLabel>
          <Select value={filterYear} label="Year" onChange={e => setFilterYear(e.target.value)}>
            <MenuItem value="all">All Years</MenuItem>
            {years.map(y => <MenuItem key={y} value={String(y)}>Year {y}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
          {filtered.length} of {data.total_lines} lines
        </Typography>
      </Stack>

      {/* Curriculum table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#3e397b" }}>
              {["Year/Term", "Code", "Title", "CU", "Type", "Path Status", "Effective At", "Notes", "Actions"].map(h => (
                <TableCell key={h} sx={{ color: "white", fontWeight: 700, py: 1.5 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((line, i) => (
              <TableRow
                key={line.curriculum_line_id}
                hover
                sx={{ bgcolor: i % 2 === 0 ? "transparent" : "#fafafa" }}
              >
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    Y{line.year_of_study} T{line.term_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={line.course_code}
                    size="small"
                    sx={{ bgcolor: "#ece9f7", color: "#3e397b", fontWeight: 700, fontSize: "0.7rem" }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{line.course_title}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption">{line.credit_units}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={line.course_type}
                    size="small"
                    color={line.course_type === "mandatory" ? "primary" : "secondary"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <PathChip
                    status={line.path_status}
                    label={
                      line.override
                        ? line.override.override_type_display
                        : "Standard"
                    }
                  />
                </TableCell>
                <TableCell>
                  {line.override?.effective_year_of_study
                    ? `Y${line.override.effective_year_of_study} T${line.override.effective_term_number}`
                    : "—"}
                </TableCell>
                <TableCell sx={{ maxWidth: 180 }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {line.override?.notes || line.override?.transferred_institution || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {line.override ? (
                      <>
                        <Tooltip title="Edit override">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEdit(line)}
                            sx={{ minWidth: 32, p: 0.5, borderColor: "#3e397b", color: "#3e397b" }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Remove override (revert to standard)">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(line.override!.id)}
                            disabled={deleting === line.override!.id}
                            sx={{ minWidth: 32, p: 0.5 }}
                          >
                            {deleting === line.override!.id
                              ? <CircularProgress size={14} />
                              : <DeleteIcon sx={{ fontSize: 16 }} />}
                          </Button>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Add override">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openAdd(line)}
                          sx={{ minWidth: 32, p: 0.5, borderColor: "#3e397b", color: "#3e397b" }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </Button>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No curriculum lines match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>Legend:</Typography>
        <PathChip status="standard"    label="Standard" />
        <PathChip status="exempted"    label="Exempted" />
        <PathChip status="transferred" label="Transferred" />
        <PathChip status="deferred"    label="Deferred" />
        <PathChip status="backlog"     label="Backlog" />
        <PathChip status="substituted" label="Substituted" />
      </Stack>

      {/* Override dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingOverride ? "Edit Override" : "Add Override"}
          {targetLine && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {targetLine.course_code} — {targetLine.course_title}
              {" "}(Blueprint: Y{targetLine.year_of_study} T{targetLine.term_number})
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>

          {/* Override type cards */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Override Type *</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
            {OVERRIDE_TYPES.map(t => (
              <Box
                key={t.value}
                onClick={() => setForm(f => ({ ...f, override_type: t.value }))}
                sx={{
                  border: "1.5px solid",
                  borderColor: form.override_type === t.value ? t.color : "#e0e0e0",
                  borderRadius: 2,
                  px: 2, py: 1.2,
                  cursor: "pointer",
                  bgcolor: form.override_type === t.value ? t.bg : "transparent",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: t.color, bgcolor: t.bg },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {OVERRIDE_ICONS[t.value]}
                  <Box>
                    <Typography variant="body2" fontWeight={form.override_type === t.value ? 700 : 500}>
                      {t.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {{
                        exempted:    "Course waived entirely — counts as satisfied, no registration needed",
                        transferred: "Credit from another institution — carries an external grade",
                        deferred:    "Postponed to a specific future term (e.g. January entrant)",
                        backlog:     "Must still be taken — show alongside current term courses",
                        substituted: "Another curriculum line satisfies this requirement",
                      }[t.value]}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>

          {/* Effective position — deferred / backlog */}
          {needsEffective && (
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Effective Year *</InputLabel>
                <Select
                  value={form.effective_year_of_study}
                  label="Effective Year *"
                  onChange={e => setForm(f => ({ ...f, effective_year_of_study: e.target.value as number }))}
                >
                  {[1, 2, 3, 4, 5].map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Effective Term *</InputLabel>
                <Select
                  value={form.effective_term_number}
                  label="Effective Term *"
                  onChange={e => setForm(f => ({ ...f, effective_term_number: e.target.value as number }))}
                >
                  {[1, 2, 3].map(t => <MenuItem key={t} value={t}>Term {t}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Transfer fields */}
          {needsTransfer && (
            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth size="small"
                label="Grade from transferring institution"
                value={form.transferred_grade}
                onChange={e => setForm(f => ({ ...f, transferred_grade: e.target.value }))}
                placeholder="e.g. B+, 70%, Credit"
              />
              <TextField
                fullWidth size="small"
                label="Transferring institution"
                value={form.transferred_institution}
                onChange={e => setForm(f => ({ ...f, transferred_institution: e.target.value }))}
                placeholder="e.g. Makerere University"
              />
            </Stack>
          )}

          {/* Notes */}
          <TextField
            fullWidth
            size="small"
            label="Notes / faculty reference"
            multiline
            rows={3}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Reason, faculty decision reference, or supporting note…"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !form.override_type}
            sx={{ bgcolor: "#3e397b", "&:hover": { bgcolor: "#2d2960" } }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save Override"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={!!snack}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snack?.sev} onClose={() => setSnack(null)} sx={{ width: "100%" }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Container>
  )
}
