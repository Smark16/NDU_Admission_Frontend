"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Alert, TextField, InputAdornment, Button, Tooltip, Grid,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TablePagination,
} from "@mui/material"
import {
  Search as SearchIcon,
  Send as SendIcon,
  PersonSearch as PersonSearchIcon,
  People as PeopleIcon,
  EditNote as DraftIcon,
  PersonOff as NeverIcon,
  FileDownload as DownloadIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import AnnouncementDialog from "../../ReUsables/AnnouncementDialog"

interface ProspectiveStudent {
  id: number
  name: string
  email: string
  phone: string | null
  date_joined: string
  last_login: string | null
  status: "Draft Started" | "Never Started"
  draft_started_at: string | null
  days_since_joined: number | null
}

interface ProspectiveStats {
  total: number
  draft_started: number
  never_started: number
}

const SEARCH_DEBOUNCE_MS = 350
const EXPORT_PAGE_SIZE = 200

export default function ProspectiveStudents() {
  const AxiosInstance = useAxios()

  const [students, setStudents] = useState<ProspectiveStudent[]>([])
  const [stats, setStats] = useState<ProspectiveStats>({ total: 0, draft_started: 0, never_started: 0 })
  const [filteredCount, setFilteredCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "Draft Started" | "Never Started">("all")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [reminderSent, setReminderSent] = useState<number[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [annStatusFilter, setAnnStatusFilter] = useState("all")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, statusFilter, dateFrom, dateTo, rowsPerPage])

  const listParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: page + 1,
      page_size: rowsPerPage,
    }
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    if (statusFilter !== "all") params.status = statusFilter
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    return params
  }, [page, rowsPerPage, debouncedSearch, statusFilter, dateFrom, dateTo])

  useEffect(() => {
    let cancelled = false
    const fetchStudents = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await AxiosInstance.get("/api/accounts/prospective_students", { params: listParams })
        if (cancelled) return
        setStudents(data.results ?? [])
        setFilteredCount(data.count ?? 0)
        if (data.stats) setStats(data.stats)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || "Failed to load prospective students.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void fetchStudents()
    return () => {
      cancelled = true
    }
  }, [AxiosInstance, listParams])

  const sendReminder = async (id: number, email: string) => {
    setSendingId(id)
    try {
      await AxiosInstance.post(`/api/accounts/send_reminder/${id}/`)
      setReminderSent((prev) => [...prev, id])
    } catch {
      alert(`Failed to send reminder to ${email}.`)
    } finally {
      setSendingId(null)
    }
  }

  const handleDelete = async () => {
    if (confirmDeleteId === null) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await AxiosInstance.delete(`/api/accounts/delete_prospective/${confirmDeleteId}/`)
      setStudents((prev) => prev.filter((s) => s.id !== confirmDeleteId))
      setFilteredCount((prev) => Math.max(0, prev - 1))
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        draft_started: Math.max(
          0,
          prev.draft_started - (students.find((s) => s.id === confirmDeleteId)?.status === "Draft Started" ? 1 : 0)
        ),
        never_started: Math.max(
          0,
          prev.never_started - (students.find((s) => s.id === confirmDeleteId)?.status === "Never Started" ? 1 : 0)
        ),
      }))
      setConfirmDeleteId(null)
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || "Failed to delete.")
    } finally {
      setDeleting(false)
    }
  }

  const exportCSV = useCallback(async () => {
    setExporting(true)
    try {
      const baseParams: Record<string, string | number> = { page_size: EXPORT_PAGE_SIZE }
      if (debouncedSearch.trim()) baseParams.search = debouncedSearch.trim()
      if (statusFilter !== "all") baseParams.status = statusFilter
      if (dateFrom) baseParams.date_from = dateFrom
      if (dateTo) baseParams.date_to = dateTo

      let pageNum = 1
      let rows: ProspectiveStudent[] = []
      while (true) {
        const { data } = await AxiosInstance.get("/api/accounts/prospective_students", {
          params: { ...baseParams, page: pageNum },
        })
        rows = rows.concat(data.results ?? [])
        if (rows.length >= (data.count ?? 0) || !(data.results?.length)) break
        pageNum += 1
      }

      const headers = ["Name", "Email", "Phone", "Registered", "Last Login", "Days Since Joined", "Status"]
      const csvRows = rows.map((s) => [
        s.name,
        s.email,
        s.phone || "",
        s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "",
        s.last_login ? new Date(s.last_login).toLocaleDateString() : "Never",
        s.days_since_joined !== null ? s.days_since_joined : "",
        s.status,
      ])
      const csv = [headers, ...csvRows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `prospective_students_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }, [AxiosInstance, debouncedSearch, statusFilter, dateFrom, dateTo])

  const maxPage = Math.max(0, Math.ceil(filteredCount / rowsPerPage) - 1)
  const safePage = Math.min(page, maxPage)

  useEffect(() => {
    if (page > maxPage) setPage(maxPage)
  }, [page, maxPage])

  if (loading && students.length === 0 && !error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: "#7c1519" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <PersonSearchIcon sx={{ fontSize: 32, color: "#7c1519" }} />
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1a3a52">
            Prospective Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Applicants who registered but have not yet submitted an application
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ border: "1px solid #e0eef7" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#7c151915", color: "#7c1519" }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#7c1519">{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total Prospective</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ border: "1px solid #e0eef7" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#1565c015", color: "#1565c0" }}>
                <DraftIcon />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#1565c0">{stats.draft_started}</Typography>
                <Typography variant="caption" color="text.secondary">Draft Started</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ border: "1px solid #e0eef7" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#e65100" + "15", color: "#e65100" }}>
                <NeverIcon />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#e65100">{stats.never_started}</Typography>
                <Typography variant="caption" color="text.secondary">Never Started</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters + Export */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 280 }}
        />
        {(["all", "Draft Started", "Never Started"] as const).map((f) => (
          <Chip
            key={f}
            label={f === "all" ? "All" : f}
            onClick={() => setStatusFilter(f)}
            color={statusFilter === f ? "primary" : "default"}
            variant={statusFilter === f ? "filled" : "outlined"}
            sx={{ cursor: "pointer" }}
          />
        ))}
        <TextField
          size="small"
          label="Registered from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 170 }}
        />
        <TextField
          size="small"
          label="Registered to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 170 }}
        />
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CampaignIcon />}
            onClick={() => setAnnouncementOpen(true)}
            disabled={stats.total === 0}
            sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060" }}
          >
            Send Communication
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => void exportCSV()}
            disabled={filteredCount === 0 || exporting}
            sx={{ textTransform: "none", borderColor: "#7c1519", color: "#7c1519" }}
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ border: "1px solid #e0eef7", borderRadius: 2, position: "relative" }}>
        {loading && students.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <CircularProgress size={32} sx={{ color: "#7c1519" }} />
          </Box>
        )}
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f7fa" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Registered</strong></TableCell>
              <TableCell><strong>Last Login</strong></TableCell>
              <TableCell><strong>Draft Saved</strong></TableCell>
              <TableCell><strong>Days Since Joined</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Reminder</strong></TableCell>
              <TableCell><strong>Delete</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 5, color: "text.secondary" }}>
                  No prospective students found.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.name || "—"}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {s.last_login ? new Date(s.last_login).toLocaleDateString() : "Never"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {s.status === "Draft Started" && s.draft_started_at
                        ? new Date(s.draft_started_at).toLocaleString()
                        : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={s.days_since_joined !== null ? `${s.days_since_joined}d` : "—"}
                      color={
                        s.days_since_joined !== null && s.days_since_joined > 14
                          ? "error"
                          : s.days_since_joined !== null && s.days_since_joined > 7
                          ? "warning"
                          : "success"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={s.status}
                      color={s.status === "Draft Started" ? "info" : "warning"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={reminderSent.includes(s.id) ? "Reminder already sent" : `Send reminder to ${s.email}`}>
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            sendingId === s.id
                              ? <CircularProgress size={14} />
                              : <SendIcon fontSize="small" />
                          }
                          disabled={sendingId === s.id || reminderSent.includes(s.id)}
                          onClick={() => sendReminder(s.id, s.email)}
                          sx={{
                            borderColor: reminderSent.includes(s.id) ? "success.main" : "#7c1519",
                            color: reminderSent.includes(s.id) ? "success.main" : "#7c1519",
                            fontSize: "0.7rem",
                          }}
                        >
                          {reminderSent.includes(s.id) ? "Sent" : "Remind"}
                        </Button>
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete this prospective student">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => setConfirmDeleteId(s.id)}
                        sx={{ fontSize: "0.7rem" }}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={filteredCount}
          rowsPerPage={rowsPerPage}
          page={safePage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          sx={{ borderTop: "1px solid #e0eef7" }}
        />
      </TableContainer>

      {/* Send Communication */}
      <AnnouncementDialog
        open={announcementOpen}
        onClose={() => { setAnnouncementOpen(false); setAnnStatusFilter("all") }}
        endpoint="/api/accounts/prospective_announcement"
        context="prospective students"
        extraPayload={{ status: annStatusFilter }}
        extraFilters={
          <FormControl fullWidth size="small">
            <InputLabel>Target Group</InputLabel>
            <Select
              value={annStatusFilter}
              label="Target Group"
              onChange={e => setAnnStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Prospective Students</MenuItem>
              <MenuItem value="Draft Started">Draft Started only</MenuItem>
              <MenuItem value="Never Started">Never Started only</MenuItem>
            </Select>
          </FormControl>
        }
      />

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDeleteId !== null} onClose={() => !deleting && setConfirmDeleteId(null)}>
        <DialogTitle>Delete Prospective Student?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the account. This cannot be undone.
            Only accounts with no submitted application can be deleted.
          </DialogContentText>
          {deleteError && <Alert severity="error" sx={{ mt: 1 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <DeleteIcon />}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
