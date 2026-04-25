/**
 * CurriculumManager
 * Full-screen dialog for managing a programme's curriculum mapping.
 * Allows admin to assign catalog courses to year/term slots as mandatory or elective,
 * and optionally tag each course as shared/common or specific to a specialization track.
 *
 * API surface used:
 *   GET  /api/program/<id>/curriculum?grouped=true        — grouped curriculum
 *   POST /api/program/<id>/curriculum                     — add line
 *   PATCH /api/program/curriculum/<pk>                    — edit line
 *   DELETE /api/program/curriculum/<pk>                   — remove line
 *   GET  /api/program/catalog_course_units                — catalog search
 *   GET  /api/program/<id>/specializations?active_only=true — track list
 */
import React, { useCallback, useEffect, useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  AccountTree as SpecIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"
import CustomButton from "../../../ReUsables/custombutton"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogCourse {
  id: number
  code: string
  title: string
  credit_units: string
}

interface CurriculumLine {
  id: number
  catalog_course: number
  catalog_course_detail: CatalogCourse
  year_of_study: number
  term_number: number
  course_type: "mandatory" | "elective"
  elective_group: string | null
  specialization: string | null
  sort_order: number
  is_active: boolean
}

interface TermGroup {
  term_number: number
  courses: CurriculumLine[]
}

interface YearGroup {
  year_of_study: number
  terms: TermGroup[]
}

interface CreditSummary {
  minimum_graduation_load: string
  total_mapped_credits: string
  mandatory_credits: string
  elective_credits: string
  credit_status: "ok" | "deficit" | "excess" | "unknown"
  credit_deficit: string
  credit_excess: string
}

interface SpecializationOption {
  id: number
  name: string
}

interface CurriculumManagerProps {
  open: boolean
  programId: number | null
  programName: string
  calendarType: "semester" | "trimester"
  minYears: number | undefined
  hasSpecialization?: boolean
  onClose: () => void
}

const SHARED_VALUE = ""   // empty string = shared/common course

const emptyLineForm = {
  catalog_course: "" as number | "",
  year_of_study: 1,
  term_number: 1,
  course_type: "mandatory" as "mandatory" | "elective",
  elective_group: "",
  specialization: SHARED_VALUE,
  sort_order: 0,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const termLabel = (calendarType: "semester" | "trimester", term: number) => {
  if (calendarType === "trimester") return `Trimester ${term}`
  return `Semester ${term}`
}

const termsPerYear = (calendarType: "semester" | "trimester") =>
  calendarType === "trimester" ? 3 : 2

// ─── Component ────────────────────────────────────────────────────────────────

const CurriculumManager: React.FC<CurriculumManagerProps> = ({
  open,
  programId,
  programName,
  calendarType,
  minYears,
  hasSpecialization = false,
  onClose,
}) => {
  const AxiosInstance = useAxios()

  const [curriculum, setCurriculum] = useState<YearGroup[]>([])
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null)
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourse[]>([])
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([])
  const [loading, setLoading] = useState(false)

  // Add / edit dialog
  const [lineDialog, setLineDialog] = useState(false)
  const [editingLineId, setEditingLineId] = useState<number | null>(null)
  const [lineForm, setLineForm] = useState(emptyLineForm)
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({})
  const [lineSaving, setLineSaving] = useState(false)

  // Pre-fill year/term when clicking "Add" on a specific slot
  const [prefilledYear, setPrefilledYear] = useState<number | null>(null)
  const [prefilledTerm, setPrefilledTerm] = useState<number | null>(null)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Bulk upload
  const [bulkDialog, setBulkDialog] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{
    created: number
    skipped: number
    error_count: number
    skipped_detail: { row: number; course_code: string; reason: string }[]
    errors: { row: number; course_code: string; reason: string }[]
  } | null>(null)

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false, message: "", type: "success",
  })

  // ── Fetch curriculum ──────────────────────────────────────────────────────

  const fetchCurriculum = useCallback(async () => {
    if (!programId) return
    setLoading(true)
    try {
      const { data } = await AxiosInstance.get(`/api/program/program/${programId}/curriculum`, {
        params: { grouped: "true" },
      })
      setCurriculum(data.curriculum ?? [])
      setCreditSummary(data.credit_summary ?? null)
    } catch {
      setSnackbar({ open: true, message: "Failed to load curriculum", type: "error" })
    } finally {
      setLoading(false)
    }
  }, [programId])

  const fetchCatalog = useCallback(async () => {
    try {
      const { data } = await AxiosInstance.get("/api/courses/catalog_course_units")
      const list: CatalogCourse[] = Array.isArray(data) ? data : data.results ?? []
      setCatalogCourses(list)
    } catch {
      // non-fatal
    }
  }, [])

  const fetchSpecializations = useCallback(async () => {
    if (!programId) return
    try {
      const { data } = await AxiosInstance.get(
        `/api/program/program/${programId}/specializations`,
        { params: { active_only: "true" } }
      )
      setSpecializations(data.specializations ?? [])
    } catch {
      setSpecializations([])
    }
  }, [programId])

  useEffect(() => {
    if (open && programId) {
      fetchCurriculum()
      fetchCatalog()
      fetchSpecializations()
    }
  }, [open, programId])

  // ── Add / edit helpers ────────────────────────────────────────────────────

  const openAddDialog = (year?: number, term?: number) => {
    setEditingLineId(null)
    setLineForm({
      ...emptyLineForm,
      year_of_study: year ?? 1,
      term_number: term ?? 1,
    })
    setPrefilledYear(year ?? null)
    setPrefilledTerm(term ?? null)
    setLineErrors({})
    setLineDialog(true)
  }

  const openEditDialog = (line: CurriculumLine) => {
    setEditingLineId(line.id)
    setLineForm({
      catalog_course: line.catalog_course,
      year_of_study: line.year_of_study,
      term_number: line.term_number,
      course_type: line.course_type,
      elective_group: line.elective_group ?? "",
      specialization: line.specialization ?? SHARED_VALUE,
      sort_order: line.sort_order,
    })
    setPrefilledYear(null)
    setPrefilledTerm(null)
    setLineErrors({})
    setLineDialog(true)
  }

  const validateLine = () => {
    const errs: Record<string, string> = {}
    if (!lineForm.catalog_course) errs.catalog_course = "Select a course"
    if (!lineForm.year_of_study || lineForm.year_of_study < 1) errs.year_of_study = "Required"
    if (!lineForm.term_number || lineForm.term_number < 1) errs.term_number = "Required"
    setLineErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveLine = async () => {
    if (!validateLine() || !programId) return
    setLineSaving(true)
    const specValue = lineForm.specialization === SHARED_VALUE ? null : lineForm.specialization
    const payload = {
      catalog_course: lineForm.catalog_course,
      year_of_study: lineForm.year_of_study,
      term_number: lineForm.term_number,
      course_type: lineForm.course_type,
      elective_group: lineForm.course_type === "elective" ? (lineForm.elective_group || null) : null,
      specialization: specValue || null,
      sort_order: lineForm.sort_order,
    }
    try {
      if (editingLineId) {
        await AxiosInstance.patch(`/api/program/curriculum/${editingLineId}`, payload)
        setSnackbar({ open: true, message: "Course updated", type: "success" })
      } else {
        await AxiosInstance.post(`/api/program/program/${programId}/curriculum`, payload)
        setSnackbar({ open: true, message: "Course added to curriculum", type: "success" })
      }
      setLineDialog(false)
      fetchCurriculum()
    } catch (e: any) {
      const detail = e.response?.data
      const msg = typeof detail === "string"
        ? detail
        : detail?.non_field_errors?.[0] ?? detail?.specialization?.[0] ?? detail?.detail ?? "Save failed"
      setSnackbar({ open: true, message: msg, type: "error" })
    } finally {
      setLineSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteLine = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await AxiosInstance.delete(`/api/program/curriculum/${deleteId}`)
      setSnackbar({ open: true, message: "Course removed from curriculum", type: "success" })
      setDeleteId(null)
      fetchCurriculum()
    } catch (e: any) {
      const msg = e.response?.data?.detail ?? "Delete failed"
      setSnackbar({ open: true, message: msg, type: "error" })
      setDeleteId(null)   // close the confirm dialog so the message is readable
    } finally {
      setDeleting(false)
    }
  }

  // ── Bulk upload helpers ───────────────────────────────────────────────────

  const downloadTemplate = () => {
    const header = "course_code,year_of_study,term_number,course_type,elective_group,specialization,sort_order"
    const example1 = "CSC101,1,1,mandatory,,,0"
    const example2 = "CSC102,1,1,elective,Group A,,0"
    const example3 = "CSC103,1,2,mandatory,,,0"
    const csv = [header, example1, example2, example3].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `curriculum_template_${programId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkUpload = async () => {
    if (!bulkFile || !programId) return
    setBulkUploading(true)
    setBulkResult(null)
    const form = new FormData()
    form.append("file", bulkFile)
    try {
      const { data } = await AxiosInstance.post(
        `/api/program/program/${programId}/curriculum/bulk_upload`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      setBulkResult(data)
      if (data.created > 0) fetchCurriculum()
    } catch (e: any) {
      const msg = e.response?.data?.detail ?? "Upload failed"
      setSnackbar({ open: true, message: msg, type: "error" })
    } finally {
      setBulkUploading(false)
    }
  }

  const openBulkDialog = () => {
    setBulkFile(null)
    setBulkResult(null)
    setBulkDialog(true)
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const creditColor = (status: string | undefined) => {
    if (status === "ok") return "#2e7d32"
    if (status === "deficit") return "#c62828"
    if (status === "excess") return "#e65100"
    return "#555"
  }

  const specChipColor = (spec: string | null) => {
    if (!spec) return { bg: "#e8f5e9", color: "#2e7d32" }      // green = shared
    return { bg: "#e3f2fd", color: "#1565c0" }                   // blue = track-specific
  }

  const maxYears = minYears ?? 4
  const tpy = termsPerYear(calendarType)

  // Map grouped response into easy lookup: "y-t" → courses
  const lineMap: Record<string, CurriculumLine[]> = {}
  curriculum.forEach((yg) => {
    yg.terms.forEach((tg) => {
      lineMap[`${yg.year_of_study}-${tg.term_number}`] = tg.courses
    })
  })

  // ── Term table ────────────────────────────────────────────────────────────

  const TermSection = ({ year, term }: { year: number; term: number }) => {
    const courses = lineMap[`${year}-${term}`] ?? []
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#3e397b" }}>
            {termLabel(calendarType, term)}
          </Typography>
          <CustomButton
            icon={<AddIcon />}
            text="Add Course"
            size="small"
            onClick={() => openAddDialog(year, term)}
          />
        </Box>

        {courses.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ pl: 1, fontStyle: "italic" }}>
            No courses mapped yet — click Add Course to begin.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600, width: 90 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 70 }} align="center">Credits</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 110 }} align="center">Type</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>Group</TableCell>
                {hasSpecialization && (
                  <TableCell sx={{ fontWeight: 600, width: 130 }}>Specialization</TableCell>
                )}
                <TableCell sx={{ fontWeight: 600, width: 80 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((line) => {
                const sc = specChipColor(line.specialization)
                return (
                  <TableRow key={line.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                        {line.catalog_course_detail.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{line.catalog_course_detail.title}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{line.catalog_course_detail.credit_units}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={line.course_type}
                        size="small"
                        sx={{
                          bgcolor: line.course_type === "mandatory" ? "#3e397b" : "#e3f2fd",
                          color: line.course_type === "mandatory" ? "white" : "#1565c0",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {line.elective_group ?? "—"}
                      </Typography>
                    </TableCell>
                    {hasSpecialization && (
                      <TableCell>
                        <Chip
                          label={line.specialization ?? "Shared"}
                          size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: "0.7rem" }}
                        />
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: "#3e397b" }} onClick={() => openEditDialog(line)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(line.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Box>
    )
  }

  // ── Year sections (accordion) ─────────────────────────────────────────────

  const yearGroups: { year: number; terms: number[] }[] = []
  for (let y = 1; y <= maxYears; y++) {
    yearGroups.push({ year: y, terms: Array.from({ length: tpy }, (_, i) => i + 1) })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
        slotProps={{ paper: { sx: { minHeight: "80vh" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#3e397b", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MenuBookIcon />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Curriculum — {programName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {calendarType === "semester" ? "Semester-based" : "Trimester-based"} · {maxYears} year{maxYears !== 1 ? "s" : ""}
                {hasSpecialization && " · Has specialization tracks"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Specialization notice */}
          {hasSpecialization && (
            <Alert
              icon={<SpecIcon />}
              severity="info"
              sx={{ mb: 2 }}
            >
              This programme has specialization tracks
              {specializations.length > 0 && (
                <> ({specializations.map((s) => s.name).join(", ")})</>
              )}. Mark each course as <strong>Shared</strong> (all students) or assign it to a specific track.
            </Alert>
          )}

          {/* Credit summary */}
          {creditSummary && (
            <Paper sx={{ p: 2, mb: 3, border: `2px solid ${creditColor(creditSummary.credit_status)}`, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <SchoolIcon sx={{ color: creditColor(creditSummary.credit_status) }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: creditColor(creditSummary.credit_status) }}>
                  Credit Summary
                  {creditSummary.credit_status === "ok" && " — Complete"}
                  {creditSummary.credit_status === "deficit" && ` — Deficit: ${creditSummary.credit_deficit} CU`}
                  {creditSummary.credit_status === "excess" && ` — Excess: ${creditSummary.credit_excess} CU`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Graduation Load</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{creditSummary.minimum_graduation_load} CU</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Total Mapped</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{creditSummary.total_mapped_credits} CU</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Mandatory</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#3e397b" }}>{creditSummary.mandatory_credits} CU</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Elective</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#1565c0" }}>{creditSummary.elective_credits} CU</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Year accordions */}
          {yearGroups.map(({ year, terms }) => (
            <Accordion key={year} defaultExpanded={year === 1} sx={{ mb: 1, border: "1px solid #e0e0e0" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#f8f8fc" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#3e397b" }}>
                  Year {year}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2 }}>
                {terms.map((term) => (
                  <TermSection key={term} year={year} term={term} />
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <CustomButton
            variant="outlined"
            text="Close"
            onClick={onClose}
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
          />
          {catalogCourses.length > 0 && (
            <Tooltip title="Upload many courses at once using a CSV file">
              <span>
                <CustomButton
                  icon={<UploadFileIcon />}
                  text="Bulk Upload"
                  variant="outlined"
                  onClick={openBulkDialog}
                  sx={{ borderColor: "#1565c0", color: "#1565c0" }}
                />
              </span>
            </Tooltip>
          )}
          <CustomButton
            icon={<AddIcon />}
            text="Add Course"
            onClick={() => openAddDialog()}
          />
        </DialogActions>
      </Dialog>

      {/* ── Add / Edit line dialog ───────────────────────────────────────── */}
      <Dialog open={lineDialog} onClose={() => setLineDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingLineId ? "Edit Curriculum Entry" : "Add Course to Curriculum"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>

          {/* Course picker */}
          <FormControl fullWidth margin="normal" error={!!lineErrors.catalog_course}>
            <InputLabel>Course (from catalog)</InputLabel>
            <Select
              value={lineForm.catalog_course}
              label="Course (from catalog)"
              onChange={(e) => setLineForm((p) => ({ ...p, catalog_course: e.target.value as number }))}
            >
              {catalogCourses.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.code} — {c.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {c.credit_units} credit units
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {lineErrors.catalog_course && <FormHelperText>{lineErrors.catalog_course}</FormHelperText>}
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Year of Study"
              type="number"
              fullWidth
              margin="normal"
              value={lineForm.year_of_study}
              onChange={(e) => setLineForm((p) => ({ ...p, year_of_study: Number(e.target.value) }))}
              slotProps={{ input: { inputProps: { min: 1, max: maxYears } } }}
              error={!!lineErrors.year_of_study}
              helperText={lineErrors.year_of_study ?? `1 – ${maxYears}`}
              disabled={prefilledYear !== null}
            />
            <TextField
              label={calendarType === "trimester" ? "Trimester" : "Semester"}
              type="number"
              fullWidth
              margin="normal"
              value={lineForm.term_number}
              onChange={(e) => setLineForm((p) => ({ ...p, term_number: Number(e.target.value) }))}
              slotProps={{ input: { inputProps: { min: 1, max: tpy } } }}
              error={!!lineErrors.term_number}
              helperText={lineErrors.term_number ?? `1 – ${tpy}`}
              disabled={prefilledTerm !== null}
            />
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Course Type</InputLabel>
            <Select
              value={lineForm.course_type}
              label="Course Type"
              onChange={(e) => setLineForm((p) => ({ ...p, course_type: e.target.value as "mandatory" | "elective" }))}
            >
              <MenuItem value="mandatory">Mandatory — all students must take this</MenuItem>
              <MenuItem value="elective">Elective — student chooses from a group</MenuItem>
            </Select>
          </FormControl>

          {lineForm.course_type === "elective" && (
            <TextField
              fullWidth
              label="Elective Group (optional)"
              margin="normal"
              value={lineForm.elective_group}
              onChange={(e) => setLineForm((p) => ({ ...p, elective_group: e.target.value }))}
              helperText='e.g. "Group A" — groups electives so students know which pool to pick from'
            />
          )}

          {/* ── Specialization selector (only shown when programme has tracks) ── */}
          {hasSpecialization && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Specialization Track</InputLabel>
              <Select
                value={lineForm.specialization}
                label="Specialization Track"
                onChange={(e) => setLineForm((p) => ({ ...p, specialization: e.target.value }))}
              >
                <MenuItem value={SHARED_VALUE}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                      Shared / Common
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      All students take this course regardless of their track
                    </Typography>
                  </Box>
                </MenuItem>
                {specializations.length > 0 ? (
                  specializations.map((s) => (
                    <MenuItem key={s.id} value={s.name}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1565c0" }}>
                          {s.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Only students in the {s.name} track
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography variant="caption" color="textSecondary">
                      No specialization tracks defined yet. Add them in the Program settings.
                    </Typography>
                  </MenuItem>
                )}
              </Select>
              <FormHelperText>
                {lineForm.specialization === SHARED_VALUE
                  ? "This course will appear for all students in this year/term."
                  : `This course will only appear for students in the "${lineForm.specialization}" track.`}
              </FormHelperText>
            </FormControl>
          )}

          <TextField
            fullWidth
            label="Sort Order"
            type="number"
            margin="normal"
            value={lineForm.sort_order}
            onChange={(e) => setLineForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
            helperText="Lower number appears first. Leave 0 for default ordering by code."
            slotProps={{ input: { inputProps: { min: 0 } } }}
          />
        </DialogContent>
        <DialogActions>
          <CustomButton
            variant="outlined"
            text="Cancel"
            onClick={() => setLineDialog(false)}
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
          />
          <CustomButton
            text={lineSaving ? "Saving..." : editingLineId ? "Update" : "Add"}
            disabled={lineSaving}
            onClick={handleSaveLine}
          />
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Remove Course from Curriculum</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this course from the curriculum? This does not delete the course
            from the catalog — it only removes the programme mapping.
          </Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton
            variant="outlined"
            text="Cancel"
            onClick={() => setDeleteId(null)}
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
          />
          <CustomButton
            text={deleting ? "Removing..." : "Remove"}
            disabled={deleting}
            onClick={handleDeleteLine}
          />
        </DialogActions>
      </Dialog>

      {/* ── Bulk Upload dialog ──────────────────────────────────────────── */}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UploadFileIcon sx={{ color: "#1565c0" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Bulk Upload Curriculum</Typography>
          </Box>
          <IconButton onClick={() => setBulkDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {/* Instructions */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>CSV format required</Typography>
            <Typography variant="body2">
              Required columns: <strong>course_code, year_of_study, term_number, course_type</strong>
              <br />
              Optional: elective_group, specialization, sort_order
              <br />
              <em>course_type</em> must be <code>mandatory</code> or <code>elective</code>.
              Rows with codes not in the catalog will be reported as errors.
            </Typography>
          </Alert>

          {/* Download template */}
          <Box sx={{ mb: 2 }}>
            <CustomButton
              icon={<DownloadIcon />}
              text="Download Template"
              variant="outlined"
              onClick={downloadTemplate}
              sx={{ borderColor: "#2e7d32", color: "#2e7d32" }}
            />
          </Box>

          {/* File picker */}
          <Box
            sx={{
              border: "2px dashed #1565c0",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: bulkFile ? "#e3f2fd" : "#fafafa",
              cursor: "pointer",
              mb: 2,
            }}
            onClick={() => document.getElementById("bulk-csv-input")?.click()}
          >
            <input
              id="bulk-csv-input"
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setBulkFile(f)
                setBulkResult(null)
              }}
            />
            <UploadFileIcon sx={{ fontSize: 36, color: "#1565c0", mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {bulkFile ? bulkFile.name : "Click to choose a CSV file"}
            </Typography>
          </Box>

          {/* Results */}
          {bulkResult && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${bulkResult.created} created`}
                  color="success"
                  variant="filled"
                />
                <Chip
                  icon={<InfoIcon />}
                  label={`${bulkResult.skipped} skipped (already exist)`}
                  color="default"
                  variant="outlined"
                />
                {bulkResult.error_count > 0 && (
                  <Chip
                    icon={<ErrorIcon />}
                    label={`${bulkResult.error_count} errors`}
                    color="error"
                    variant="filled"
                  />
                )}
              </Box>

              {bulkResult.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Rows with errors (not imported):</Typography>
                  {bulkResult.errors.map((e, i) => (
                    <Typography key={i} variant="caption" display="block">
                      Row {e.row}: <strong>{e.course_code || "(blank)"}</strong> — {e.reason}
                    </Typography>
                  ))}
                </Alert>
              )}

              {bulkResult.skipped_detail.length > 0 && (
                <Alert severity="warning">
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Skipped rows (already mapped):</Typography>
                  {bulkResult.skipped_detail.map((s, i) => (
                    <Typography key={i} variant="caption" display="block">
                      Row {s.row}: <strong>{s.course_code}</strong>
                    </Typography>
                  ))}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <CustomButton
            variant="outlined"
            text="Cancel"
            onClick={() => setBulkDialog(false)}
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
          />
          <CustomButton
            icon={<UploadFileIcon />}
            text={bulkUploading ? "Uploading..." : "Upload"}
            disabled={!bulkFile || bulkUploading}
            onClick={handleBulkUpload}
          />
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default CurriculumManager
