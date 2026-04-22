"use client"

import { useEffect, useState } from "react"
import {
  Box, Card, CardContent, CardHeader, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  CircularProgress, Alert, Divider, TextField, InputAdornment,
} from "@mui/material"
import { Grid } from "@mui/material"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  BarChart as BarChartIcon,
  Search as SearchIcon,
  Login as LoginIcon,
  Today as TodayIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

interface UserStat {
  user__id: number
  user__first_name: string
  user__last_name: string
  user__email: string
  user__is_staff: boolean
  user__is_applicant: boolean
  login_count: number
  last_seen: string
}

interface RecentLogin {
  user: string
  email: string
  is_staff: boolean
  ip_address: string
  timestamp: string
}

interface DailyLogin {
  day: string
  count: number
}

interface UsageData {
  summary: { total_logins: number; logins_today: number; unique_users_today: number }
  user_stats: UserStat[]
  daily_logins: DailyLogin[]
  recent_logins: RecentLogin[]
}

export default function SystemUsage() {
  const AxiosInstance = useAxios()

  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await AxiosInstance!.get("/api/accounts/system_usage_report")
        setData(res.data)
      } catch (err: any) {
        const msg = err?.response?.data?.detail || err?.message || "Failed to load system usage report."
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: "#7c1519" }} />
      </Box>
    )
  }

  if (error || !data) {
    return <Alert severity="error" sx={{ m: 3 }}>{error || "No data available."}</Alert>
  }

  const chartData = data.daily_logins.map((d) => ({
    day: new Date(d.day).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    Logins: d.count,
  }))

  const filteredUsers = data.user_stats.filter(
    (u) =>
      `${u.user__first_name} ${u.user__last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.user__email.toLowerCase().includes(search.toLowerCase())
  )

  const summaryCards = [
    { label: "Total Logins (All Time)", value: data.summary.total_logins, icon: <LoginIcon />, color: "#7c1519" },
    { label: "Logins Today", value: data.summary.logins_today, icon: <TodayIcon />, color: "#2e7d32" },
    { label: "Unique Users Today", value: data.summary.unique_users_today, icon: <PeopleIcon />, color: "#1565c0" },
  ]

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <BarChartIcon sx={{ fontSize: 32, color: "#7c1519" }} />
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1a3a52">
            System Usage Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track user login activity and system access patterns
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid size={{ xs: 12, sm: 4 }} key={card.label}>
            <Card sx={{ border: "1px solid #e0eef7" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: card.color + "15", color: card.color }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color={card.color}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Daily Logins Chart */}
      <Card sx={{ mb: 3, border: "1px solid #e0eef7" }}>
        <CardHeader
          avatar={<BarChartIcon sx={{ color: "#7c1519" }} />}
          title={<Typography fontWeight={700}>Daily Logins — Last 30 Days</Typography>}
        />
        <Divider />
        <CardContent>
          {chartData.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No login data for the last 30 days.
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Logins" fill="#7c1519" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* User Login Stats Table */}
      <Card sx={{ mb: 3, border: "1px solid #e0eef7" }}>
        <CardHeader
          avatar={<PeopleIcon sx={{ color: "#7c1519" }} />}
          title={<Typography fontWeight={700}>Login Count per User</Typography>}
          action={
            <TextField
              size="small"
              placeholder="Search user..."
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
              sx={{ width: 220 }}
            />
          }
        />
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f7fa" }}>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell align="center"><strong>Total Logins</strong></TableCell>
                <TableCell><strong>Last Seen</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.user__id} hover>
                    <TableCell>{`${u.user__first_name} ${u.user__last_name}`.trim() || "—"}</TableCell>
                    <TableCell>{u.user__email}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={u.user__is_staff ? "Admin/Staff" : "Applicant"}
                        color={u.user__is_staff ? "warning" : "info"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={u.login_count} color="primary" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <TimeIcon fontSize="small" sx={{ color: "text.secondary" }} />
                        <Typography variant="caption">
                          {new Date(u.last_seen).toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Recent Login Events */}
      <Card sx={{ border: "1px solid #e0eef7" }}>
        <CardHeader
          avatar={<LoginIcon sx={{ color: "#7c1519" }} />}
          title={<Typography fontWeight={700}>Recent Login Events (Last 50)</Typography>}
        />
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f7fa" }}>
              <TableRow>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>IP Address</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recent_logins.map((r, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{r.user}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.is_staff ? "Admin/Staff" : "Applicant"}
                      color={r.is_staff ? "warning" : "info"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace">
                      {r.ip_address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(r.timestamp).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
