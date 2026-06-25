// "use client"

// import { useEffect, useMemo, useState } from "react"
// import {
//   Box, Card, CardContent, Grid, Typography, TextField, Select, MenuItem,
//   FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Chip, TablePagination, InputAdornment,
//   CircularProgress, Alert, Button, Stack, Autocomplete,
// } from "@mui/material"
// import {
//   Search as SearchIcon,
//   FileDownload as DownloadIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   Schedule as ScheduleIcon,
//   PeopleAlt as PeopleIcon,
//   HourglassEmpty as PendingIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   FilterList as FilterIcon,
// } from "@mui/icons-material"
// import { Collapse } from "@mui/material"
// import useAxios from "../../AxiosInstance/UseAxios"

// const NAVY = "#000080"
// const NAVY_DARK = "#000066"

// interface Applicant {
//   id: number
//   first_name: string
//   last_name: string
//   email: string
//   gender: string
//   academic_level: string
//   batch: string
//   campus: string
//   programs: string
//   faculty: string
//   status: string
//   created_at: string
//   is_direct_entry: boolean
//   entered_by: string
// }

// const statusConfig: Record<string, { color: "default" | "info" | "warning" | "success" | "error" }> = {
//   submitted:    { color: "info" },
//   under_review: { color: "warning" },
//   accepted:     { color: "success" },
//   rejected:     { color: "error" },
//   draft:        { color: "default" },
// }

// const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
//   <Card sx={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, color: "#fff", height: "100%" }}>
//     <CardContent>
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Box>
//           <Typography variant="h4" fontWeight={800}>{value}</Typography>
//           <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{label}</Typography>
//         </Box>
//         <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" }}>
//           <Icon sx={{ fontSize: 28 }} />
//         </Box>
//       </Box>
//     </CardContent>
//   </Card>
// )

// export default function AllApplicantsReport() {
//   const AxiosInstance = useAxios()
//   const [applicants, setApplicants] = useState<Applicant[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const [search, setSearch] = useState("")
//   const [batchFilter, setBatchFilter] = useState("all")
//   const [levelFilter, setLevelFilter] = useState("all")
//   const [campusFilter, setCampusFilter] = useState("all")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [genderFilter, setGenderFilter] = useState("all")
//   const [entryFilter, setEntryFilter] = useState("all")
//   const [facultyFilter, setFacultyFilter] = useState("all")
//   const [programSearch, setProgramSearch] = useState("")
//   const [dateFrom, setDateFrom] = useState("")
//   const [dateTo, setDateTo] = useState("")
//   const [showMoreFilters, setShowMoreFilters] = useState(false)

//   const [page, setPage] = useState(0)
//   const [rowsPerPage, setRowsPerPage] = useState(15)

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         setLoading(true)
//         const { data } = await AxiosInstance.get("/api/admissions/all_applications_report")
//         setApplicants(data.results)
//       } catch (err: any) {
//         setError(err.response?.data?.detail || "Failed to load report data")
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetch()
//   }, [AxiosInstance])

//   // Unique dropdown options derived from data
//   const batches = useMemo(() => [...new Set(applicants.map(a => a.batch).filter(Boolean))], [applicants])
//   const levels = useMemo(() => [...new Set(applicants.map(a => a.academic_level).filter(Boolean))], [applicants])
//   const campuses = useMemo(() => [...new Set(applicants.map(a => a.campus).filter(Boolean))], [applicants])
//   const faculties = useMemo(() => {
//     const all = applicants.flatMap(a => a.faculty ? a.faculty.split(", ") : [])
//     return [...new Set(all)].filter(Boolean).sort()
//   }, [applicants])

//   const programOptions = useMemo(() => {
//     const all = applicants.flatMap(a => a.programs ? a.programs.split(", ") : [])
//     return [...new Set(all)].filter(Boolean).sort()
//   }, [applicants])

