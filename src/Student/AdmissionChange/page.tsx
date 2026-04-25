"use client"

import { useEffect, useState } from "react"
import {
  Box, Container, Typography, Paper, Grid, Chip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent,
} from "@mui/material"
import {
  SwapHoriz as SwapIcon,
  LocationOn as CampusIcon,
  School as ProgramIcon,
  Schedule as ModeIcon,
  History as HistoryIcon,
  EventBusy as DeadIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

interface Program { id: number; name: string; code: string }
interface Campus  { id: number; name: string }

interface AdmissionInfo {
  id: number
  student_id: string
  reg_no: string
  study_mode: string
  admitted_program: Program
  admitted_campus: Campus
}

interface ChangeRequest {
  id: number
  change_type: string
  change_type_display: string
  status: string
  status_display: string
  current_program_name: string | null
  current_campus_name: string | null
  current_study_mode: string
  new_program_name: string | null
  new_campus_name: string | null
  new_study_mode: string
  requested_year: number | null
  requested_semester: number | null
  reason: string
  review_notes: string
  reviewed_by_name: string | null
  reviewed_at: string | null
  created_at: string
}

const STUDY_MODES = [
  { value: "D",  label: "Day" },
  { value: "W",  label: "Weekend" },
  { value: "DL", label: "Distance Learning" },
  { value: "DJ", label: "Day January" },
  { value: "WJ", label: "Weekend January" },
]

const CHANGE_TYPES = [
  { value: "program",       label: "Programme Change",   description: "Transfer to a different programme" },
  { value: "campus",        label: "Campus Transfer",    description: "Move to a different campus" },
  { value: "study_mode",    label: "Study Mode Change",  description: "Change between Day / Weekend / Distance" },
  { value: "dead_semester", label: "Dead Semester",      description: "Request to sit out a semester and resume later" },
  { value: "dead_year",     label: "Dead Year",          description: "Request to sit out a full academic year" },
]

const statusColor = (s: string): "warning" | "success" | "error" =>
  s === "pending" ? "warning" : s === "approved" ? "success" : "error"

// Summarise what changed / was requested for the history table
function requestSummary(r: ChangeRequest): string {
  switch (r.change_type) {
    case "program":       return r.new_program_name   ? `→ ${r.new_program_name}`   : "—"
    case "campus":        return r.new_campus_name    ? `→ ${r.new_campus_name}`    : "—"
    case "study_mode":    return r.new_study_mode     ? `→ ${STUDY_MODES.find(m => m.value === r.new_study_mode)?.label || r.new_study_mode}` : "—"
    case "dead_semester": return r.requested_year && r.requested_semester ? `Year ${r.requested_year}, Semester ${r.requested_semester}` : "—"
    case "dead_year":     return r.requested_year     ? `Year ${r.requested_year}`  : "—"
    default:              return "—"
  }
}

export default function AdmissionChangePage() {
  const axios = useAxios()

  const [admission, setAdmission] = useState<AdmissionInfo | null>(null)
  const [requests, setRequests]   = useState<ChangeRequest[]>([])
  const [programs, setPrograms]   = useState<Program[]>([])
  const [campuses, setCampuses]   = useState<Campus[]>([])
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState({
    change_type:     "",
    new_program:     "" as number | "",
    new_campus:      "" as number | "",
    new_study_mode:  "",
    requested_year:  "" as number | "",
    requested_semester: "" as number | "",
    reason:          "",
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [admRes, reqRes, progRes, campRes] = await Promise.all([
        axios.get("/api/admissions/check_student_status"),
        axios.get("/api/admissions/change_requests/my"),
        axios.get("/api/program/list_programs"),
        axios.get("/api/accounts/list_campus"),
      ])
      if (admRes.data.is_admitted_student) {
        setAdmission({
          id: 0,
          student_id: admRes.data.student_id,
          reg_no: admRes.data.reg_no || "",
          study_mode: admRes.data.study_mode || "",
          admitted_program: { id: admRes.data.program_id || 0, name: admRes.data.program || "", code: "" },
          admitted_campus:  { id: admRes.data.campus_id  || 0, name: admRes.data.campus  || "" },
        })
      }
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : [])
      setPrograms(Array.isArray(progRes.data) ? progRes.data : progRes.data?.results ?? [])
      setCampuses(Array.isArray(campRes.data) ? campRes.data : [])
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to load admission data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () =>
    setForm({ change_type: "", new_program: "", new_campus: "", new_study_mode: "", requested_year: "", requested_semester: "", reason: "" })

  const handleSubmit = async () => {
    if (!form.change_type || !form.reason.trim()) {
      setError("Please fill in all required fields.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload: Record<string, any> = { change_type: form.change_type, reason: form.reason }
      if (form.change_type === "program"       && form.new_program)        payload.new_program        = form.new_program
      if (form.change_type === "campus"        && form.new_campus)         payload.new_campus         = form.new_campus
      if (form.change_type === "study_mode"    && form.new_study_mode)     payload.new_study_mode     = form.new_study_mode
      if (form.change_type === "dead_semester" || form.change_type === "dead_year") {
        if (form.requested_year)     payload.requested_year     = form.requested_year
        if (form.requested_semester) payload.requested_semester = form.requested_semester
      }
      await axios.post("/api/admissions/change_requests/my", payload)
      setSuccess("Your request has been submitted and is pending review.")
      setDialogOpen(false)
      resetForm()
      load()
    } catch (e: any) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || "Failed to submit request.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <CircularProgress />
    </Box>
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admission Requests</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Submit a request for a programme change, campus transfer, study mode change, dead semester, or dead year.
        All requests are subject to admin approval.
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Current Admission Card */}
      {admission && (
        <Card sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Current Admission Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ProgramIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Programme</Typography>
                    <Typography fontWeight={600}>{admission.admitted_program.name}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CampusIcon color="secondary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Campus</Typography>
                    <Typography fontWeight={600}>{admission.admitted_campus.name}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ModeIcon sx={{ color: "#f57c00" }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Study Mode</Typography>
                    <Typography fontWeight={600}>
                      {STUDY_MODES.find(m => m.value === admission.study_mode)?.label || admission.study_mode || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<SwapIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{ backgroundColor: "#3e397b" }}
              >
                Submit a Request
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Request History */}
      <Paper sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <HistoryIcon />
          <Typography variant="h6" fontWeight={600}>My Requests</Typography>
        </Box>
        {requests.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No requests submitted yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Admin Notes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Chip
                        label={r.change_type_display}
                        size="small"
                        icon={r.change_type.startsWith("dead") ? <DeadIcon sx={{ fontSize: 14 }} /> : undefined}
                        sx={{
                          bgcolor: r.change_type.startsWith("dead") ? "#fff3e0" : "#f3f0ff",
                          color:   r.change_type.startsWith("dead") ? "#e65100" : "#3e397b",
                          fontWeight: 600,
                          border: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>{requestSummary(r)}</TableCell>
                    <TableCell sx={{ maxWidth: 180, whiteSpace: "normal" }}>{r.reason}</TableCell>
                    <TableCell>
                      <Chip label={r.status_display} color={statusColor(r.status)} size="small" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 160, whiteSpace: "normal" }}>{r.review_notes || "—"}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Submit Dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); resetForm() }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Submit a Request</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Request type cards */}
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>What are you requesting?</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
            {CHANGE_TYPES.map(t => (
              <Box
                key={t.value}
                onClick={() => setForm({ ...form, change_type: t.value, new_program: "", new_campus: "", new_study_mode: "", requested_year: "", requested_semester: "" })}
                sx={{
                  border: "1.5px solid",
                  borderColor: form.change_type === t.value ? "#3e397b" : "#e0e0e0",
                  borderRadius: 2,
                  px: 2, py: 1.5,
                  cursor: "pointer",
                  bgcolor: form.change_type === t.value ? "#f3f0ff" : "transparent",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#3e397b", bgcolor: "#f7f5ff" },
                }}
              >
                <Typography variant="body2" fontWeight={form.change_type === t.value ? 700 : 500}>
                  {t.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">{t.description}</Typography>
              </Box>
            ))}
          </Box>

          {/* Conditional fields */}
          {form.change_type === "program" && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Programme</InputLabel>
              <Select value={form.new_program} label="New Programme"
                onChange={(e) => setForm({ ...form, new_program: e.target.value as number })}>
                {programs.map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.code})</MenuItem>)}
              </Select>
            </FormControl>
          )}

          {form.change_type === "campus" && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Campus</InputLabel>
              <Select value={form.new_campus} label="New Campus"
                onChange={(e) => setForm({ ...form, new_campus: e.target.value as number })}>
                {campuses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          {form.change_type === "study_mode" && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Study Mode</InputLabel>
              <Select value={form.new_study_mode} label="New Study Mode"
                onChange={(e) => setForm({ ...form, new_study_mode: e.target.value })}>
                {STUDY_MODES.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          {(form.change_type === "dead_semester" || form.change_type === "dead_year") && (
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Year of Study</InputLabel>
                <Select value={form.requested_year} label="Year of Study"
                  onChange={(e) => setForm({ ...form, requested_year: e.target.value as number })}>
                  {[1, 2, 3, 4, 5].map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
                </Select>
              </FormControl>
              {form.change_type === "dead_semester" && (
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select value={form.requested_semester} label="Semester"
                    onChange={(e) => setForm({ ...form, requested_semester: e.target.value as number })}>
                    {[1, 2, 3].map(s => <MenuItem key={s} value={s}>Semester {s}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            label="Reason *"
            multiline
            rows={4}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Please explain your reason for this request..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); resetForm() }} variant="outlined" color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !form.change_type}
            sx={{ backgroundColor: "#3e397b" }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
