"use client"

import { useEffect, useState } from "react"
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Alert, TextField, InputAdornment, Button, Tooltip, Grid,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
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
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

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

export default function ProspectiveStudents() {
  const AxiosInstance = useAxios()

  const [students, setStudents] = useState<ProspectiveStudent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "Draft Started" | "Never Started">("all")
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [reminderSent, setReminderSent] = useState<number[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/accounts/prospective_students")
        setStudents(data.results)
        setTotal(data.count)
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load prospective students.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

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
      setTotal((prev) => prev - 1)
      setConfirmDeleteId(null)
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || "Failed to delete.")
    } finally {
      setDeleting(false)
    }
  }

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Registered", "Last Login", "Days Since Joined", "Status"]
    const rows = filtered.map((s) => [
      s.name,
      s.email,
      s.phone || "",
      s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "",
      s.last_login ? new Date(s.last_login).toLocaleDateString() : "Never",
      s.days_since_joined !== null ? s.days_since_joined : "",
      s.status,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prospective_students_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || "").includes(search)
    const matchStatus = statusFilter === "all" || s.status === statusFilter
    const joined = s.date_joined ? new Date(s.date_joined) : null
    const matchFrom = !dateFrom || (joined !== null && joined >= new Date(dateFrom))
    const matchTo = !dateTo || (joined !== null && joined <= new Date(dateTo + "T23:59:59"))
    return matchSearch && matchStatus && matchFrom && matchTo
  })

  const draftCount = students.filter((s) => s.status === "Draft Started").length
  const neverCount = students.filter((s) => s.status === "Never Started").length

  if (loading) {
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
                <Typography variant="h4" fontWeight={700} color="#7c1519">{total}</Typography>
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
                <Typography variant="h4" fontWeight={700} color="#1565c0">{draftCount}</Typography>
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
                <Typography variant="h4" fontWeight={700} color="#e65100">{neverCount}</Typography>
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
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportCSV}
          disabled={filtered.length === 0}
          sx={{ ml: "auto", textTransform: "none", borderColor: "#7c1519", color: "#7c1519" }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Table */}
      <TableContainer sx={{ border: "1px solid #e0eef7", borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f7fa" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Registered</strong></TableCell>
              <TableCell><strong>Last Login</strong></TableCell>
              <TableCell><strong>Days Since Joined</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Reminder</strong></TableCell>
              <TableCell><strong>Delete</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5, color: "text.secondary" }}>
                  No prospective students found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
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
      </TableContainer>

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
