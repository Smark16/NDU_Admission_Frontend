"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  Campaign as CampaignIcon,
  HowToReg as HowToRegIcon,
  ThumbUp as ThumbUpIcon,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import useAxios from "../../../AxiosInstance/UseAxios"
import AnnouncementDialog from "../../../ReUsables/AnnouncementDialog"
import RejectionForm from "./Review/RejectionForm"
import { Stack } from "@mui/system"
import { asApiList } from "../../../utils/asApiList"

type AppStatus = "submitted" | "accepted" | "direct_entry" | "under_review" | "pending_approval" | "online" | 'rejected' | "revoked"

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
  is_direct_entry: boolean
  program_choices_confirmed_at: string | null
  program_choices_confirmed_by?: string
  program_choices_suspect?: boolean
  updated_at: string | null
  reviewed_at: string | null
}

interface Campus {
  id: number
  name: string
}

type ChoiceConfirmationFilter = "all" | "awaiting" | "confirmed" | "flagged"

type PersistedFilters = {
  searchTerm: string
  statusFilter: string
  choiceConfirmationFilter: ChoiceConfirmationFilter
  academicLevelFilter: string
  batchFilter: string
  campusFilter: string
  programFilter: string
  facultyFilter: string
  genderFilter: string
  dateFrom: string
  dateTo: string
}

const FILTERS_STORAGE_KEY = "ndu-admissions-applications-filters-v1"

const readPersistedFilters = (): PersistedFilters | null => {
  try {
    if (typeof window === "undefined") return null
    const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      searchTerm: String(parsed.searchTerm ?? ""),
      statusFilter: String(parsed.statusFilter ?? "all"),
      choiceConfirmationFilter: (["all", "awaiting", "confirmed", "flagged"].includes(
        parsed.choiceConfirmationFilter
      )
        ? parsed.choiceConfirmationFilter
        : "all") as ChoiceConfirmationFilter,
      academicLevelFilter: String(parsed.academicLevelFilter ?? "all"),
      batchFilter: String(parsed.batchFilter ?? "all"),
      campusFilter: String(parsed.campusFilter ?? "all"),
      programFilter: String(parsed.programFilter ?? "all"),
      facultyFilter: String(parsed.facultyFilter ?? "all"),
      genderFilter: String(parsed.genderFilter ?? "all"),
      dateFrom: String(parsed.dateFrom ?? ""),
      dateTo: String(parsed.dateTo ?? ""),
    }
  } catch {
    return null
  }
}

const statusConfig: Record<
  AppStatus,
  { color: "default" | "info" | "warning" | "success" | "error"; icon: React.ReactElement }
