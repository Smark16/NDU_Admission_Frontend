"use client"

import { useState, useEffect } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  ArrowBack as BackIcon,
  HowToReg as AdmitIcon,
  CheckCircle as SuccessIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import useAxios from "../../../AxiosInstance/UseAxios"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Batch    { id: number; name: string; academic_year: string }
interface Campus   { id: number; name: string }
interface Program  { id: number; name: string; short_form: string; code: string }
interface Level    { id: number; name: string }

interface FormData {
  // Personal
  first_name: string; last_name: string; middle_name: string
  date_of_birth: string; gender: string; nationality: string
  phone: string; email: string; address: string
  nin: string; passport_number: string
  // Next of kin
  next_of_kin_name: string; next_of_kin_contact: string; next_of_kin_relationship: string
  // Education (optional)
  olevel_school: string; olevel_year: string; olevel_index_number: string
  alevel_school: string; alevel_year: string; alevel_index_number: string; alevel_combination: string
  // Admission details
  batch: string; campus: string; program: string; academic_level: string; study_mode: string
  admission_notes: string; legacy_application_number: string
  // Override IDs (optional — for known legacy IDs)
  reg_no: string; student_id: string
}

interface SuccessData {
  admission_id: number
  student_id: string
  reg_no: string
  application_id: number
  application_reference: string
  message: string
}

const GENDER_OPTIONS = ["Male", "Female", "Other"]
const RELATIONSHIP_OPTIONS = ["Parent", "Sibling", "Spouse", "Guardian", "Friend", "Other"]
const STUDY_MODE_OPTIONS = [
  { value: "FT", label: "Full-Time (FT)" },
  { value: "PT", label: "Part-Time (PT)" },
  { value: "WD", label: "Weekend (WD)" },
  { value: "DE", label: "Distance Education (DE)" },
]
const ALEVEL_COMBINATIONS = ["PCM", "PCB", "HEG", "HEL", "HEC", "MEG", "MEL", "MEH", "EGM", "Other"]

const emptyForm: FormData = {
  first_name: "", last_name: "", middle_name: "", date_of_birth: "",
  gender: "", nationality: "Ugandan", phone: "", email: "", address: "",
  nin: "", passport_number: "",
  next_of_kin_name: "", next_of_kin_contact: "", next_of_kin_relationship: "",
  olevel_school: "", olevel_year: "", olevel_index_number: "",
  alevel_school: "", alevel_year: "", alevel_index_number: "", alevel_combination: "",
  batch: "", campus: "", program: "", academic_level: "", study_mode: "",
  admission_notes: "", legacy_application_number: "",
  reg_no: "", student_id: "",
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, accent = "#3e397b", children }: {
  title: string; accent?: string; children: React.ReactNode
}) {
  return (
    <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, mb: 3 }}>
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: accent }}>
        <Typography fontWeight={700} fontSize="0.9rem" color="white">{title}</Typography>
      </Box>
      <CardContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>{children}</Grid>
      </CardContent>
    </Card>
  )
}

