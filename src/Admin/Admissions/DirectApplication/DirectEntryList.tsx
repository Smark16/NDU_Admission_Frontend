"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, TextField, Chip, TablePagination, Button, Alert,
  Card, CardContent, Grid, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Typography, Checkbox, Tooltip,
  Snackbar,
} from "@mui/material"
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Campaign as CampaignIcon,
  HowToReg as HowToRegIcon,
  ThumbUp as ThumbUpIcon,
  AutoAwesome as GenerateIcon,
  PictureAsPdf as PdfIcon,
  Send as SendIcon,
} from "@mui/icons-material"
import { Link, useLocation, useNavigate } from "react-router-dom"
import useAxios from "../../../AxiosInstance/UseAxios"
import AnnouncementDialog from "../../../ReUsables/AnnouncementDialog"
import RejectionForm from "../ApplicationList/Review/RejectionForm"

type AppStatus = "submitted" | "accepted" | "rejected" | "under_review" | "pending_approval" | "admitted"

interface Application {
  id: number
  first_name: string
  last_name: string
  gender: string
  status: AppStatus
  created_at: string
  email: string
  programs: { id: number; name: string }[]
  faculty: string
  academic_level: string
  batch: string
  campus: string
}

const statusConfig: Record<
  AppStatus,
  { color: "default" | "info" | "warning" | "success" | "error"; icon: React.ReactElement }