> = {
  submitted: { color: "info", icon: <ScheduleIcon fontSize="small" /> },
  under_review: { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
  pending_approval: { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
  accepted: { color: "success", icon: <ThumbUpIcon fontSize="small" /> },
  direct_entry: { color: "error", icon: <CancelIcon fontSize="small" /> },
  online: { color: "success", icon: <CheckCircleIcon fontSize="small" /> },
  rejected: { color: "error", icon: <CancelIcon fontSize="small" /> },
  revoked: { color: "error", icon: <CancelIcon fontSize="small" /> },
}

const getStatusLabel = (status: AppStatus) => {
  switch (status) {
    case "accepted": return "Approved"
    case "under_review": return "Under Review"
    case "pending_approval": return "Awaiting Registrar"
    case "online": return "Online"
    case "rejected": return "Rejected"
    case "revoked": return "Revoked"
    default: return status.replace("_", " ")
  }
}

const hasSuspectProgramChoices = (app: Application) => Boolean(app.program_choices_suspect)

/** Applicant clicked Confirm in the portal (not staff change programme). */
const isApplicantProgramChoicesConfirmed = (app: Application) =>
  Boolean(app.program_choices_confirmed_at) &&
  (app.program_choices_confirmed_by || "").toLowerCase() === "applicant"

const isProgramChoicesConfirmed = (app: Application) => isApplicantProgramChoicesConfirmed(app)

const purpleChipSx = {
  minWidth: 100,
  bgcolor: "#7B1FA2",
  color: "#fff",
  fontWeight: 600,
  "& .MuiChip-icon": { color: "#fff" },
} as const

/** Flagged migration clone pattern — teal so it is not confused with under_review (orange). */
const verifyChoicesChipSx = {
  minWidth: 120,
  bgcolor: "#00796B",
  color: "#fff",
  fontWeight: 600,
  "& .MuiChip-icon": { color: "#fff" },
} as const

const renderStatusChip = (app: Application) => {
  const suspect = hasSuspectProgramChoices(app)
  const confirmed = isProgramChoicesConfirmed(app)
  const label = confirmed
    ? `${getStatusLabel(app.status)} · Applicant confirmed ✓`
    : suspect
      ? `${getStatusLabel(app.status)} · Verify choices`
      : getStatusLabel(app.status)

  if (suspect && !confirmed) {
    return (
      <Chip
        label={label}
        size="small"
        icon={<ScheduleIcon fontSize="small" />}
        sx={verifyChoicesChipSx}
      />
    )
  }

  if (confirmed) {
    return (
      <Chip
        label={label}
        size="small"
        icon={<CheckCircleIcon fontSize="small" />}
        sx={purpleChipSx}
      />
    )
  }

  return (
    <Chip
      label={label}
      color={statusConfig[app.status]?.color ?? "default"}
      icon={statusConfig[app.status]?.icon}
      size="small"
      sx={{ minWidth: 100 }}
    />
  )
}

const normalizeStatus = (status: string): AppStatus => {
  const s = (status || "").trim().toLowerCase()
  if (s === "online") return "online"
  if (s === "accepted") return "accepted"
  if (s === "direct_entry") return "direct_entry"
  if (s === "under_review") return "under_review"
  if (s === "pending_approval" || s === "pending") return "pending_approval"
  if (s === "rejected") return "rejected"
  if (s === "revoked") return "revoked"
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
    is_direct_entry: Boolean(raw?.is_direct_entry),
    program_choices_confirmed_at: raw?.program_choices_confirmed_at
      ? String(raw.program_choices_confirmed_at)
      : null,
    program_choices_confirmed_by: String(raw?.program_choices_confirmed_by ?? ""),
    program_choices_suspect: Boolean(raw?.program_choices_suspect),
    updated_at: raw?.updated_at ? String(raw.updated_at) : null,
    reviewed_at: raw?.reviewed_at ? String(raw.reviewed_at) : null,
  }
}

export default function ApplicationList() {
  const AxiosInstance = useAxios()
  // const location = useLocation()
  const navigate = useNavigate()
  const initialFilters = readPersistedFilters()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm ?? "")
  /** Debounced value sent to the API so typing does not fight programme-choice filters. */
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.statusFilter ?? "all")
  const [choiceConfirmationFilter, setChoiceConfirmationFilter] = useState<ChoiceConfirmationFilter>(
    initialFilters?.choiceConfirmationFilter ?? "all"
  )
  const [academicLevelFilter, setAcademicLevelFilter] = useState<string>(initialFilters?.academicLevelFilter ?? "all")
  const [batchFilter, setBatchFilter] = useState<string>(initialFilters?.batchFilter ?? "all")
  const [campusFilter, setCampusFilter] = useState<string>(initialFilters?.campusFilter ?? "all")
  const [programFilter, setProgramFilter] = useState<string>(initialFilters?.programFilter ?? "all")
  const [facultyFilter, setFacultyFilter] = useState<string>(initialFilters?.facultyFilter ?? "all")
  const [genderFilter, setGenderFilter] = useState<string>(initialFilters?.genderFilter ?? "all")
  const [dateFrom, setDateFrom] = useState<string>(initialFilters?.dateFrom ?? "")
  const [dateTo, setDateTo] = useState<string>(initialFilters?.dateTo ?? "")
  const [campuses, setCampuses] = useState<Campus[]>([])

  const [selected, setSelected] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [choiceStats, setChoiceStats] = useState({ awaiting: 0, confirmed: 0, flagged: 0 })
  // Track which row is mid-approve so we can show a spinner
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null)
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })

  // Listen for status-change events fired from review pages and just mirror
  // the new status onto the corresponding row without changing filters.
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, status } = (e as CustomEvent<{ id: number; status: AppStatus | string }>).detail
      setApplications(prev => prev.map(a => (a.id === id ? { ...a, status: normalizeStatus(String(status)) } : a)))
    }
    window.addEventListener("applicationStatusChanged", handler)
    return () => window.removeEventListener("applicationStatusChanged", handler)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const buildFilterParams = useCallback(
    (opts?: { includeChoice?: boolean; forPage?: boolean }) => {
      const params = new URLSearchParams()
      if (opts?.forPage !== false) {
        params.append("page", String(page + 1))
        params.append("page_size", String(rowsPerPage))
      }
      if (debouncedSearch) params.append("search", debouncedSearch)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (opts?.includeChoice !== false && choiceConfirmationFilter !== "all") {
        params.append("choice_confirmation", choiceConfirmationFilter)
      }
      if (academicLevelFilter !== "all") params.append("academic_level", academicLevelFilter)
      if (batchFilter !== "all") params.append("batch", batchFilter)
      if (campusFilter !== "all") params.append("campus", campusFilter)
      if (programFilter !== "all") params.append("program", programFilter)
      if (facultyFilter !== "all") params.append("faculty", facultyFilter)
      if (genderFilter !== "all") params.append("gender", genderFilter)
      if (dateFrom) params.append("date_from", dateFrom)
      if (dateTo) params.append("date_to", dateTo)
      return params
    },
    [
      page,
      rowsPerPage,
      debouncedSearch,
      statusFilter,
      choiceConfirmationFilter,
      academicLevelFilter,
      batchFilter,
      campusFilter,
      programFilter,
      facultyFilter,
      genderFilter,
      dateFrom,
      dateTo,
    ]
  )

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await AxiosInstance.get(
        `/api/admissions/all_applications_report/?${buildFilterParams({ includeChoice: true, forPage: true }).toString()}`
      )
      const list = asApiList<Record<string, unknown>>(res.data)
      setApplications(list.map(normalizeApplication))
      const count =
        res.data && typeof res.data === "object" && !Array.isArray(res.data) && "count" in res.data
          ? Number((res.data as { count?: number }).count ?? list.length)
          : list.length
      setTotalCount(count)
    } catch (err: any) {
      console.error("Failed to load applications:", err)
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        `Failed to load applications (HTTP ${err?.response?.status ?? "unknown"})`
      )
    } finally {
      setLoading(false)
    }
  }, [AxiosInstance, buildFilterParams])

  const fetchChoiceStats = useCallback(async () => {
    try {
      const res = await AxiosInstance.get(
        `/api/admissions/application_choice_stats/?${buildFilterParams({ includeChoice: false, forPage: false }).toString()}`
      )
      setChoiceStats({
        awaiting: Number(res.data?.awaiting ?? 0),
        confirmed: Number(res.data?.confirmed ?? 0),
        flagged: Number(res.data?.flagged ?? 0),
      })
    } catch {
      // Stats are supplementary; list still works without them.
    }
  }, [AxiosInstance, buildFilterParams])

  useEffect(() => {
    fetchApplications()
    fetchChoiceStats()
  }, [fetchApplications, fetchChoiceStats])

  /** Prevent empty table when filters shrink result set but page stays high. */
  useEffect(() => {
    if (totalCount <= 0) {
      if (page !== 0) setPage(0)
      return
    }
    const maxPage = Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1)
    if (page > maxPage) setPage(maxPage)
  }, [totalCount, rowsPerPage, page])

  useEffect(() => {
    const refresh = () => {
      fetchApplications()
      fetchChoiceStats()
    }
    window.addEventListener("programChoicesConfirmed", refresh)
    return () => window.removeEventListener("programChoicesConfirmed", refresh)
  }, [fetchApplications, fetchChoiceStats])

  useEffect(() => {
    AxiosInstance.get<Campus[]>("/api/accounts/list_campus")
      .then(res => setCampuses(res.data))
      .catch(() => { })
  }, [AxiosInstance])

  useEffect(() => {
    if (typeof window === "undefined") return
    const payload: PersistedFilters = {
      searchTerm,
      statusFilter,
      choiceConfirmationFilter,
      academicLevelFilter,
      batchFilter,
      campusFilter,
      programFilter,
      facultyFilter,
      genderFilter,
      dateFrom,
      dateTo,
    }
    window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(payload))
  }, [
    searchTerm,
    statusFilter,
    choiceConfirmationFilter,
    academicLevelFilter,
    batchFilter,
    campusFilter,
    programFilter,
    facultyFilter,
    genderFilter,
    dateFrom,
    dateTo,
  ])

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

  /**
   * Table rows come straight from the API when a programme-choice filter is active.
   * Re-filtering client-side hid every row if program_choices_suspect was missing/false
   * in the payload even though the server already applied choice_confirmation.
   */
  const paginatedApplications = applications

  const activeChoiceFilterLabel =
    choiceConfirmationFilter === "confirmed"
      ? "Showing applicants who confirmed programme choices themselves in the portal (purple)"
      : choiceConfirmationFilter === "awaiting"
        ? "Showing applicants awaiting programme choice confirmation"
        : choiceConfirmationFilter === "flagged"
          ? "Showing applicants with migration-flagged programme data (teal)"
          : null

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  // Inline approve — updates the row in place without leaving the list
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

  // Inline reject — opens the rejection dialog, then PATCHes when the user confirms
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

  // ── Selection helpers ──
  const allPageIds = paginatedApplications.map(a => a.id)
  const allFilteredIds = applications.map(a => a.id)
  const allPageSelected = allPageIds.length > 0 && allPageIds.every(id => selected.includes(id))
  const somePageSelected = allPageIds.some(id => selected.includes(id))

  const toggleSelectAll = () => {
    if (allPageSelected) setSelected(prev => prev.filter(id => !allPageIds.includes(id)))
    else setSelected(prev => [...new Set([...prev, ...allPageIds])])
  }
  const toggleOne = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selectAllFiltered = () => setSelected(allFilteredIds)
  const clearSelection = () => setSelected([])

  const handleApplyFilters = () => {
    setDebouncedSearch(searchTerm.trim())
    setPage(0)
  }

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setChoiceConfirmationFilter("all");
    setAcademicLevelFilter("all");
    setBatchFilter("all");
    setCampusFilter("all");
    setProgramFilter("all");
    setFacultyFilter("all");
    setGenderFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

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
        sx={{ textTransform: "none", bgcolor: "#0D0060", "&:hover": { bgcolor: "#07003a" }, fontSize: "0.75rem" }}
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
        state={{ returnTo: "/admin/application_list", listApp: app }}
        size="small" variant="outlined" startIcon={<VisibilityIcon />}
        sx={{ textTransform: "none", borderColor: "#1976d2", color: "#1976d2", fontSize: "0.75rem" }}
      >
        View
      </Button>
    )

    // Reviewer queue: submitted / under review → Approve + Reject + View
    if (status === "submitted" || status === "under_review") {
      return (
        <Box sx={{ display: "flex", gap: 0.75, justifyContent: "center", flexWrap: "wrap" }}>
          {approveBtn}
          {rejectBtn}
          {viewBtn}
        </Box>
      )
    }

    // Admissions officer queue: approved → Admit + Reject + View
    if (status === "accepted") {
      return (
        <Box sx={{ display: "flex", gap: 0.75, justifyContent: "center", flexWrap: "wrap" }}>
          {admitBtn}
          {rejectBtn}
          {viewBtn}
        </Box>
      )
    }

    // Admitted / Rejected — view only
    return viewBtn
  }

  return (
    <Box sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#0D0060", fontWeight: "bold" }}>Applications</Typography>
          <Typography variant="body2" color="text.secondary">Manage and review all student applications</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CampaignIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "#0D0060", "&:hover": { bgcolor: "#0a004a" }, textTransform: "none", fontWeight: 700 }}
        >
          {selected.length > 0 ? `Send to ${selected.length} selected` : "Send Communication"}
        </Button>
      </Box>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Total",
            value: totalCount,                    
            filter: "all",
            kind: "status" as const
          },
          {
            label: "Submitted",
            value: applications.filter(a => a.status === "submitted").length,
            filter: "submitted",
            kind: "status" as const
          },
          {
            label: "Under Review",
            value: applications.filter(a => a.status === "under_review").length,
            filter: "under_review",
            kind: "status" as const
          },
          {
            label: "Awaiting choices",
            value: choiceStats.awaiting,
            filter: "awaiting",
            kind: "choice" as const
          },
          {
            label: "Choices confirmed",
            value: choiceStats.confirmed,
            filter: "confirmed",
            kind: "choice" as const
          },
          {
            label: "Flagged data",
            value: choiceStats.flagged,
            filter: "flagged",
            kind: "choice" as const
          },
          {
            label: "Approved",
            value: applications.filter(a => a.status === "accepted").length,
            filter: "accepted",
            kind: "status" as const
          },
          {
            label: "Online",
            value: applications.filter(a => a.is_direct_entry === false).length,
            filter: "admitted",
            kind: "status" as const
          },
          {
            label: "Direct Entry",
            value: applications.filter(a => a.is_direct_entry === true).length,
            filter: "rejected",
            kind: "status" as const
          },
        ].map((stat, i) => {
          const isActive =
            stat.kind === "choice"
              ? choiceConfirmationFilter === stat.filter
              : statusFilter === stat.filter && choiceConfirmationFilter === "all"

          return (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 2 }}>
              <Card
                onClick={() => {
                  if (stat.kind === "choice") {
                    setSearchTerm("")
                    setDebouncedSearch("")
                    setChoiceConfirmationFilter(stat.filter as ChoiceConfirmationFilter)
                    setStatusFilter("all")
                  } else {
                    setStatusFilter(stat.filter)
                    setChoiceConfirmationFilter("all")
                  }
                  setPage(0)
                }}
                sx={{
                  background: isActive
                    ? stat.kind === "choice" && stat.filter === "flagged"
                      ? "linear-gradient(135deg, #00695C 0%, #00796B 100%)"
                      : "linear-gradient(135deg, #0a004a 0%, #0D0060 100%)"
                    : stat.kind === "choice" && stat.filter === "confirmed"
                      ? "linear-gradient(135deg, #6A1B9A 0%, #7B1FA2 100%)"
                      : stat.kind === "choice" && stat.filter === "flagged"
                        ? "linear-gradient(135deg, #00695C 0%, #00897B 100%)"
                        : "linear-gradient(135deg, #0D0060 0%, #0D0060 100%)",
                  cursor: "pointer",
                  outline: isActive ? "2px solid #5ba3f5" : "none",
                  transition: "all 0.15s",
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
      {activeChoiceFilterLabel && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {activeChoiceFilterLabel}
          {choiceConfirmationFilter === "confirmed" && totalCount === 0 && (
            <> — No confirmed applications match your filters. If applicants have confirmed in the portal, run{" "}
              <code>python manage.py ensure_program_choice_confirmation_columns</code> on the server, then refresh.</>
          )}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 960 }}>
        The choice summary cards use the same search, status, batch, campus, and date filters as the table
        (excluding the &quot;Programme choices&quot; dropdown). If a number looks wrong, click Clear Filters or
        widen the date range. Purple status = applicant has confirmed programme choices in the portal (use this to track responses to your verification emails).
        Click &quot;Choices confirmed&quot; to list only that cohort. Teal &quot;Verify choices&quot; = not confirmed yet and programme IDs may still be from the bad migration (teal is used here so it is not confused with under review, which is orange).
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth size="small"
              placeholder="Search name, email, programme, faculty..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
              onKeyDown={(e) => { if (e.key === "Enter") handleApplyFilters() }}
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
                <MenuItem value="revoked">Revoked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Programme choices</InputLabel>
              <Select
                value={choiceConfirmationFilter}
                label="Programme choices"
                onChange={(e) => {
                  const value = e.target.value as ChoiceConfirmationFilter
                  if (value !== "all") {
                    setSearchTerm("")
                    setDebouncedSearch("")
                  }
                  setChoiceConfirmationFilter(value)
                  setStatusFilter("all")
                  setPage(0)
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="awaiting">Awaiting confirmation</MenuItem>
                <MenuItem value="confirmed">Choices confirmed (purple)</MenuItem>
                <MenuItem value="flagged">Flagged programme data (teal)</MenuItem>
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
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date From"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0) }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date To"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0) }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                fullWidth
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                fullWidth
              >
                Clear Filters
              </Button>
            </Stack>
          </Grid>
          {selected.length > 0 && (
            <Grid size={{ xs: 12, sm: 12 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Tooltip title="Select all matching the current filters">
                  <Button size="small" variant="outlined" onClick={selectAllFiltered} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                    Select all on page ({applications.length})
                  </Button>
                </Tooltip>
                <Button size="small" onClick={clearSelection} sx={{ textTransform: "none", fontSize: "0.75rem", color: "#c0001a" }}>
                  Clear
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
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
                    <TableRow
                      key={app.id} hover
                      selected={selected.includes(app.id)}
                      sx={{
                        "&:hover": { backgroundColor: "#fafafa" },
                        bgcolor: isProgramChoicesConfirmed(app)
                          ? "rgba(123,31,162,0.08)"
                          : hasSuspectProgramChoices(app) && !isProgramChoicesConfirmed(app)
                            ? "rgba(0,121,107,0.07)"
                            : (app.status || "").toLowerCase() === "admitted"
                              ? "rgba(46,125,50,0.04)"
                              : "inherit",
                      }}
                    >
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
                        {renderStatusChip(app)}
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
                      <Alert severity="info">
                        No applications match your filters.
                        {debouncedSearch || searchTerm.trim() ? (
                          <> Try <strong>Clear Filters</strong> or wait a moment after typing (search updates automatically).</>
                        ) : choiceConfirmationFilter !== "all" && totalCount > 0 ? (
                          <> Pagination is catching up — wait a moment or click <strong>Clear Filters</strong> and select the card again.</>
                        ) : choiceConfirmationFilter !== "all" ? (
                          <> Click <strong>Clear Filters</strong>, then <strong>Flagged data</strong> or <strong>Choices confirmed</strong>.</>
                        ) : null}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component="div"
            count={totalCount}           // ← Use total from backend
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        selectedIds={selected.length > 0 ? selected : undefined}
        batches={allBatches}
        academicLevels={allAcademicLevels}
        context="applicant"
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
