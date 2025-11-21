"use client"

import type React from "react"
import { useState } from "react"
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  Alert,
  Divider,
} from "@mui/material"
import {
  FileDownload as FileDownloadIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import PassportPhotoSection from './passport'
import EducationalBackgroundSection from './education-background'
import { Link } from "react-router-dom"

interface ApplicationReviewProps {
  application: any
  olevelresults: any[]
  alevelresults: any[]
  documents: any[]
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({ application, documents, olevelresults, alevelresults }) => {
  // const [openDialog, setOpenDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  // const [selectedDocument, setSelectedDocument] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "success"
      case "rejected":
        return "error"
      case "submitted":
        return "info"
      default:
        return "warning"
    }
  }

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase() === "accepted") return <CheckCircleIcon />
    return <WarningIcon />
  }

  // const getGradeColor = (grade: string) => {
  //   switch (grade) {
  //     case "A":
  //       return "#4caf50"
  //     case "B":
  //       return "#2196f3"
  //     case "C":
  //       return "#ff9800"
  //     default:
  //       return "#9e9e9e"
  //   }
  // }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Content - Left Side */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Applicant Header Card */}
          <Card sx={{ mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "rgba(255,255,255,0.2)",
                    fontSize: "2rem",
                  }}
                >
                  {application.first_name?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {application.first_name} {application.last_name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Application ID: #{application.id} • {application.batch.name}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Personal Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardHeader avatar={<PersonIcon />} title="Personal Information" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Full Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.first_name} {application.last_name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(application.date_of_birth).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.gender}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Nationality
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.nationality}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.email}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.phone}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Academic Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardHeader avatar={<SchoolIcon />} title="Academic Information" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {/* <Grid size={{xs:12, sm:6}}>
                  <Typography variant="caption" color="textSecondary">
                    Program
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.program.name} ({application.program.code})
                  </Typography>
                </Grid> */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Batch
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.batch.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Campus
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.campus.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.address}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    O-Level School
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.olevel_school} ({application.olevel_year})
                  </Typography>
                </Grid>
                {application.alevel_school && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      A-Level School
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {application.alevel_school} ({application.alevel_year})
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Academic Results Section */}
          <EducationalBackgroundSection 
          alevelresults={alevelresults} 
          olevelresults={olevelresults} 
          application={application} />
      
          {/* Documents Section */}
          <Card sx={{ mb: 3 }}>
            <CardHeader avatar={<DescriptionIcon />} title="Documents" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent>
              {documents && documents.length > 0 ? (
                <Grid container spacing={2}>
                  {documents.map((doc, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Paper sx={{ p: 2, border: "1px solid #e0e0e0", cursor: "pointer", "&:hover": { boxShadow: 2 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {doc.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {doc.document_type}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => window.open(doc.file_url, "_blank")}
                          >
                            View
                          </Button>
                          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}>
                            Download
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="textSecondary">No documents uploaded</Typography>
              )}
            </CardContent>
          </Card>

          <PassportPhotoSection application={application} />
        </Grid>

        {/* Right Sidebar - Review Form */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Application Status Card */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Status & Details" titleTypographyProps={{ variant: "h6" }} />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Current Status
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  {getStatusIcon(application.status)}
                  <Chip
                    label={application.status}
                    color={getStatusColor(application.status) as any}
                    variant="filled"
                    size="small"
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="textSecondary">
                  Application Fee
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mt: 0.5, color: application.application_fee_paid ? "#4caf50" : "#f44336" }}
                >
                  {application.application_fee_paid ? "✓ Paid" : "✗ Not Paid"}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="textSecondary">
                  Application Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {new Date(application.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              {application.reviewed_by && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Reviewed By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {application.reviewed_by?.first_name && application.reviewed_by?.last_name ?
                        `${application.reviewed_by?.first_name} ${application.reviewed_by?.first_name}`
                        : application.reviewed_by?.username}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Review Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {new Date(application.reviewed_at).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        component={Link}
                        to={`/admin/admit_student/${application.id}`}
                        variant="contained"
                        size="small"
                        sx={{
                          textTransform: "none",
                          borderColor: "#1976d2",
                        }}
                      >
                        Admit Student
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          textTransform: "none",
                          borderColor: "#1976d2",
                        }}
                      >
                        Reject Student
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ApplicationReview