//   const filtered = useMemo(() => {
//     return applicants.filter(a => {
//       const name = `${a.first_name} ${a.last_name}`.toLowerCase()
//       const appliedDate = new Date(a.created_at)
//       const from = dateFrom ? new Date(dateFrom) : null
//       const to = dateTo ? new Date(dateTo + "T23:59:59") : null
//       return (
//         (search === "" || name.includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())) &&
//         (batchFilter === "all" || a.batch === batchFilter) &&
//         (levelFilter === "all" || a.academic_level === levelFilter) &&
//         (campusFilter === "all" || a.campus === campusFilter) &&
//         (statusFilter === "all" || a.status === statusFilter) &&
//         (genderFilter === "all" || a.gender === genderFilter) &&
//         (entryFilter === "all" || (entryFilter === "direct" ? a.is_direct_entry : !a.is_direct_entry)) &&
//         (facultyFilter === "all" || (a.faculty || "").toLowerCase().includes(facultyFilter.toLowerCase())) &&
//         (programSearch === "" || (a.programs || "").toLowerCase().includes(programSearch.toLowerCase())) &&
//         (!from || appliedDate >= from) &&
//         (!to || appliedDate <= to)
//       )
//     })
//   }, [applicants, search, batchFilter, levelFilter, campusFilter, statusFilter, genderFilter, entryFilter, facultyFilter, programSearch, dateFrom, dateTo])

//   const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

//   const stats = useMemo(() => ({
//     total: filtered.length,
//     submitted: filtered.filter(a => a.status === "submitted" || a.status === "under_review").length,
//     admitted: filtered.filter(a => a.status === "admitted" || a.status === "Admitted").length,
//     rejected: filtered.filter(a => a.status === "rejected").length,
//     direct: filtered.filter(a => a.is_direct_entry).length,
//   }), [filtered])

//   const resetFilters = () => {
//     setSearch(""); setBatchFilter("all"); setLevelFilter("all")
//     setCampusFilter("all"); setStatusFilter("all"); setGenderFilter("all")
//     setEntryFilter("all"); setFacultyFilter("all"); setProgramSearch(""); setDateFrom(""); setDateTo("")
//     setPage(0)
//   }

//   const activeFilterCount = [
//     search, batchFilter !== "all" ? batchFilter : "",
//     levelFilter !== "all" ? levelFilter : "",
//     campusFilter !== "all" ? campusFilter : "",
//     statusFilter !== "all" ? statusFilter : "",
//     genderFilter !== "all" ? genderFilter : "",
//     entryFilter !== "all" ? entryFilter : "",
//     facultyFilter !== "all" ? facultyFilter : "",
//     programSearch, dateFrom, dateTo,
//   ].filter(Boolean).length

//   const exportCSV = () => {
//     const headers = ["#", "Name", "Email", "Gender", "Academic Level", "Faculty", "Batch", "Campus", "Program(s)", "Status", "Entered By", "Date Applied"]
//     const rows = filtered.map((a, i) => [
//       i + 1, `${a.first_name} ${a.last_name}`, a.email, a.gender,
//       a.academic_level, a.faculty || "", a.batch, a.campus, a.programs,
//       a.status, a.entered_by, new Date(a.created_at).toLocaleDateString()
//     ])
//     const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
//     const blob = new Blob([csv], { type: "text/csv" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a"); a.href = url
//     a.download = `all_applicants_${new Date().toISOString().slice(0, 10)}.csv`
//     a.click(); URL.revokeObjectURL(url)
//   }

//   const FilterSelect = ({ label, value, onChange, options }: {
//     label: string; value: string; onChange: (v: string) => void; options: string[]
//   }) => (
//     <FormControl fullWidth size="small">
//       <InputLabel>{label}</InputLabel>
//       <Select value={value} label={label} onChange={e => { onChange(e.target.value); setPage(0) }}>
//         <MenuItem value="all">All {label}s</MenuItem>
//         {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
//       </Select>
//     </FormControl>
//   )

