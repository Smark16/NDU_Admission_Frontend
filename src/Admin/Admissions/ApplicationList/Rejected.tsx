"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, TextField, Chip, TablePagination, Button, Alert,
  Grid, InputAdornment, CircularProgress, Typography, Checkbox, Tooltip,
} from "@mui/material"
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import useAxios from "../../../AxiosInstance/UseAxios"
import AnnouncementDialog from "../../../ReUsables/AnnouncementDialog"

interface Application {
  id: number
  first_name: string
  last_name: string
  gender: string
  status: "rejected"
  created_at: string
  email: string
}

const statusConfig: Record<Application["status"], { color: "error"; icon: React.ReactElement }> = {
  rejected: { color: "error", icon: <CancelIcon fontSize="small" /> },
}

export default function RejectedList() {
  const AxiosInstance = useAxios()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")

  const [selected, setSelected] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true); setError(null)
        const res = await AxiosInstance.get("/api/admissions/rejected_applications")
        setApplications(res.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load applications")
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [AxiosInstance])

  const filteredApplications = useMemo(() => applications.filter(app =>
    `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [applications, searchTerm])

  const paginatedApplications = filteredApplications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  const allPageIds = paginatedApplications.map(a => a.id)
  const allPageSelected = allPageIds.length > 0 && allPageIds.every(id => selected.includes(id))
  const somePageSelected = allPageIds.some(id => selected.includes(id))
  const toggleSelectAll = () => allPageSelected
    ? setSelected(prev => prev.filter(id => !allPageIds.includes(id)))
    : setSelected(prev => [...new Set([...prev, ...allPageIds])])
  const toggleOne = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <Box sx={{ p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#0D0060", fontWeight: "bold" }}>Rejected Applications</Typography>
          <Typography variant="body2" color="text.secondary">Manage and review all rejected applications</Typography>
        </Box>
        <Button
          variant="contained" startIcon={<CampaignIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "#0D0060", "&:hover": { bgcolor: "#0a004a" }, textTransform: "none", fontWeight: 700 }}
        >
          {selected.length > 0 ? `Send to ${selected.length} selected` : "Send Communication"}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth size="small" placeholder="Search by name or email..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#999" }} /></InputAdornment> } }}
            />
          </Grid>
          {selected.length > 0 && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Select all in current filter">
                  <Button size="small" variant="outlined" onClick={() => setSelected(filteredApplications.map(a => a.id))} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                    Select all {filteredApplications.length}
                  </Button>
                </Tooltip>
                <Button size="small" onClick={() => setSelected([])} sx={{ textTransform: "none", fontSize: "0.75rem", color: "#c0001a" }}>Clear</Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

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
                    <Checkbox indeterminate={somePageSelected && !allPageSelected} checked={allPageSelected} onChange={toggleSelectAll} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
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
                        <Checkbox checked={selected.includes(app.id)} onChange={() => toggleOne(app.id)} />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{app.first_name} {app.last_name}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem", color: "#555" }}>{app.email}</TableCell>
                      <TableCell>{app.gender}</TableCell>
                      <TableCell>
                        <Chip label={app.status.replace("_", " ")} color={statusConfig[app.status]?.color} icon={statusConfig[app.status]?.icon} size="small" sx={{ minWidth: 100 }} />
                      </TableCell>
                      <TableCell>{formatDate(app.created_at)}</TableCell>
                      <TableCell align="center">
                        <Button
                          component={Link} to={`/admin/application_review/${app.id}`}
                          variant="outlined" size="small" startIcon={<VisibilityIcon />}
                          sx={{ textTransform: "none", borderColor: "#1976d2", color: "#1976d2", "&:hover": { bgcolor: "#1976d2", color: "white" } }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Alert severity="info">No applications match your filters.</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]} component="div"
            count={filteredApplications.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ backgroundColor: "white", borderRadius: "0 0 8px 8px", boxShadow: 3 }}
          />
        </>
      )}

      <AnnouncementDialog
        open={dialogOpen} onClose={() => setDialogOpen(false)}
        selectedIds={selected.length > 0 ? selected : undefined}
        context="rejected applicant"
      />
    </Box>
  )
}
