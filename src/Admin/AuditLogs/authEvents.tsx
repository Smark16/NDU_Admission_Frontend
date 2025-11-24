// components/audit/AuthEvents.tsx
"use client"

import {
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
  Pagination,
  MenuItem,
  CircularProgress,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import { format } from "date-fns"

interface AuthLog {
  id: number
  user: string
  action: "login" | "register"
  description?: string
  user_agent?: string
  timestamp: string
}

const actionTypeStyles = {
  login: { color: "#3b82f6", bg: "#eff6ff" },
  register: { color: "#8b5cf6", bg: "#f5f3ff" },
}

interface AuthEventsProps {
  logs: AuthLog[]
  isLoading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
  page: number
  setPage: (page: number) => void
  itemsPerPage: number
  setItemsPerPage: (num: number) => void
  onDeleteLog: (id: number) => void
  onDeleteAll: () => void
}

export default function AuthEvents({
  logs,
  isLoading,
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  page,
  setPage,
  itemsPerPage,
  setItemsPerPage,
  onDeleteLog,
  onDeleteAll,
}: AuthEventsProps) {
  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const logDate = new Date(log.timestamp).toISOString().split("T")[0]
    const matchesDateRange =
      (!startDate || logDate >= startDate) &&
      (!endDate || logDate <= endDate)

    return matchesSearch && matchesDateRange
  })

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1
  const startIndex = (page - 1) * itemsPerPage
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage)

  const formatTimestamp = (ts: string) => {
    try {
      return format(new Date(ts), "MMM dd, yyyy · HH:mm:ss")
    } catch {
      return ts
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Stack spacing={3}>
        {/* Filters */}
        <Paper sx={{ p: 3, bgcolor: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <Typography variant="subtitle2" fontWeight={600} color="#374151" mb={2}>
            Filter by Date Range
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1 }}
            />
          </Stack>

          <TextField
            fullWidth
            placeholder="Search by user or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDeleteAll}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
             {isLoading ? 'Deleting logs...' : 'Delete All Logs'}
          </Button>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} sx={{ border: "1px solid #e5e7eb" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f3f4f6" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>User Agent</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Timestamp</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "#374151" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {logs.length === 0 ? "No authentication logs" : "No logs match your filters"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ color: "#6b7280" }}>{log.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#111827" }}>
                      {log.user || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: actionTypeStyles[log.action]?.bg || "#e5e7eb",
                          color: actionTypeStyles[log.action]?.color || "#374151",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {log.description || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", maxWidth: 250 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          whiteSpace: "wrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {log.user_agent || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280" }}>
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => onDeleteLog(log.id)} sx={{ color: "#ef4444" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="#6b7280">Items per page:</Typography>
            <TextField
              select
              size="small"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setPage(1)
              }}
              sx={{ width: 80 }}
            >
              {[5, 10, 25, 50].map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="#6b7280">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
            </Typography>
          </Stack>

          <Pagination count={totalPages} page={page} onChange={(_e, v) => setPage(v)} color="primary" />
        </Stack>
      </Stack>
    </Box>
  )
}