//   return (
//     <Box sx={{ p: 3, background: "#f5f7fa", minHeight: "100vh" }}>
//       {/* Header */}
//       <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
//         <Box>
//           <Typography variant="h4" fontWeight={800} color={NAVY}>All Applicants Report</Typography>
//           <Typography variant="body2" color="text.secondary">
//             Full view of all applications across all intakes — use filters to narrow down
//           </Typography>
//         </Box>
//         <Button
//           variant="contained"
//           startIcon={<DownloadIcon />}
//           onClick={exportCSV}
//           disabled={filtered.length === 0}
//           sx={{ background: NAVY, "&:hover": { background: NAVY_DARK }, textTransform: "none", fontWeight: 700 }}
//         >
//           Export CSV
//         </Button>
//       </Box>

//       {/* Stat Cards */}
//       <Grid container spacing={2} mb={3}>
//         <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//           <StatCard label="Total Applicants" value={stats.total} icon={PeopleIcon} color={NAVY} />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//           <StatCard label="Pending / In Review" value={stats.submitted} icon={PendingIcon} color="#f57c00" />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//           <StatCard label="Admitted" value={stats.admitted} icon={CheckCircleIcon} color="#388e3c" />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//           <StatCard label="Rejected" value={stats.rejected} icon={CancelIcon} color="#c62828" />
//         </Grid>
//         <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
//           <StatCard label="Direct Entry" value={stats.direct} icon={ScheduleIcon} color="#6a1b9a" />
//         </Grid>
//       </Grid>

//       {/* Filters */}
//       <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>

//         {/* ── Row 1: always-visible filters ── */}
//         <Grid container spacing={2} alignItems="center">
//           <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//             <TextField
//               fullWidth size="small" placeholder="Search by name, email or program…"
//               value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
//               slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#aaa" }} /></InputAdornment> } }}
//             />
//           </Grid>
//           <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Status</InputLabel>
//               <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(0) }}>
//                 <MenuItem value="all">All Statuses</MenuItem>
//                 <MenuItem value="submitted">Submitted</MenuItem>
//                 <MenuItem value="under_review">Under Review</MenuItem>
//                 <MenuItem value="accepted">Accepted</MenuItem>
//                 <MenuItem value="rejected">Rejected</MenuItem>
//                 <MenuItem value="draft">Draft</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
//             <FilterSelect label="Intake" value={batchFilter} onChange={v => { setBatchFilter(v); setPage(0) }} options={batches} />
//           </Grid>
//           <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//             <Box sx={{ display: "flex", gap: 1 }}>
//               <Button
//                 fullWidth
//                 variant={showMoreFilters ? "contained" : "outlined"}
//                 size="small"
//                 startIcon={<FilterIcon />}
//                 endIcon={showMoreFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//                 onClick={() => setShowMoreFilters(p => !p)}
//                 sx={{
//                   textTransform: "none", fontWeight: 600,
//                   borderColor: NAVY, color: showMoreFilters ? "#fff" : NAVY,
//                   bgcolor: showMoreFilters ? NAVY : "transparent",
//                   "&:hover": { bgcolor: showMoreFilters ? NAVY_DARK : "#e8eaf6" },
//                 }}
//               >
//                 More Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
//               </Button>
//               {activeFilterCount > 0 && (
//                 <Button size="small" onClick={resetFilters} variant="outlined"
//                   sx={{ textTransform: "none", borderColor: "#c0001a", color: "#c0001a", whiteSpace: "nowrap" }}>
//                   Clear All
//                 </Button>
//               )}
//             </Box>
//           </Grid>
//         </Grid>

