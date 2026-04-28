"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, TextField, Chip, TablePagination, Button, Alert,
  Card, CardContent, Grid, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Typography, Checkbox,
} from "@mui/material"
import {
  Search as SearchIcon, Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Schedule as ScheduleIcon, Add as AddIcon, Campaign as CampaignIcon,
} from "@mui/icons-material"
import { Link, useNavigate } from "react-router-dom"
import useAxios from "../../../AxiosInstance/UseAxios"
import AnnouncementDialog from "../../../ReUsables/AnnouncementDialog"

interface Application {
  id: number
  first_name: string
  last_name: string
  gender: string
  status: "submitted" | "accepted" | "rejected" | "under_review"
  created_at: string
  email: string
  programs: { id: number; name: string }[]
  academic_level: string
}

const statusConfig: Record<
  Application["status"],
  { color: "default" | "info" | "warning" | "success" | "error"; icon: React.ReactElement }
> = {
  submitted: { color: "info", icon: <ScheduleIcon fontSize="small" /> },
  under_review: { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
  accepted: { color: "success", icon: <CheckCircleIcon fontSize="small" /> },
  rejected: { color: "error", icon: <CancelIcon fontSize="small" /> },
}

const getStatusLabel = (status: Application["status"]) => {
  switch (status) {
    case "accepted":
      return "Approved"
    case "under_review":
      return "Under Review"
    default:
      return status.replace("_", " ")
  }
}

export default function DirectEntryList() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [academicLevelFilter, setAcademicLevelFilter] = useState<string>("all")
  const [selected, setSelected] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await AxiosInstance.get("/api/admissions/direct_entry_applications")
        setApplications(res.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load applications")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [AxiosInstance])

  const allAcademicLevels = useMemo(() => {
    return [...new Set(applications.map(a => a.academic_level).filter(Boolean))]
  }, [applications])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      const matchesLevel = academicLevelFilter === "all" || app.academic_level === academicLevelFilter
      return matchesSearch && matchesStatus && matchesLevel
    })
  }, [applications, searchTerm, statusFilter, academicLevelFilter])

  const paginatedApplications = filteredApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total", value: filteredApplications.length },
          { label: "Approved", value: filteredApplications.filter((a) => a.status === "accepted").length },
          { label: "Under Review", value: filteredApplications.filter((a) => a.status === "under_review").length },
          { label: "Rejected", value: filteredApplications.filter((a) => a.status === "rejected").length },
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: "linear-gradient(135deg, #000080 0%, #000066 100%)" }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "white", opacity: 0.85 }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
              slotProps={{ input: { startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ) } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="accepted">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Academic Level</InputLabel>
              <Select
                value={academicLevelFilter}
                label="Academic Level"
                onChange={(e) => { setAcademicLevelFilter(e.target.value); setPage(0) }}
              >
                <MenuItem value="all">All Levels</MenuItem>
                {allAcademicLevels.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
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
                      indeterminate={paginatedApplications.some(a => selected.includes(a.id)) && !paginatedApplications.every(a => selected.includes(a.id))}
                      checked={paginatedApplications.length > 0 && paginatedApplications.every(a => selected.includes(a.id))}
                      onChange={() => {
                        const ids = paginatedApplications.map(a => a.id)
                        const allSelected = ids.every(id => selected.includes(id))
                        allSelected ? setSelected(p => p.filter(id => !ids.includes(id))) : setSelected(p => [...new Set([...p, ...ids])])
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Program(s)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedApplications.length > 0 ? (
                  paginatedApplications.map((app, idx) => (
                    <TableRow key={app.id} hover selected={selected.includes(app.id)} sx={{ "&:hover": { backgroundColor: "#fafafa" } }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(app.id)} onChange={() => setSelected(p => p.includes(app.id) ? p.filter(x => x !== app.id) : [...p, app.id])} />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{app.first_name} {app.last_name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#555" }}>{app.email}</TableCell>
                      <TableCell>{app.gender}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>
                        {app.programs.map(p => p.name).join(", ") || "—"}
                      </TableCell>
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
                        <Button
                          component={Link}
                          to={`/admin/application_review/${app.id}`}
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          sx={{
                            textTransform: "none",
                            borderColor: "#000080",
                            color: "#000080",
                            "&:hover": { bgcolor: "#000080", color: "white" },
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
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

      <AnnouncementDialog
        open={dialogOpen} onClose={() => setDialogOpen(false)}
        selectedIds={selected.length > 0 ? selected : undefined}
        context="direct entry applicant"
      />
    </Box>
  )
}
