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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material"
import {
  FileDownload as FileDownloadIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  Block as RevokeIcon,
  Restore as RestoreIcon,
  Edit as EditIcon,
} from "@mui/icons-material"
import PassportPhotoSection from './passport'
import EducationalBackgroundSection from './education-background'
import { Link, useNavigate } from "react-router-dom"
import useAxios from "../../../../AxiosInstance/UseAxios"
import CustomButton from "../../../../ReUsables/custombutton"

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
  // const [currentStatus, setCurrentStatus] = useState(application?.status || "submitted")
  const [savingProfile, setSavingProfile] = useState(false)
  const [openEditProfile, setOpenEditProfile] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const AxiosInstance = useAxios()

  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)

  // useEffect(() => {
  //   setCurrentStatus(application?.status || "submitted")
  // }, [application?.status])

  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
      case "admitted":
        return "success"
      case "rejected":
        return "error"
      case "submitted":
      case "under_review":
        return "info"
      default:
        return "warning"
    }
  }

  const getStatusLabel = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
        return "Approved"
      case "under_review":
        return "Under Review"
      case "admitted":
        return "Admitted"
      default:
        return status || "Unknown"
    }
  }

  const getStatusIcon = (status: string) => {
    if (["accepted", "admitted"].includes((status || "").toLowerCase())) return <CheckCircleIcon />
    return <WarningIcon />
  }

  const handleReject = async () => {
    try {
      setIsLoading(true)
      await AxiosInstance.patch(`/api/admissions/change_applicatio_status/${application.id}`, { status: "rejected" })
      setIsLoading(false)
      showNotification("Application has been rejected", "success")

      setTimeout(() => {
        navigate('/admin/application_list')
      }, 500)
    } catch (err) {
      console.log(err)
      setIsLoading(false)
    }
  }

  const handleWithdrawAdmission = async () => {
    if (!application?.admission_id) return
    try {
      setIsLoading(true)
      await AxiosInstance.post(`/api/admissions/admitted_students/${application.admission_id}/revoke/`, {
        reason: "Withdrawn from review page",
      })
      setIsLoading(false)
      showNotification("Admission withdrawn successfully", "success")
      window.location.reload()
    } catch (err: any) {
      setIsLoading(false)
      const msg = err?.response?.data?.detail
      showNotification(typeof msg === "string" ? msg : "Failed to withdraw admission", "error")
    }
  }

  const handleRestoreAdmission = async () => {
    if (!application?.admission_id) return
    try {
      setIsLoading(true)
      await AxiosInstance.post(`/api/admissions/admitted_students/${application.admission_id}/restore/`)
      setIsLoading(false)
      showNotification("Admission restored successfully", "success")
      window.location.reload()
    } catch (err: any) {
      setIsLoading(false)
      const msg = err?.response?.data?.detail
      showNotification(typeof msg === "string" ? msg : "Failed to restore admission", "error")
    }
  }

  const downloadDocument = async (url: string, filename: string, seletedId: number) => {
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
    } finally {
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

   const handleEditProfile = async () => {
    setSavingProfile(true)
    try {
      await AxiosInstance.patch(`/api/admissions/edit_application_profile/${application.id}`, editForm)
      showNotification("Profile updated successfully.", "success")
      setOpenEditProfile(false)
      setTimeout(() => window.location.reload(), 800)
    } catch (err: any) {
      showNotification(err?.response?.data?.detail || "Failed to update profile.", "error")
    } finally {
      setSavingProfile(false)
    }
  }


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
          <Card sx={{ mb: 3, background: "linear-gradient(135deg, #0D0060 0%, #07003A 100%)", color: "white" }}>
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
                {application.address && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      Address
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {application.address}
                    </Typography>
                  </Grid>
                )}

                {application.olevel_school ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      O-Level School
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {application.olevel_school} ({application.olevel_year})
                    </Typography>
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      O-Level School
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#c9672e" }}>
                      The Above Student never Went through Olevel,
                      Please find there Additional Qualifications Below if provided
                    </Typography>
                  </Grid>
                )}

                {application.alevel_school ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      A-Level School
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {application.alevel_school} ({application.alevel_year})
                    </Typography>
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      A-Level School
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#e95656" }}>
                      The Above Student never Went through Alevel,
                      Please find there Additional Qualifications Below if provided
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
                    label={getStatusLabel(application.status)}
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

              <Box>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditForm({
                      first_name: application.first_name || "",
                      last_name: application.last_name || "",
                      middle_name: application.middle_name || "",
                      date_of_birth: application.date_of_birth || "",
                      gender: application.gender || "",
                      nationality: application.nationality || "",
                      phone: application.phone || "",
                      email: application.email || "",
                      address: application.address || "",
                      disabled: application.disabled || "",
                      next_of_kin_name: application.next_of_kin_name || "",
                      next_of_kin_contact: application.next_of_kin_contact || "",
                      next_of_kin_relationship: application.next_of_kin_relationship || "",
                      nin: application.nin || "",
                      passport_number: application.passport_number || "",
                    })
                    setOpenEditProfile(true)
                  }}
                  sx={{ textTransform: "none", borderColor: "#1565c0", color: "#1565c0" }}
                >
                  Edit Profile
                </Button>
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
                            onClick={handleReject}
                          >
                            {isLoading ? <CircularProgress size={15} /> : "Reject Student"}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {application.admitted_by && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Admitted By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {application.admitted_by}
                    </Typography>
                  </Box>
                </>
              )}
              {application.admission_id && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Admission Actions
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <CustomButton
                        disabled={isLoading}
                        onClick={application.is_revoked ? handleRestoreAdmission : handleWithdrawAdmission}
                        icon={application.is_revoked ? <RestoreIcon /> : <RevokeIcon />}
                        text={
                          isLoading
                            ? <CircularProgress size={15} />
                            : (application.is_revoked ? "Restore Admission" : "Withdraw Admission")
                        }
                      />
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditProfile} onClose={() => setOpenEditProfile(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "#1565c0", color: "#fff" }}>
          Edit Profile — {application.first_name} {application.last_name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Correct any personal details below. Only changed fields will be saved.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { key: "first_name", label: "First Name" },
              { key: "last_name", label: "Last Name" },
              { key: "middle_name", label: "Middle Name" },
              { key: "date_of_birth", label: "Date of Birth", type: "date" },
              { key: "gender", label: "Gender" },
              { key: "nationality", label: "Nationality" },
              { key: "phone", label: "Phone" },
              { key: "email", label: "Email" },
              { key: "address", label: "Address" },
              { key: "nin", label: "NIN" },
              { key: "passport_number", label: "Passport Number" },
              { key: "next_of_kin_name", label: "Next of Kin Name" },
              { key: "next_of_kin_contact", label: "Next of Kin Contact" },
              { key: "next_of_kin_relationship", label: "Next of Kin Relationship" },
            ].map(({ key, label, type }) => (
              <TextField
                key={key}
                size="small"
                label={label}
                type={type || "text"}
                value={editForm[key] || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                slotProps={type === "date" ? { inputLabel: { shrink: true } } : undefined}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProfile(false)} disabled={savingProfile}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditProfile}
            disabled={savingProfile}
            sx={{ bgcolor: "#1565c0" }}
          >
            {savingProfile ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ApplicationReview