//         {/* ── Row 2: expandable advanced filters ── */}
//         <Collapse in={showMoreFilters}>
//           <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #e0e0e0" }}>
//             <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>
//               Advanced Filters
//             </Typography>
//             <Grid container spacing={2} alignItems="center">
//               <Grid size={{ xs: 12, sm: 6, md: 2 }}>
//                 <FilterSelect label="Academic Level" value={levelFilter} onChange={v => { setLevelFilter(v); setPage(0) }} options={levels} />
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 2 }}>
//                 <FilterSelect label="Campus" value={campusFilter} onChange={v => { setCampusFilter(v); setPage(0) }} options={campuses} />
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
//                 <FormControl fullWidth size="small">
//                   <InputLabel>Gender</InputLabel>
//                   <Select value={genderFilter} label="Gender" onChange={e => { setGenderFilter(e.target.value); setPage(0) }}>
//                     <MenuItem value="all">All</MenuItem>
//                     <MenuItem value="male">Male</MenuItem>
//                     <MenuItem value="female">Female</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
//                 <FormControl fullWidth size="small">
//                   <InputLabel>Entry Type</InputLabel>
//                   <Select value={entryFilter} label="Entry Type" onChange={e => { setEntryFilter(e.target.value); setPage(0) }}>
//                     <MenuItem value="all">All</MenuItem>
//                     <MenuItem value="online">Online</MenuItem>
//                     <MenuItem value="direct">Direct Entry</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 2 }}>
//                 <FilterSelect label="Faculty" value={facultyFilter} onChange={v => { setFacultyFilter(v); setPage(0) }} options={faculties} />
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
//                 <Autocomplete
//                   options={programOptions}
//                   value={programSearch || null}
//                   onChange={(_, val) => { setProgramSearch(val ?? ""); setPage(0) }}
//                   renderInput={(params) => (
//                     <TextField {...params} size="small" label="Program" placeholder="Type to search…" />
//                   )}
//                   clearOnEscape
//                   size="small"
//                 />
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 1.25 }}>
//                 <TextField
//                   fullWidth size="small" label="Applied from"
//                   type="date" value={dateFrom}
//                   onChange={e => { setDateFrom(e.target.value); setPage(0) }}
//                   slotProps={{ inputLabel: { shrink: true } }}
//                 />
//               </Grid>
//               <Grid size={{ xs: 12, sm: 6, md: 1.25 }}>
//                 <TextField
//                   fullWidth size="small" label="Applied to"
//                   type="date" value={dateTo}
//                   onChange={e => { setDateTo(e.target.value); setPage(0) }}
//                   slotProps={{ inputLabel: { shrink: true } }}
//                 />
//               </Grid>
//             </Grid>
//           </Box>
//         </Collapse>

//         {/* ── Active filter chips ── */}
//         {activeFilterCount > 0 && (
//           <Stack direction="row" spacing={1} mt={2} alignItems="center" flexWrap="wrap" useFlexGap>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//               <FilterIcon sx={{ fontSize: 14, color: "text.secondary" }} />
//               <Typography variant="caption" color="text.secondary">Active:</Typography>
//             </Box>
//             {search && <Chip size="small" label={`Search: "${search}"`} onDelete={() => setSearch("")} />}
//             {statusFilter !== "all" && <Chip size="small" label={`Status: ${statusFilter.replace("_", " ")}`} onDelete={() => setStatusFilter("all")} />}
//             {batchFilter !== "all" && <Chip size="small" label={`Intake: ${batchFilter}`} onDelete={() => setBatchFilter("all")} />}
//             {levelFilter !== "all" && <Chip size="small" label={`Level: ${levelFilter}`} onDelete={() => setLevelFilter("all")} />}
//             {campusFilter !== "all" && <Chip size="small" label={`Campus: ${campusFilter}`} onDelete={() => setCampusFilter("all")} />}
//             {genderFilter !== "all" && <Chip size="small" label={`Gender: ${genderFilter}`} onDelete={() => setGenderFilter("all")} />}
//             {entryFilter !== "all" && <Chip size="small" label={`Entry: ${entryFilter}`} onDelete={() => setEntryFilter("all")} />}
//             {facultyFilter !== "all" && <Chip size="small" label={`Faculty: ${facultyFilter}`} onDelete={() => setFacultyFilter("all")} />}
//             {programSearch && <Chip size="small" label={`Program: "${programSearch}"`} onDelete={() => setProgramSearch("")} />}
//             {dateFrom && <Chip size="small" label={`From: ${dateFrom}`} onDelete={() => setDateFrom("")} />}
//             {dateTo && <Chip size="small" label={`To: ${dateTo}`} onDelete={() => setDateTo("")} />}
//           </Stack>
//         )}
//       </Paper>

