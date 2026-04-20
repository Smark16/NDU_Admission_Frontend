"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box, Card, CardContent, Grid, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, TablePagination, InputAdornment,
  CircularProgress, Alert, Button, Stack,
} from "@mui/material"
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  PeopleAlt as PeopleIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

const NAVY = "#000080"
const NAVY_DARK = "#000066"

interface Applicant {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: string
  academic_level: string
  batch: string
  campus: string
  programs: string
  status: string
  created_at: string
  is_direct_entry: boolean
}

const statusConfig: Record<string, { color: "default" | "info" | "warning" | "success" | "error" }> = {
  submitted:    { color: "info" },
  under_review: { color: "warning" },
  accepted:     { color: "success" },
  rejected:     { color: "error" },
  draft:        { color: "default" },
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
  <Card sx={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, color: "#fff", height: "100%" }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={800}>{value}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{label}</Typography>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" }}>
          <Icon sx={{ fontSize: 28 }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export default function AllApplicantsReport() {
  const AxiosInstance = useAxios()
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [batchFilter, setBatchFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [campusFilter, setCampusFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [entryFilter, setEntryFilter] = useState("all")

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const { data } = await AxiosInstance.get("/api/admissions/all_applications_report")
        setApplicants(data)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load report data")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [AxiosInstance])

  // Unique dropdown options derived from data
  const batches = useMemo(() => [...new Set(applicants.map(a => a.batch).filter(Boolean))], [applicants])
  const levels = useMemo(() => [...new Set(applicants.map(a => a.academic_level).filter(Boolean))], [applicants])
  const campuses = useMemo(() => [...new Set(applicants.map(a => a.campus).filter(Boolean))], [applicants])

  const filtered = useMemo(() => {
    return applicants.filter(a => {
      const name = `${a.first_name} ${a.last_name}`.toLowerCase()
      return (
        (search === "" || name.includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())) &&
        (batchFilter === "all" || a.batch === batchFilter) &&
        (levelFilter === "all" || a.academic_level === levelFilter) &&
        (campusFilter === "all" || a.campus === campusFilter) &&
        (statusFilter === "all" || a.status === statusFilter) &&
        (genderFilter === "all" || a.gender === genderFilter) &&
        (entryFilter === "all" || (entryFilter === "direct" ? a.is_direct_entry : !a.is_direct_entry))
      )
    })
  }, [applicants, search, batchFilter, levelFilter, campusFilter, statusFilter, genderFilter, entryFilter])

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const stats = useMemo(() => ({
    total: filtered.length,
    submitted: filtered.filter(a => a.status === "submitted" || a.status === "under_review").length,
    accepted: filtered.filter(a => a.status === "accepted").length,
    rejected: filtered.filter(a => a.status === "rejected").length,
    direct: filtered.filter(a => a.is_direct_entry).length,
  }), [filtered])

  const resetFilters = () => {
    setSearch(""); setBatchFilter("all"); setLevelFilter("all")
    setCampusFilter("all"); setStatusFilter("all"); setGenderFilter("all"); setEntryFilter("all")
    setPage(0)
  }

  const exportCSV = () => {
    const headers = ["#", "Name", "Email", "Gender", "Academic Level", "Batch", "Campus", "Program(s)", "Status", "Entry Type", "Date Applied"]
    const rows = filtered.map((a, i) => [
      i + 1, `${a.first_name} ${a.last_name}`, a.email, a.gender,
      a.academic_level, a.batch, a.campus, a.programs,
      a.status, a.is_direct_entry ? "Direct Entry" : "Online", new Date(a.created_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `all_applicants_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const FilterSelect = ({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: string[]
  }) => (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={e => { onChange(e.target.value); setPage(0) }}>
        <MenuItem value="all">All {label}s</MenuItem>
        {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  )

  return (
    <Box sx={{ p: 3, background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color={NAVY}>All Applicants Report</Typography>
          <Typography variant="body2" color="text.secondary">
            Full view of all applications across all intakes — use filters to narrow down
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportCSV}
          disabled={filtered.length === 0}
          sx={{ background: NAVY, "&:hover": { background: NAVY_DARK }, textTransform: "none", fontWeight: 700 }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Total Applicants" value={stats.total} icon={PeopleIcon} color={NAVY} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Pending / In Review" value={stats.submitted} icon={PendingIcon} color="#f57c00" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Admitted" value={stats.accepted} icon={CheckCircleIcon} color="#388e3c" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Rejected" value={stats.rejected} icon={CancelIcon} color="#c62828" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Direct Entry" value={stats.direct} icon={ScheduleIcon} color="#6a1b9a" />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth size="small" placeholder="Search by name or email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#aaa" }} /></InputAdornment> }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FilterSelect label="Intake" value={batchFilter} onChange={setBatchFilter} options={batches} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FilterSelect label="Academic Level" value={levelFilter} onChange={setLevelFilter} options={levels} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FilterSelect label="Campus" value={campusFilter} onChange={setCampusFilter} options={campuses} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select value={genderFilter} label="Gender" onChange={e => { setGenderFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Entry Type</InputLabel>
              <Select value={entryFilter} label="Entry Type" onChange={e => { setEntryFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="direct">Direct Entry</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active filter summary */}
        {[search, batchFilter, levelFilter, campusFilter, statusFilter, genderFilter, entryFilter].some(v => v !== "" && v !== "all") && (
          <Stack direction="row" spacing={1} mt={2} alignItems="center" flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">Active filters:</Typography>
            {search && <Chip size="small" label={`"${search}"`} onDelete={() => setSearch("")} />}
            {batchFilter !== "all" && <Chip size="small" label={`Intake: ${batchFilter}`} onDelete={() => setBatchFilter("all")} />}
            {levelFilter !== "all" && <Chip size="small" label={`Level: ${levelFilter}`} onDelete={() => setLevelFilter("all")} />}
            {campusFilter !== "all" && <Chip size="small" label={`Campus: ${campusFilter}`} onDelete={() => setCampusFilter("all")} />}
            {statusFilter !== "all" && <Chip size="small" label={`Status: ${statusFilter}`} onDelete={() => setStatusFilter("all")} />}
            {genderFilter !== "all" && <Chip size="small" label={`Gender: ${genderFilter}`} onDelete={() => setGenderFilter("all")} />}
            {entryFilter !== "all" && <Chip size="small" label={`Entry: ${entryFilter}`} onDelete={() => setEntryFilter("all")} />}
            <Chip size="small" label="Clear all" onClick={resetFilters} sx={{ backgroundColor: "#c0001a", color: "#fff" }} />
          </Stack>
        )}
      </Paper>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: NAVY }} /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ backgroundColor: NAVY }}>
                <TableRow>
                  {["#", "Name", "Gender", "Academic Level", "Intake", "Campus", "Program(s)", "Status", "Entry", "Date"].map(h => (
                    <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length > 0 ? paginated.map((a, idx) => (
                  <TableRow key={a.id} hover sx={{ "&:hover": { backgroundColor: "#f0f4ff" } }}>
                    <TableCell sx={{ color: "#888", fontSize: "0.8rem" }}>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600} fontSize="0.875rem">{a.first_name} {a.last_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem" }}>{a.gender}</TableCell>
                    <TableCell sx={{ fontSize: "0.875rem" }}>{a.academic_level}</TableCell>
                    <TableCell sx={{ fontSize: "0.875rem" }}>{a.batch}</TableCell>
                    <TableCell sx={{ fontSize: "0.875rem" }}>{a.campus}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", maxWidth: 180 }}>{a.programs || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.status.replace("_", " ")}
                        color={statusConfig[a.status]?.color ?? "default"}
                        size="small"
                        sx={{ textTransform: "capitalize", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={a.is_direct_entry ? "Direct" : "Online"}
                        size="small"
                        sx={{
                          backgroundColor: a.is_direct_entry ? "#ede7f6" : "#e3f2fd",
                          color: a.is_direct_entry ? "#6a1b9a" : "#1565c0",
                          fontWeight: 600, fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <Alert severity="info">No applicants match your filters.</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 15, 25, 50, 100]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            sx={{ backgroundColor: "#fff", borderRadius: "0 0 8px 8px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
          />
        </>
      )}
    </Box>
  )
}
