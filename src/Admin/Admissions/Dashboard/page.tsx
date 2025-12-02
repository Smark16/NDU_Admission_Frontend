"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material"
import {
  FileText,
  Clock,
  Search,
  CheckCircle,
  XCircle as Cancel,
  TrendingUp,
  Users,
  Building,
  BarChart3,
  Eye,
} from "lucide-react"

import useAxios from "../../../AxiosInstance/UseAxios"
import { Link } from "react-router-dom"
import CustomButton from "../../../ReUsables/custombutton"

interface Stats {
  totalApplication: number
  pendingApplications: number
  admittedStudents: number
  rejectedStudents: number
  total_batches: number
  activeBatches:number
}

interface Application {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "Male" | "Female" | "Other"
  nationality: string
  phone: string
  email: string
  is_left_handed: boolean
  next_of_kin_name: string
  next_of_kin_contact: string
  next_of_kin_relationship: string

  program: { name: string; code: string }
  batch: { name: string }
  campus: { name: string }

  olevel_school: string
  olevel_year: number
  alevel_school: string
  alevel_year: number

  address: string
  status: string
  application_fee_amount: string
  created_at: string
  reviewed_at: string | null
  review_notes: string | null
  passport_photo: File | null
}

const AdmissionDashboard = () => {
  const AxiosInstance = useAxios()
  const [dashboardStats, setDashboardStats] = useState<Stats | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" | "info" | "warning" }>({
    open: false,
    message: "",
    type: "success",
  })

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await AxiosInstance.get("/api/admissions/admission_dashboard_stats")
      setDashboardStats(response.data)
    } catch (err: any) {
      console.error("Failed to fetch stats:", err)
      setError("Failed to load dashboard stats")
    }
  }

  // Fetch Applications
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

  // Load data on mount
  useEffect(() => {
    fetchStats()
    fetchApplications()
  }, [AxiosInstance])

  const getStatusColor = (status: string): "default" | "warning" | "info" | "success" | "error" => {
    const statusMap: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
      submitted: "warning",
      under_review: "info",
      accepted: "success",
      rejected: "error",
    }
    return statusMap[status] || "default"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle size={16} />
      case "rejected":
        return <Cancel size={16} />
      case "under_review":
        return <Search size={16} />
      default:
        return <Clock size={16} />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      accepted: "Accepted",
      rejected: "Rejected",
    }
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
  }

  const handleViewApplication = (appId: number) => {
    setSnackbar({
      open: true,
      message: `Viewing application #${appId}`,
      type: "info",
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${color}20`,
          borderColor: `${color}50`,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" fontSize="0.875rem" fontWeight={500} mb={1}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>
              {value ?? "-"}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={24} style={{ color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ background: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Admin Dashboard
          </Typography>
          <Typography color="textSecondary" variant="body2">
            Welcome back! Here's what's happening with your admissions.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2} mb={4}>
          <Grid size={{xs:12, sm:6, md:3}}>
            <StatCard title="Total Applications" value={dashboardStats?.totalApplication ?? 0} icon={FileText} color="#1976d2" />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}}>
            <StatCard title="Pending" value={dashboardStats?.pendingApplications ?? 0} icon={Clock} color="#f57c00" />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}}>
            <StatCard title="Accepted" value={dashboardStats?.admittedStudents ?? 0} icon={CheckCircle} color="#388e3c" />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}}>
            <StatCard title="Rejected" value={dashboardStats?.rejectedStudents ?? 0} icon={Cancel} color="#d32f2f" />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Applications Table */}
          <Grid size={{xs:12}}>
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <CardHeader
                title="Applications Requiring Review"
                subheader={`${applications.length} pending review`}
                avatar={<Clock size={24} style={{ marginRight: "12px", color: "#1976d2" }} />}
              />
              <CardContent>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : applications.length === 0 ? (
                  <Typography color="textSecondary" textAlign="center" py={4}>
                    No applications found.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Batch</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {applications.slice(0, 5).map((app) => (
                          <TableRow
                            key={app.id}
                            hover
                            sx={{
                              "&:hover": { backgroundColor: "#f9f9f9" },
                              borderBottom: "1px solid #e0e0e0",
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight={600} fontSize="0.875rem">
                                {app.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {app.first_name} {app.last_name}
                            </TableCell>
                            <TableCell>{app.batch?.name}</TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(app.status)}
                                label={getStatusLabel(app.status)}
                                color={getStatusColor(app.status)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell sx={{fontSize:"0.875rem"}}>
                              {new Date(app.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  size="small"
                                  component={Link}
                                  to={`/admin/application_review/${app.id}`}
                                  variant="outlined"
                                  startIcon={<Eye size={16} />}
                                  onClick={() => handleViewApplication(app.id)}
                                >
                                  View
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <Box textAlign="center" mt={3}>
                  <CustomButton icon={<FileText size={18} />} text='View All Applications'/>
                  {/* <Button variant="contained" startIcon={<FileText size={18} />}>
                    View All Applications
                  </Button> */}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid size={{xs:12, md:6}}>
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", height: "100%" }}>
              <CardHeader
                title="Quick Actions"
                avatar={<TrendingUp size={24} style={{ marginRight: "12px", color: "#3e397b" }} />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {[
                    { label: "View Applications", icon: FileText, path:'/admin/application_list' },
                    { label: "Manage Users", icon: Users, path:'/admin/user_management' },
                    { label: "Manage Campuses", icon: Building, path:'/admin/campus_management' },
                    { label: "Audit Logs", icon: BarChart3, path:'' },
                  ].map((item, idx) => (
                    <Grid size={{xs:12}} key={idx}>
                      <CustomButton component={Link} to={item.path} fullWidth variant="outlined" icon={<item.icon size={18} />} sx={{justifyContent: "flex-start"}} text={item.label}/>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Info */}
          <Grid size={{xs:12, md:6}}>
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", height: "100%" }}>
              <CardHeader
                title="System Information"
                avatar={<BarChart3 size={24} style={{ marginRight: "12px", color: "#3e397b" }} />}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" pb={2} borderBottom="1px solid #e0e0e0">
                    <Typography color="textSecondary" fontWeight={500}>
                      System Name:
                    </Typography>
                    <Typography fontWeight={600}>Admission Management System</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" pb={2} borderBottom="1px solid #e0e0e0">
                    <Typography color="textSecondary" fontWeight={500}>
                      Total Batches:
                    </Typography>
                    <Typography fontWeight={600}>{dashboardStats?.total_batches ?? "-"}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" pb={2} borderBottom="1px solid #e0e0e0">
                    <Typography color="textSecondary" fontWeight={500}>
                      Active Batches:
                    </Typography>
                    <Chip label={dashboardStats?.activeBatches} color="success" size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.type} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default AdmissionDashboard