//       {/* Table */}
//       {loading ? (
//         <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: NAVY }} /></Box>
//       ) : error ? (
//         <Alert severity="error">{error}</Alert>
//       ) : (
//         <>
//           <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
//             <Table sx={{ minWidth: 900 }}>
//               <TableHead sx={{ backgroundColor: NAVY }}>
//                 <TableRow>
//                   {["#", "Name", "Gender", "Academic Level", "Faculty", "Intake", "Campus", "Program(s)", "Status", "Entry", "Date"].map(h => (
//                     <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{h}</TableCell>
//                   ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {paginated.length > 0 ? paginated.map((a, idx) => (
//                   <TableRow key={a.id} hover sx={{ "&:hover": { backgroundColor: "#f0f4ff" } }}>
//                     <TableCell sx={{ color: "#888", fontSize: "0.8rem" }}>{page * rowsPerPage + idx + 1}</TableCell>
//                     <TableCell>
//                       <Typography fontWeight={600} fontSize="0.875rem">{a.first_name} {a.last_name}</Typography>
//                       <Typography variant="caption" color="text.secondary">{a.email}</Typography>
//                     </TableCell>
//                     <TableCell sx={{ fontSize: "0.875rem" }}>{a.gender}</TableCell>
//                     <TableCell sx={{ fontSize: "0.875rem" }}>{a.academic_level}</TableCell>
//                     <TableCell sx={{ fontSize: "0.875rem" }}>{a.faculty || "—"}</TableCell>
//                     <TableCell sx={{ fontSize: "0.875rem" }}>{a.batch}</TableCell>
//                     <TableCell sx={{ fontSize: "0.875rem" }}>{a.campus}</TableCell>
//                     <TableCell sx={{ fontSize: "0.8rem", maxWidth: 180 }}>{a.programs || "—"}</TableCell>
//                     <TableCell>
//                       <Chip
//                         label={a.status.replace("_", " ")}
//                         color={statusConfig[a.status]?.color ?? "default"}
//                         size="small"
//                         sx={{ textTransform: "capitalize", fontWeight: 600 }}
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <Chip
//                         label={a.is_direct_entry ? "Direct" : "Online"}
//                         size="small"
//                         sx={{
//                           backgroundColor: a.is_direct_entry ? "#ede7f6" : "#e3f2fd",
//                           color: a.is_direct_entry ? "#6a1b9a" : "#1565c0",
//                           fontWeight: 600, fontSize: "0.75rem",
//                         }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
//                       {new Date(a.created_at).toLocaleDateString()}
//                     </TableCell>
//                   </TableRow>
//                 )) : (
//                   <TableRow>
//                     <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
//                       <Alert severity="info">No applicants match your filters.</Alert>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <TablePagination
//             rowsPerPageOptions={[10, 15, 25, 50, 100]}
//             component="div"
//             count={filtered.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={(_, p) => setPage(p)}
//             onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
//             sx={{ backgroundColor: "#fff", borderRadius: "0 0 8px 8px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
//           />
//         </>
//       )}
//     </Box>
//   )
// }

"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  Box, Card, CardContent, Grid, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, TablePagination, InputAdornment,
  CircularProgress, Alert, Button, Autocomplete,
} from "@mui/material"
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  PeopleAlt as PeopleIcon,
  HourglassEmpty as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material"
import { Collapse } from "@mui/material"
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
  faculty: string
  status: string
  created_at: string
  is_direct_entry: boolean
  entered_by: string
}