// ── Copy button helper ────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Button size="small" onClick={handleCopy} startIcon={<CopyIcon sx={{ fontSize: 14 }} />}
      sx={{ minWidth: "auto", p: 0.5, color: copied ? "success.main" : "text.secondary" }}>
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DirectAdmissionEntryPage() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)
  const [serverError, setServerError] = useState("")

  const [batches, setBatches]   = useState<Batch[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [levels, setLevels]     = useState<Level[]>([])

  useEffect(() => {
    Promise.all([
      AxiosInstance.get("/api/admissions/batches/"),
      AxiosInstance.get("/api/accounts/list_campus"),
      AxiosInstance.get("/api/Programs/list_programs"),
      AxiosInstance.get("/api/admissions/list_admin_academic_level"),
    ]).then(([b, c, p, l]) => {
      setBatches(b.data)
      setCampuses(c.data)
      setPrograms(p.data)
      setLevels(l.data)
    }).catch(console.error)
  }, [])

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const setSelect = (field: keyof FormData) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const required: (keyof FormData)[] = [
      "first_name", "last_name", "date_of_birth", "gender", "nationality",
      "phone", "email", "next_of_kin_name", "next_of_kin_contact",
      "next_of_kin_relationship", "batch", "campus", "program",
      "academic_level", "study_mode",
    ]
    const errs: Partial<Record<keyof FormData, string>> = {}
    for (const f of required) {
      if (!form[f]) errs[f] = "Required"
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setServerError("")
    try {
      const payload: Record<string, string> = {
        ...form,
        olevel_year: form.olevel_year || "0",
        alevel_year: form.alevel_year || "0",
      }
      // Strip empty override IDs so backend generates them
      if (!payload.reg_no)    delete payload.reg_no
      if (!payload.student_id) delete payload.student_id

      const res = await AxiosInstance.post("/api/admissions/direct_admission_entry", payload)
      setSuccess(res.data)
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === "object" && !data.detail) {
        setErrors(data)
      } else {
        setServerError(data?.detail || "Submission failed. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: "center" }}>
        <SuccessIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Student Admitted Successfully</Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          The student account has been created. They can log in with their registration number (underscores replacing
          slashes) and the default password <strong>NDU@1234</strong>.
        </Typography>

        <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, my: 3, textAlign: "left" }}>
          <CardContent>
            {[
              { label: "Registration No.", value: success.reg_no },
              { label: "Student ID", value: success.student_id },
              { label: "Application Ref.", value: success.application_reference },
              { label: "Admission ID", value: String(success.admission_id) },
            ].map(({ label, value }) => (
              <Stack key={label} direction="row" justifyContent="space-between" alignItems="center"
                sx={{ py: 0.75, borderBottom: "1px solid #f5f5f5" }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  <CopyButton text={value} />
                </Stack>
              </Stack>
            ))}
          </CardContent>
        </Card>

        <Chip label="Source: Direct Admission" color="warning" sx={{ mb: 3 }} />

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Button variant="outlined" onClick={() => navigate("/admin/admited_students")}>
            View Admitted Students
          </Button>
          <Button variant="outlined"
            onClick={() => navigate(`/admin/admitted_student_review/${success.admission_id}`)}>
            Open Student Profile
          </Button>
          <Button variant="text" onClick={() => { setSuccess(null); setForm(emptyForm) }}>
            Admit Another
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ color: "#3e397b" }}>Back</Button>
        <Divider orientation="vertical" flexItem />
        <AdmitIcon sx={{ color: "#3e397b", fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>Direct Admission Entry</Typography>
          <Typography variant="body2" color="text.secondary">
            Admit a student directly without a portal application — for walk-ins or legacy system migration.
          </Typography>
        </Box>
      </Stack>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Controlled Feature.</strong> This bypasses the normal applicant portal flow. A student portal
        account will be created automatically. Use only for walk-in or legacy migration cases.
      </Alert>

      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      {/* Personal Information */}
      <Section title="Personal Information">
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required label="First Name" value={form.first_name} onChange={set("first_name")}
            error={!!errors.first_name} helperText={errors.first_name} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Middle Name" value={form.middle_name} onChange={set("middle_name")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required label="Last Name" value={form.last_name} onChange={set("last_name")}
            error={!!errors.last_name} helperText={errors.last_name} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required type="date" label="Date of Birth" value={form.date_of_birth}
            onChange={set("date_of_birth")} InputLabelProps={{ shrink: true }}
            error={!!errors.date_of_birth} helperText={errors.date_of_birth} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth required size="small" error={!!errors.gender}>
            <InputLabel>Gender</InputLabel>
            <Select value={form.gender} label="Gender" onChange={e => setSelect("gender")(e.target.value as string)}>
              {GENDER_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </Select>
            {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required label="Nationality" value={form.nationality} onChange={set("nationality")}
            error={!!errors.nationality} helperText={errors.nationality} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required label="Phone" value={form.phone} onChange={set("phone")}
            error={!!errors.phone} helperText={errors.phone} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required label="Email" type="email" value={form.email} onChange={set("email")}
            error={!!errors.email} helperText={errors.email} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Address" value={form.address} onChange={set("address")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="NIN" value={form.nin} onChange={set("nin")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="Passport Number" value={form.passport_number}
            onChange={set("passport_number")} size="small" />
        </Grid>
      </Section>

      {/* Next of Kin */}
      <Section title="Next of Kin">
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required label="Name" value={form.next_of_kin_name} onChange={set("next_of_kin_name")}
            error={!!errors.next_of_kin_name} helperText={errors.next_of_kin_name} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required label="Contact" value={form.next_of_kin_contact} onChange={set("next_of_kin_contact")}
            error={!!errors.next_of_kin_contact} helperText={errors.next_of_kin_contact} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth required size="small" error={!!errors.next_of_kin_relationship}>
            <InputLabel>Relationship</InputLabel>
            <Select value={form.next_of_kin_relationship} label="Relationship"
              onChange={e => setSelect("next_of_kin_relationship")(e.target.value as string)}>
              {RELATIONSHIP_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
            {errors.next_of_kin_relationship && <FormHelperText>{errors.next_of_kin_relationship}</FormHelperText>}
          </FormControl>
        </Grid>
      </Section>

      {/* Education (Optional) */}
      <Section title="Academic Background (Optional)">
        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" color="text.secondary">
            Enter what is available. Fields left blank will be recorded as N/A.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="O-Level School" value={form.olevel_school} onChange={set("olevel_school")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="O-Level Year" type="number" value={form.olevel_year} onChange={set("olevel_year")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="O-Level Index No." value={form.olevel_index_number} onChange={set("olevel_index_number")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="A-Level School" value={form.alevel_school} onChange={set("alevel_school")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="A-Level Year" type="number" value={form.alevel_year} onChange={set("alevel_year")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="A-Level Index No." value={form.alevel_index_number} onChange={set("alevel_index_number")} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>A-Level Combination</InputLabel>
            <Select value={form.alevel_combination} label="A-Level Combination"
              onChange={e => setSelect("alevel_combination")(e.target.value as string)}>
              {ALEVEL_COMBINATIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Section>

      {/* Admission Details */}
      <Section title="Admission Details" accent="#1b5e20">
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required size="small" error={!!errors.batch}>
            <InputLabel>Intake / Batch</InputLabel>
            <Select value={form.batch} label="Intake / Batch" onChange={e => setSelect("batch")(e.target.value as string)}>
              {batches.map(b => <MenuItem key={b.id} value={String(b.id)}>{b.name} ({b.academic_year})</MenuItem>)}
            </Select>
            {errors.batch && <FormHelperText>{errors.batch}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required size="small" error={!!errors.campus}>
            <InputLabel>Campus</InputLabel>
            <Select value={form.campus} label="Campus" onChange={e => setSelect("campus")(e.target.value as string)}>
              {campuses.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
            </Select>
            {errors.campus && <FormHelperText>{errors.campus}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required size="small" error={!!errors.program}>
            <InputLabel>Admitted Programme</InputLabel>
            <Select value={form.program} label="Admitted Programme" onChange={e => setSelect("program")(e.target.value as string)}>
              {programs.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
            </Select>
            {errors.program && <FormHelperText>{errors.program}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required size="small" error={!!errors.academic_level}>
            <InputLabel>Academic Level</InputLabel>
            <Select value={form.academic_level} label="Academic Level"
              onChange={e => setSelect("academic_level")(e.target.value as string)}>
              {levels.map(l => <MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>)}
            </Select>
            {errors.academic_level && <FormHelperText>{errors.academic_level}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required size="small" error={!!errors.study_mode}>
            <InputLabel>Study Mode</InputLabel>
            <Select value={form.study_mode} label="Study Mode"
              onChange={e => setSelect("study_mode")(e.target.value as string)}>
              {STUDY_MODE_OPTIONS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </Select>
            {errors.study_mode && <FormHelperText>{errors.study_mode}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Admission Notes" value={form.admission_notes}
            onChange={set("admission_notes")} size="small" multiline rows={2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Legacy Application Number (optional)" value={form.legacy_application_number}
            onChange={set("legacy_application_number")} size="small"
            helperText="Enter if migrating from a legacy system" />
        </Grid>
      </Section>

      {/* Override IDs (migration) */}
      <Section title="Legacy ID Override (Migration Only — Leave Blank for Auto-Generation)" accent="#4a148c">
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            Leave both fields blank to auto-generate a registration number and student ID.
            Only fill these in when migrating students with known IDs from a legacy system.
          </Alert>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Registration No. (override)" value={form.reg_no} onChange={set("reg_no")}
            error={!!errors.reg_no} helperText={errors.reg_no || "e.g. 24/1/BIT/FT/0012"}
            size="small" placeholder="Leave blank to auto-generate" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Student ID (override)" value={form.student_id} onChange={set("student_id")}
            error={!!errors.student_id} helperText={errors.student_id || "10-digit number"}
            size="small" placeholder="Leave blank to auto-generate" />
        </Grid>
      </Section>

      {/* Submit */}
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ bgcolor: "#1b5e20", "&:hover": { bgcolor: "#145a18" }, minWidth: 180 }}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AdmitIcon />}
        >
          {submitting ? "Admitting..." : "Admit Student Directly"}
        </Button>
      </Stack>
    </Container>
  )
}
