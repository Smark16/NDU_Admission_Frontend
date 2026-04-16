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
  CircularProgress,
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
import { Link, useNavigate } from "react-router-dom"
import useAxios from "../../../../AxiosInstance/UseAxios"
import CustomButton from "../../../../ReUsables/custombutton"
import RejectionForm from "./RejectionForm"

interface ApplicationReviewProps {
  application: any
  olevelresults: any[]
  alevelresults: any[]
  documents: any[]
  additionalQualifications: any[]
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({ application, documents, olevelresults, alevelresults, additionalQualifications }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [docLoading, setDocLoading] = useState(false)
  const [selectedID, setSelectedID] = useState<number | null>(null)
  const [profileDownload, setProfileDownload] = useState(false)
  const [openReject, setOpenReject] = useState(false);
  const navigate = useNavigate()
  const AxiosInstance = useAxios()

  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)


  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

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

  const handleReject = async (rejection_reason: string) => {
  if (!rejection_reason?.trim()) {
    showNotification("Rejection reason is required", "error");
    return;
  }

  try {
    setIsLoading(true);

    const payload = {
      rejection_reason: rejection_reason.trim(),
    };

    await AxiosInstance.patch(
      `/api/admissions/reject_application/${application.id}`,
      payload
    );

    setIsLoading(false);
    showNotification("Application has been successfully rejected", "success");

    // Optional: Refresh or navigate after success
    setTimeout(() => {
      navigate('/admin/application_list');
    }, 800);

  } catch (err: any) {
    setIsLoading(false);
    
    console.error("Rejection error:", err);
    
    const errorMessage = 
      err?.response?.data?.detail || 
      err?.response?.data?.rejection_reason?.[0] ||
      err?.response?.data?.message ||
      "Failed to reject application. Please try again.";

    showNotification(errorMessage, "error");
  }
};
 
  // download student profile
  const handleDownloadProfile = async () => {
    try {
      setProfileDownload(true)
      const response = await AxiosInstance.get(`/api/admissions/student-profile/pdf/${application.id}/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Admission_Letter.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setProfileDownload(false)
    } catch (error: any) {
      console.error("Download failed", error);
      showNotification(`${error?.response?.detail?.data}` || 'something went wrong', "error")
      setProfileDownload(false)
    }
  };

  const downloadDocument = async (url: string, filename: string, seletedId:number) => {
    setSelectedID(seletedId)
    try {
      setDocLoading(true)
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download document:", error);
      showNotification("Failed to download document:", "error")
    }finally{
      setDocLoading(false)
    }
  };

  const handleSendLetter = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.post(`/api/offer_letter/send_letter/${application?.id}`)
      console.log(response.data)
      setIsLoading(false)
      showNotification(`${response.data?.detail}`, "success")

      setTimeout(() => {
        navigate('/admin/application_list')
      }, 700)
    } catch (err: any) {
      console.log(err)
      if (err.response?.data.detail) {
        showNotification(`${err.response?.data.detail}`, "error")
      } else {
        showNotification("Failed to send offer letter to student", "error")
      }
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number): string => {
    if (!value) return '0';

    return value.toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 3 }}
        >
          {notification.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Content - Left Side */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Applicant Header Card */}
          <Card sx={{ mb: 3, background: "linear-gradient(135deg, #3e397b 0%, #764ba2 100%)", color: "white" }}>
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
                    Application ID: #{application.id} • {application.batch}
                  </Typography>
                </Box>
                <CustomButton text={profileDownload ? "downloading..." : "DownLoad Profile"} startIcon={<FileDownloadIcon />} onClick={handleDownloadProfile} />
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    {application.nin ? "NIN" : "PassPort Number"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.nin ? application.nin : application.passport_number}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Disability Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.disabled}
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Batch
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {application.batch}
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
            application={application}
            additionalQualifications={additionalQualifications}
          />

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

                          {/* view */}
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}${doc.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none" }}
                          >
                            <CustomButton
                              variant="outlined"
                              icon={<OpenInNewIcon />}
                              text="View"
                              sx={{
                                borderColor: "#7c1519",
                                color: "#7c1519"
                              }}
                            />
                          </a>

                          {/* download */}
                          <CustomButton
                            variant="outlined"
                            icon={<FileDownloadIcon />}
                            onClick={() => downloadDocument(`${import.meta.env.VITE_API_BASE_URL}${doc.file}`, doc.name, doc?.id)}
                            text={selectedID === doc?.id && docLoading ? "Downloading..." : "Download"}
                            sx={{
                              borderColor: "#7c1519",
                              color: "#7c1519"
                            }}
                          />
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
                  Application Fee Amount
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mt: 0.5, color: application.application_fee_paid ? "#4caf50" : "#f44336" }}
                >
                  UGX {formatCurrency(Number(application.application_fee_amount))}
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
                      {application.reviewed_by}
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
                      {application.status === 'accepted' ? (
                        <CustomButton
                          disabled={isLoading}
                          onClick={handleSendLetter}
                          text={
                            isLoading ? <CircularProgress size={15} /> : "Send offer letter to portal"
                          }
                        />
                      ) : application.status === 'Admitted' ? (
                        ""
                      ) : (
                        <>
                          <CustomButton component={Link}
                            to={`/admin/admit_student/${application.id}`}
                            text='Admit Student'
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              textTransform: "none",
                              borderColor: "#7c1519",
                              color: "#7c1519"
                            }}
                            onClick={() => setOpenReject(true)}
                          >
                            {isLoading ? <CircularProgress size={15} /> : "Reject Student"}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <RejectionForm
        open={openReject}
        onClose={() => setOpenReject(false)}
        onSubmit={handleReject}
        itemName={`${application.first_name} ${application.last_name}'s application`}
      />

    </Container>
  )
}

export default ApplicationReview
