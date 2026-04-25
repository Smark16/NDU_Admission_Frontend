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
  AssignmentInd as AppIcon,
  CheckCircle as SuccessIcon,
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
  // Education (optional for direct entry)
  olevel_school: string; olevel_year: string; olevel_index_number: string
  alevel_school: string; alevel_year: string; alevel_index_number: string; alevel_combination: string
  // Application details
  batch: string; campus: string; program: string; academic_level: string
  legacy_application_number: string
}

const GENDER_OPTIONS = ["Male", "Female", "Other"]
const RELATIONSHIP_OPTIONS = ["Parent", "Sibling", "Spouse", "Guardian", "Friend", "Other"]
const ALEVEL_COMBINATIONS = ["PCM", "PCB", "HEG", "HEL", "HEC", "MEG", "MEL", "MEH", "EGM", "Other"]

const emptyForm: FormData = {
  first_name: "", last_name: "", middle_name: "", date_of_birth: "",
  gender: "", nationality: "Ugandan", phone: "", email: "", address: "",
  nin: "", passport_number: "",
  next_of_kin_name: "", next_of_kin_contact: "", next_of_kin_relationship: "",
  olevel_school: "", olevel_year: "", olevel_index_number: "",
  alevel_school: "", alevel_year: "", alevel_index_number: "", alevel_combination: "",
  batch: "", campus: "", program: "", academic_level: "",
  legacy_application_number: "",
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, mb: 3 }}>
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#3e397b" }}>
        <Typography fontWeight={700} fontSize="0.9rem" color="white">{title}</Typography>
      </Box>
      <CardContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>{children}</Grid>
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DirectApplicationEntryPage() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ application_id: number; application_reference: string } | null>(null)
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
      "next_of_kin_relationship", "batch", "campus", "program", "academic_level",
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
      const res = await AxiosInstance.post("/api/admissions/direct_application_entry", {
        ...form,
        olevel_year: form.olevel_year || "0",
        alevel_year: form.alevel_year || "0",
      })
      setSuccess({ application_id: res.data.application_id, application_reference: res.data.application_reference })
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === "object" && !data.detail) {
        // Field-level errors from backend
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
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Application Created</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Reference: <strong>{success.application_reference}</strong><br />
          Application ID: <strong>{success.application_id}</strong>
        </Typography>
        <Chip label="Source: Direct Entry" color="info" sx={{ mb: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => navigate("/admin/application_list")}>
            View Application List
          </Button>
          <Button variant="contained" sx={{ bgcolor: "#3e397b" }}
            onClick={() => navigate(`/admin/admit_student/${success.application_id}`)}>
            Admit This Student
          </Button>
          <Button variant="text" onClick={() => { setSuccess(null); setForm(emptyForm) }}>
            Enter Another
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
        <AppIcon sx={{ color: "#3e397b", fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>Direct Application Entry</Typography>
          <Typography variant="body2" color="text.secondary">
            Manually create an applicant and application record — for walk-ins or migration from legacy systems.
          </Typography>
        </Box>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        This creates an application record marked as <strong>Direct Entry</strong>. The application will appear in the normal review queue.
        Education details are optional — enter what is available.
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
          <TextField fullWidth label="Passport Number" value={form.passport_number} onChange={set("passport_number")} size="small" />
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

      {/* Application Details */}
      <Section title="Application Details">
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
            <InputLabel>Programme</InputLabel>
            <Select value={form.program} label="Programme" onChange={e => setSelect("program")(e.target.value as string)}>
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
          <TextField fullWidth label="Legacy Application Number (optional)" value={form.legacy_application_number}
            onChange={set("legacy_application_number")} size="small"
            helperText="Enter if migrating from a legacy system" />
        </Grid>
      </Section>

      {/* Submit */}
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ bgcolor: "#3e397b", "&:hover": { bgcolor: "#2d2960" }, minWidth: 180 }}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AppIcon />}
        >
          {submitting ? "Creating..." : "Create Application"}
        </Button>
      </Stack>
    </Container>
  )
}
