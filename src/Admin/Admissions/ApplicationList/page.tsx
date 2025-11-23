"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Chip,
  TablePagination,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
} from "@mui/material"
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material"
import {Link} from "react-router-dom"
import useAxios from "../../../AxiosInstance/UseAxios"

interface Application {
  id: number
  first_name: string
  last_name: string
  gender: string
  status: "submitted" | "accepted" | "rejected" | "under_review"
  created_at: string
  email: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Status → Chip config (icon is now a ReactElement)
const statusConfig: Record<
  Application["status"],
  { color: "default" | "info" | "warning" | "success" | "error"; icon: React.ReactElement }
> = {
  submitted: { color: "info", icon: <ScheduleIcon fontSize="small" /> },
  under_review: { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
  accepted: { color: "success", icon: <CheckCircleIcon fontSize="small" /> },
  rejected: { color: "error", icon: <CancelIcon fontSize="small" /> },
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ApplicationList() {
  const AxiosInstance = useAxios()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all") // default = show all

  // ───── FETCH APPLICATIONS ON MOUNT ─────
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await AxiosInstance.get("/api/admissions/applications")
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

  // ───── FILTERED + PAGINATED DATA ─────
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, searchTerm, statusFilter])

  const paginatedApplications = filteredApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // ───── PAGINATION HANDLERS ─────
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  // ───── DATE FORMATTER ─────
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  // ───── RENDER ─────
  return (
    <Box sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: "bold" }}>
          Applications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and review all student applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total", value: filteredApplications.length, gradient: "667eea,764ba2" },
          {
            label: "Accepted",
            value: filteredApplications.filter((a) => a.status === "accepted").length,
            gradient: "f093fb,f5576c",
          },
          {
            label: "Under Review",
            value: filteredApplications.filter((a) => a.status === "under_review").length,
            gradient: "4facfe,00f2fe",
          },
          {
            label: "Rejected",
            value: filteredApplications.filter((a) => a.status === "rejected").length,
            gradient: "fa709a,fee140",
          },
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: `linear-gradient(135deg, #${stat.gradient.split(",")[0]} 0%, #${stat.gradient.split(",")[1]} 100%)`,
              }}
            >
              <CardContent>
                <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "white", opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(0)
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading / Error / Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, mb: 1 }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead sx={{ backgroundColor: "#f5f7fa" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedApplications.length > 0 ? (
                  paginatedApplications.map((app, idx) => (
                    <TableRow
                      key={app.id}
                      hover
                      sx={{ "&:hover": { backgroundColor: "#fafafa" } }}
                    >
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {app.first_name} {app.last_name}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#555" }}>
                        {app.email}
                      </TableCell>
                      <TableCell>{app.gender}</TableCell>
                      <TableCell>
                        <Chip
                          label={app.status.replace("_", " ")}
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
                            borderColor: "#1976d2",
                            color: "#1976d2",
                            "&:hover": { bgcolor: "#1976d2", color: "white" },
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Alert severity="info">No applications match your filters.</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
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
    </Box>
  )
}