> = {
  submitted:        { color: "info",    icon: <ScheduleIcon fontSize="small" /> },
  under_review:     { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
  pending_approval: { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
  accepted:         { color: "success", icon: <ThumbUpIcon fontSize="small" /> },
  rejected:         { color: "error",   icon: <CancelIcon fontSize="small" /> },
  admitted:         { color: "success", icon: <CheckCircleIcon fontSize="small" /> },
}

const getStatusLabel = (status: AppStatus) => {
  switch (status) {
    case "accepted":  return "Approved"
    case "under_review": return "Under Review"
    case "pending_approval": return "Awaiting Registrar"
    case "admitted":  return "Admitted"
    default: return status.replace("_", " ")
  }
}

const normalizeStatus = (status: string): AppStatus => {
  const s = (status || "").trim().toLowerCase()
  if (s === "admitted") return "admitted"
  if (s === "accepted") return "accepted"
  if (s === "rejected") return "rejected"
  if (s === "under_review") return "under_review"
  if (s === "pending_approval" || s === "pending") return "pending_approval"
  return "submitted"
}

const normalizeApplication = (raw: any): Application => {
  const rawPrograms = raw?.programs
  const normalizedPrograms =
    Array.isArray(rawPrograms)
      ? rawPrograms.map((p: any, idx: number) => ({ id: Number(p?.id ?? idx), name: String(p?.name ?? "").trim() }))
      : String(rawPrograms || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name, idx) => ({ id: -(idx + 1), name }))

  return {
    id: Number(raw?.id),
    first_name: String(raw?.first_name ?? ""),
    last_name: String(raw?.last_name ?? ""),
    gender: String(raw?.gender ?? ""),
    status: normalizeStatus(String(raw?.status)),
    created_at: String(raw?.created_at ?? new Date().toISOString()),
    email: String(raw?.email ?? ""),
    programs: normalizedPrograms,
    faculty: String(raw?.faculty ?? ""),
    academic_level: String(raw?.academic_level ?? ""),
    batch: String(raw?.batch ?? ""),
    campus: String(raw?.campus ?? ""),
  }
}

interface Campus { id: number; name: string }

export default function DirectEntryList() {
  const AxiosInstance = useAxios()
  const location = useLocation()
  const navigate = useNavigate()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [academicLevelFilter, setAcademicLevelFilter] = useState<string>("all")
  const [batchFilter, setBatchFilter] = useState<string>("all")
  const [campusFilter, setCampusFilter] = useState<string>("all")
  const [programFilter, setProgramFilter] = useState<string>("all")
  const [facultyFilter, setFacultyFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [campuses, setCampuses] = useState<Campus[]>([])

  const [selected, setSelected] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [offerActionLoading, setOfferActionLoading] = useState<Record<number, boolean>>({})
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null)
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })

  // Mirror status changes fired from review pages onto our local rows.
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, status } = (e as CustomEvent<{ id: number; status: AppStatus | string }>).detail
      setApplications(prev => prev.map(a => (a.id === id ? { ...a, status: normalizeStatus(String(status)) } : a)))
    }
    window.addEventListener("applicationStatusChanged", handler)
    return () => window.removeEventListener("applicationStatusChanged", handler)
  }, [])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await AxiosInstance.get("/api/admissions/direct_entry_applications")
        const data: Application[] = (res.data || []).map(normalizeApplication)
        setApplications(data)
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          `Failed to load applications (HTTP ${err?.response?.status ?? "unknown"})`
        )
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [AxiosInstance, location.key])

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        const res = await AxiosInstance.get("/api/accounts/list_campus")
        setCampuses(res.data || [])
      } catch {
        // non-fatal — page still works without campus filter
      }
    }
    loadCampuses()
  }, [AxiosInstance])

  const allAcademicLevels = useMemo(() => [...new Set(applications.map(a => a.academic_level).filter(Boolean))], [applications])
  const allBatches = useMemo(() => [...new Set(applications.map(a => a.batch).filter(Boolean))], [applications])
  const allPrograms = useMemo(
    () => [...new Set(applications.flatMap(a => (a.programs || []).map(p => p.name)).filter(Boolean))].sort(),
    [applications]
  )
  const allFaculties = useMemo(
    () => [
      ...new Set(
        applications
          .flatMap(a => String(a.faculty || "").split(",").map(s => s.trim()))
          .filter(Boolean)
      ),
    ].sort(),
    [applications]
  )
  const allGenders = useMemo(
    () => [...new Set(applications.map(a => a.gender).filter(Boolean))].sort(),
    [applications]
  )

  const filteredApplications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return applications.filter((app) => {
      const statusLabel = app.status === "accepted" ? "approved" : app.status
      const programNames = (app.programs || []).map((p) => p.name).join(" ")
      const haystack = [
        app.id,
        app.first_name,
        app.last_name,
        `${app.first_name} ${app.last_name}`,
        app.email,
        app.gender,
        app.status,
        statusLabel,
        programNames,
        app.faculty,
        app.academic_level,
        app.batch,
        app.campus,
      ]
        .filter((v) => v !== undefined && v !== null && v !== "")
        .join(" | ")
        .toLowerCase()

      const matchesSearch = q === "" || haystack.includes(q)
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      const matchesLevel = academicLevelFilter === "all" || app.academic_level === academicLevelFilter
      const matchesBatch = batchFilter === "all" || app.batch === batchFilter
      const matchesCampus = campusFilter === "all" || app.campus === campusFilter
      const matchesProgram =
        programFilter === "all" ||
        (app.programs || []).some(p => p.name === programFilter)
      const matchesFaculty =
        facultyFilter === "all" ||
        String(app.faculty || "").split(",").map(s => s.trim()).includes(facultyFilter)
      const matchesGender = genderFilter === "all" || app.gender === genderFilter
      return (
        matchesSearch &&
        matchesStatus &&
        matchesLevel &&
        matchesBatch &&
        matchesCampus &&
        matchesProgram &&
        matchesFaculty &&
        matchesGender
      )
    })
  }, [
    applications,
    searchTerm,
    statusFilter,
    academicLevelFilter,
    batchFilter,
    campusFilter,
    programFilter,
    facultyFilter,
    genderFilter,
  ])

  const paginatedApplications = filteredApplications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  const handleQuickApprove = async (app: Application) => {
    try {
      setApprovingId(app.id)
      await AxiosInstance.patch(`/api/admissions/change_applicatio_status/${app.id}`, { status: "accepted" })
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "accepted" } : a))
      setToast({
        open: true,
        message: `${app.first_name} ${app.last_name} approved. Find them under the "Approved" tab.`,
        severity: "success",
      })
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to approve application")
    } finally {
      setApprovingId(null)
    }
  }

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTarget) return
    const app = rejectTarget
    try {
      await AxiosInstance.patch(
        `/api/admissions/reject_application/${app.id}`,
        { rejection_reason: reason }
      )
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "rejected" } : a))
      setToast({
        open: true,
        message: `${app.first_name} ${app.last_name} rejected. Find them under the "Rejected" tab.`,
        severity: "success",
      })
      setRejectTarget(null)
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.rejection_reason?.[0] ||
        err?.response?.data?.message ||
        "Failed to reject application"
      setToast({ open: true, message: msg, severity: "error" })
      throw err
    }
  }

  const apiBaseUrl = ((import.meta.env.VITE_API_BASE_URL as string) || "").trim().replace(/\/+$/, "")

  const withAbsoluteUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    const normalizedPath = url.startsWith("/") ? url : `/${url}`
    return `${apiBaseUrl || window.location.origin}${normalizedPath}`
  }

  const setOfferLoading = (applicationId: number, loading: boolean) => {
    setOfferActionLoading(prev => ({ ...prev, [applicationId]: loading }))
  }

  const handleGenerateOfferLetter = async (app: Application) => {
    try {
      setOfferLoading(app.id, true)
      const { data } = await AxiosInstance.post(`/api/offer_letter/send_letter/${app.id}`)
      setToast({
        open: true,
        message: data?.detail || `Offer letter generation started for ${app.first_name} ${app.last_name}.`,
        severity: "success",
      })
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.response?.data?.detail || "Failed to generate offer letter",
        severity: "error",
      })
    } finally {
      setOfferLoading(app.id, false)
    }
  }

  const handleSendOfferLetter = async (app: Application) => {
    try {
      setOfferLoading(app.id, true)
      await AxiosInstance.post(`/api/offer_letter/resend_letter/${app.id}`)
      setToast({
        open: true,
        message: `Offer letter email sent to ${app.first_name} ${app.last_name}.`,
        severity: "success",
      })
    } catch (err: any) {
      // Fallback: if no generated letter exists yet, generate first.
      if (err?.response?.status === 400) {
        try {
          const { data } = await AxiosInstance.post(`/api/offer_letter/send_letter/${app.id}`)
          setToast({
            open: true,
            message: data?.detail || `Offer letter generated and email queued for ${app.first_name} ${app.last_name}.`,
            severity: "success",
          })
          return
        } catch (innerErr: any) {
          setToast({
            open: true,
            message: innerErr?.response?.data?.detail || "Failed to send offer letter",
            severity: "error",
          })
          return
        }
      }
      setToast({
        open: true,
        message: err?.response?.data?.detail || "Failed to send offer letter",
        severity: "error",
      })
    } finally {
      setOfferLoading(app.id, false)
    }
  }

  const handlePrintOfferLetter = async (app: Application) => {
    try {
      setOfferLoading(app.id, true)
      const { data } = await AxiosInstance.get(`/api/offer_letter/status/${app.id}`)
      const pdfUrl = withAbsoluteUrl(data?.pdf_url || null)
      if (!pdfUrl) {
        setToast({
          open: true,
          message: "No offer letter PDF found yet. Generate first.",
          severity: "info",
        })
        return
      }
      window.open(pdfUrl, "_blank", "noopener,noreferrer")
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.response?.data?.detail || "Failed to load offer letter PDF",
        severity: "error",
      })
    } finally {
      setOfferLoading(app.id, false)
    }
  }

  // ── Selection helpers ──
  const allPageIds = paginatedApplications.map(a => a.id)
  const allFilteredIds = filteredApplications.map(a => a.id)
  const allPageSelected = allPageIds.length > 0 && allPageIds.every(id => selected.includes(id))
  const somePageSelected = allPageIds.some(id => selected.includes(id))

  const toggleSelectAll = () => {
    if (allPageSelected) setSelected(prev => prev.filter(id => !allPageIds.includes(id)))
    else setSelected(prev => [...new Set([...prev, ...allPageIds])])
  }
  const toggleOne = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selectAllFiltered = () => setSelected(allFilteredIds)
  const clearSelection = () => setSelected([])

  const renderActions = (app: Application) => {
    const status = (app.status || "").toLowerCase()

    const approveBtn = (
      <Button
        size="small"
        variant="contained"
        startIcon={approvingId === app.id ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : <ThumbUpIcon />}
        disabled={approvingId === app.id}
        onClick={() => handleQuickApprove(app)}
        sx={{ textTransform: "none", bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" }, fontSize: "0.75rem" }}
      >
        Approve
      </Button>
    )

    const admitBtn = (
      <Button
        size="small"
        variant="contained"
        startIcon={<HowToRegIcon />}
        onClick={() => navigate(`/admin/admit_student/${app.id}`)}
        sx={{ textTransform: "none", bgcolor: "#000080", "&:hover": { bgcolor: "#000066" }, fontSize: "0.75rem" }}
      >
        Admit
      </Button>
    )

    const rejectBtn = (
      <Button
        size="small"
        variant="contained"
        color="error"
        startIcon={<CancelIcon />}
        onClick={() => setRejectTarget(app)}
        sx={{ textTransform: "none", fontSize: "0.75rem" }}
      >
        Reject
      </Button>
    )

    const viewBtn = (
      <Button
        component={Link}
        to={`/admin/application_review/${app.id}`}
        state={{ returnTo: "/admin/direct_entry_list", listApp: app }}
        size="small" variant="outlined" startIcon={<VisibilityIcon />}
        sx={{ textTransform: "none", borderColor: "#000080", color: "#000080", fontSize: "0.75rem" }}
      >
        View
      </Button>
    )

    if (status === "submitted" || status === "under_review") {
      return (
        <Box sx={{ display: "flex", gap: 0.75, justifyContent: "center", flexWrap: "wrap" }}>
          {approveBtn}
          {rejectBtn}
          {viewBtn}
        </Box>
      )
    }

    if (status === "accepted") {
      return (
        <Box sx={{ display: "flex", gap: 0.75, justifyContent: "center", flexWrap: "wrap" }}>
          {admitBtn}
          {rejectBtn}
          {viewBtn}
        </Box>
      )
    }

    if (status === "admitted") {
      return (
        <Box sx={{ display: "flex", gap: 0.75, justifyContent: "center", flexWrap: "wrap" }}>
          {viewBtn}
          <Tooltip title="Generate Offer Letter">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<GenerateIcon />}
                onClick={() => handleGenerateOfferLetter(app)}
                disabled={!!offerActionLoading[app.id]}
                sx={{ textTransform: "none", fontSize: "0.75rem" }}
              >
                Generate
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Print Offer Letter">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={() => handlePrintOfferLetter(app)}
                disabled={!!offerActionLoading[app.id]}
                sx={{ textTransform: "none", fontSize: "0.75rem" }}
              >
                Print
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Send Offer Letter Email">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={() => handleSendOfferLetter(app)}
                disabled={!!offerActionLoading[app.id]}
                sx={{ textTransform: "none", fontSize: "0.75rem" }}
              >
                Send
              </Button>
            </span>
          </Tooltip>
        </Box>
      )
    }

    return viewBtn
  }

  return (
    <Box sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#000080", fontWeight: "bold" }}>
            Direct Entry Applicants
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Students submitted through the direct entry (walk-in) process
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/direct_application")}
            sx={{ bgcolor: "#000080", "&:hover": { bgcolor: "#000066" }, textTransform: "none", fontWeight: 700 }}
          >
            Create Application
          </Button>
          <Button
            variant="outlined" startIcon={<CampaignIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ borderColor: "#000080", color: "#000080", "&:hover": { bgcolor: "#000080", color: "white" }, textTransform: "none", fontWeight: 700 }}
          >
            {selected.length > 0 ? `Send to ${selected.length} selected` : "Send Communication"}
          </Button>
        </Box>
      </Box>

      {/* Status stat cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[
          { label: "All",         value: applications.length,                                               filter: "all" },
          { label: "Submitted",   value: applications.filter(a => a.status === "submitted").length,        filter: "submitted" },
          { label: "Under Review",value: applications.filter(a => a.status === "under_review").length,     filter: "under_review" },
          { label: "Approved",    value: applications.filter(a => a.status === "accepted").length,         filter: "accepted" },
          { label: "Admitted",    value: applications.filter(a => a.status === "admitted").length,         filter: "admitted" },
          { label: "Rejected",    value: applications.filter(a => a.status === "rejected").length,         filter: "rejected" },
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 2 }}>
            <Card
              onClick={() => { setStatusFilter(stat.filter); setPage(0) }}
              sx={{
                background: statusFilter === stat.filter
                  ? "linear-gradient(135deg, #00006a 0%, #000080 100%)"
                  : "linear-gradient(135deg, #000080 0%, #000066 100%)",
                cursor: "pointer",
                outline: statusFilter === stat.filter ? "2px solid #5ba3f5" : "none",
                transition: "all 0.15s",
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>{stat.value}</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth size="small"
              placeholder="Search by name, email, ID, program, faculty, level, batch, campus, status, gender..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#999" }} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="pending_approval">Awaiting Registrar</MenuItem>
                <MenuItem value="accepted">Approved</MenuItem>
                <MenuItem value="admitted">Admitted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Academic Level</InputLabel>
              <Select value={academicLevelFilter} label="Academic Level" onChange={(e) => { setAcademicLevelFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Levels</MenuItem>
                {allAcademicLevels.map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Batch</InputLabel>
              <Select value={batchFilter} label="Batch" onChange={(e) => { setBatchFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Batches</MenuItem>
                {allBatches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Campus</InputLabel>
              <Select value={campusFilter} label="Campus" onChange={(e) => { setCampusFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Campuses</MenuItem>
                {campuses.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Program</InputLabel>
              <Select value={programFilter} label="Program" onChange={(e) => { setProgramFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Programs</MenuItem>
                {allPrograms.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Faculty</InputLabel>
              <Select value={facultyFilter} label="Faculty" onChange={(e) => { setFacultyFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Faculties</MenuItem>
                {allFaculties.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select value={genderFilter} label="Gender" onChange={(e) => { setGenderFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Genders</MenuItem>
                {allGenders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {selected.length > 0 && (
            <Grid size={{ xs: 12, sm: 12 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Tooltip title="Select all matching the current filters">
                  <Button size="small" variant="outlined" onClick={selectAllFiltered} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                    Select all {filteredApplications.length}
                  </Button>
                </Tooltip>
                <Button size="small" variant="text" onClick={clearSelection} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                  Clear selection ({selected.length})
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress sx={{ color: "#000080" }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, mb: 1 }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead sx={{ backgroundColor: "#f5f7fa" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={somePageSelected && !allPageSelected}
                      checked={allPageSelected}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Academic Level</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Program(s)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Faculty</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedApplications.length > 0 ? (
                  paginatedApplications.map((app, idx) => (
                    <TableRow key={app.id} hover selected={selected.includes(app.id)} sx={{ "&:hover": { backgroundColor: "#fafafa" } }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(app.id)} onChange={() => toggleOne(app.id)} />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{app.first_name} {app.last_name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{app.academic_level}</TableCell>
                      <TableCell>{app.gender}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{(app.programs ?? []).map(p => p.name).join(", ") || "—"}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{app.faculty || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(app.status)}
                          color={statusConfig[app.status]?.color}
                          icon={statusConfig[app.status]?.icon}
                          size="small"
                          sx={{ minWidth: 100 }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(app.created_at)}</TableCell>
                      <TableCell align="center">
                        {renderActions(app)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      <Alert severity="info">No direct entry applications found.</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredApplications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ backgroundColor: "white", borderRadius: "0 0 8px 8px", boxShadow: 3 }}
          />
        </>
      )}

      <RejectionForm
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleConfirmReject}
        title="Reject Application"
        itemName={rejectTarget ? `${rejectTarget.first_name} ${rejectTarget.last_name}` : undefined}
      />

      <AnnouncementDialog
        open={dialogOpen} onClose={() => setDialogOpen(false)}
        selectedIds={selected.length > 0 ? selected : undefined}
        context="direct entry applicant"
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