const statusConfig: Record<string, { color: "default" | "info" | "warning" | "success" | "error" }> = {
  submitted: { color: "info" },
  under_review: { color: "warning" },
  accepted: { color: "success" },
  rejected: { color: "error" },
  draft: { color: "default" },
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
  const [searching, setSearching] = useState(false)   // For debounced search
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [reportStats, setReportStats] = useState({
    total: 0,
    submitted: 0,
    admitted: 0,
    rejected: 0,
    direct: 0,
  })

  // Filters
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [batchFilter, setBatchFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [campusFilter, setCampusFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [entryFilter, setEntryFilter] = useState("all")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [programSearch, setProgramSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Build server filter params (shared by list + stats endpoints)
  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams()

    if (debouncedSearch) params.append("search", debouncedSearch)
    if (statusFilter !== "all") params.append("status", statusFilter)
    if (genderFilter !== "all") params.append("gender", genderFilter)
    if (levelFilter !== "all") params.append("academic_level", levelFilter)
    if (batchFilter !== "all") params.append("batch", batchFilter)
    if (campusFilter !== "all") params.append("campus", campusFilter)
    if (facultyFilter !== "all") params.append("faculty", facultyFilter)
    if (programSearch) params.append("program", programSearch)
    if (dateFrom) params.append("date_from", dateFrom)
    if (dateTo) params.append("date_to", dateTo)
    if (entryFilter !== "all") {
      params.append("is_direct_entry", entryFilter === "direct" ? "true" : "false")
    }

    return params
  }, [
    debouncedSearch, statusFilter, genderFilter, levelFilter, batchFilter,
    campusFilter, facultyFilter, programSearch, dateFrom, dateTo, entryFilter,
  ])

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = buildFilterParams()
      params.append("page", String(page + 1))
      params.append("page_size", String(rowsPerPage))

      const statsParams = buildFilterParams()

      const [listRes, statsRes] = await Promise.all([
        AxiosInstance.get(`/api/admissions/all_applications_detail_report/?${params.toString()}`),
        AxiosInstance.get(`/api/admissions/all_applications_detail_report_stats/?${statsParams.toString()}`),
      ])

      const { data } = listRes
      setApplicants(data.results || [])
      setTotalCount(data.count || 0)

      const stats = statsRes.data || {}
      setReportStats({
        total: Number(stats.total ?? 0),
        submitted: Number(stats.submitted ?? 0),
        admitted: Number(stats.admitted ?? 0),
        rejected: Number(stats.rejected ?? 0),
        direct: Number(stats.direct ?? 0),
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load applicants")
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }, [AxiosInstance, page, rowsPerPage, buildFilterParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const stats = reportStats

   const getProgramsArray = (programs: any): string[] => {
    if (!programs) return []
    if (Array.isArray(programs)) return programs.map(p => p?.name || p).filter(Boolean)
    if (typeof programs === "string") return programs.split(",").map(p => p.trim()).filter(Boolean)
    return []
  }

  const allAcademicLevels = useMemo(() => [...new Set(applicants.map(a => a.academic_level).filter(Boolean))], [applicants])
  const allBatches = useMemo(() => [...new Set(applicants.map(a => a.batch).filter(Boolean))], [applicants])
  const allPrograms = useMemo(() => {
    const all = applicants.flatMap(a => getProgramsArray(a.programs))
    return [...new Set(all)].sort()
  }, [applicants])
  const allCampuses = useMemo(() => [...new Set(applicants.map(a => a.campus).filter(Boolean))], [applicants])

  const resetFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setBatchFilter("all")
    setLevelFilter("all")
    setCampusFilter("all")
    setStatusFilter("all")
    setGenderFilter("all")
    setEntryFilter("all")
    setFacultyFilter("all")
    setProgramSearch("")
    setDateFrom("")
    setDateTo("")
    setPage(0)
  }

  const activeFilterCount = useMemo(() => {
    return [debouncedSearch, programSearch, dateFrom, dateTo].filter(Boolean).length +
      [statusFilter, batchFilter, levelFilter, campusFilter, genderFilter, entryFilter, facultyFilter]
        .filter(v => v !== "all").length
  }, [debouncedSearch, programSearch, dateFrom, dateTo, statusFilter, batchFilter, levelFilter, campusFilter, genderFilter, entryFilter, facultyFilter])

  const exportCSV = () => {
    alert("Full export can be implemented with a dedicated backend endpoint.")
  }

  return (
    <Box sx={{ p: 3, background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color={NAVY}>All Applicants Report</Typography>
          <Typography variant="body2" color="text.secondary">Server-side filtering with debounced search</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportCSV}
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
          <StatCard label="Submitted / In Review" value={stats.submitted} icon={PendingIcon} color="#f57c00" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard label="Admitted" value={stats.admitted} icon={CheckCircleIcon} color="#388e3c" />
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth size="small"
              placeholder="Search by name, email or program…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSearching(true)
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#aaa" }} /></InputAdornment>
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="accepted">accepted</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="Admitted">Admitted</MenuItem>
                <MenuItem value="revoked">Revoked</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Intake (Batch)</InputLabel>
              <Select value={batchFilter} label="Intake (Batch)" onChange={e => { setBatchFilter(e.target.value); setPage(0) }}>
                <MenuItem value="all">All Batches</MenuItem>
                 {allBatches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                variant={showMoreFilters ? "contained" : "outlined"}
                size="small"
                startIcon={<FilterIcon />}
                endIcon={showMoreFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowMoreFilters(p => !p)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                More Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>

              {activeFilterCount > 0 && (
                <Button size="small" onClick={resetFilters} variant="outlined" sx={{ borderColor: "#c0001a", color: "#c0001a" }}>
                  Clear All
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={showMoreFilters}>
          <Box sx={{ mt: 3, pt: 2, borderTop: "1px dashed #e0e0e0" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Academic Level</InputLabel>
                  <Select value={levelFilter} label="Academic Level" onChange={e => { setLevelFilter(e.target.value); setPage(0) }}>
                    <MenuItem value="all">All Levels</MenuItem>
                    {allAcademicLevels.map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Campus</InputLabel>
                  <Select value={campusFilter} label="Campus" onChange={e => { setCampusFilter(e.target.value); setPage(0) }}>
                    <MenuItem value="all">All Campuses</MenuItem>
                     {allCampuses.map(campus => <MenuItem key={campus} value={campus}>{campus}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select value={genderFilter} label="Gender" onChange={e => { setGenderFilter(e.target.value); setPage(0) }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Entry Type</InputLabel>
                  <Select value={entryFilter} label="Entry Type" onChange={e => { setEntryFilter(e.target.value); setPage(0) }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="direct">Direct Entry</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Autocomplete
                  options={allPrograms} // You can populate from data if needed
                  value={programSearch || null}
                  onChange={(_, val) => { setProgramSearch(val ?? ""); setPage(0) }}
                  renderInput={(params) => <TextField {...params} size="small" label="Program" placeholder="Search program..." />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField fullWidth size="small" label="From Date" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField fullWidth size="small" label="To Date" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Table Section */}
      {(loading || searching) ? (
        <Box display="flex" justifyContent="center" py={8} alignItems="center" gap={2}>
          <CircularProgress size={28} sx={{ color: NAVY }} />
          <Typography variant="h6" color="text.secondary">
            {searching ? "Searching..." : "Loading applicants..."}
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ backgroundColor: NAVY }}>
                <TableRow>
                  {["#", "Name", "Gender", "Academic Level", "Faculty", "Intake", "Campus", "Program(s)", "Status", "Entry", "Date"].map(h => (
                    <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {applicants.length > 0 ? (
                  applicants.map((a, idx) => (
                    <TableRow key={a.id} hover sx={{ "&:hover": { backgroundColor: "#f0f4ff" } }}>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{a.first_name} {a.last_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{a.email}</Typography>
                      </TableCell>
                      <TableCell>{a.gender}</TableCell>
                      <TableCell>{a.academic_level}</TableCell>
                      <TableCell>{a.faculty || "—"}</TableCell>
                      <TableCell>{a.batch}</TableCell>
                      <TableCell>{a.campus}</TableCell>
                      <TableCell sx={{ maxWidth: 180, fontSize: "0.8rem" }}>{a.programs || "—"}</TableCell>
                      <TableCell>
                        <Chip label={a.status} color={statusConfig[a.status]?.color ?? "default"} size="small" sx={{ textTransform: "capitalize" }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={a.is_direct_entry ? "Direct" : "Online"} size="small" color={a.is_direct_entry ? "secondary" : "primary"} />
                      </TableCell>
                      <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      <Alert severity="info">No applicants match your filters.</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          />
        </>
      )}
    </Box>
  )
}