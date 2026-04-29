"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  SwapHoriz as SwapHorizIcon,
  Edit as EditIcon,
} from "@mui/icons-material"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Checkbox, FormControlLabel, FormGroup,
  Select, MenuItem, InputLabel, FormControl,
} from "@mui/material"
import PassportPhotoSection from './passport'
import EducationalBackgroundSection from './education-background'
import { useLocation, useNavigate } from "react-router-dom"
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
  const [openReject, setOpenReject] = useState(false)
  const [openEditProfile, setOpenEditProfile] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [openChangeProgramme, setOpenChangeProgramme] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  const [selectedCampus, setSelectedCampus] = useState<number | "">("")
  const [changeNote, setChangeNote] = useState("")
  const [changingProgramme, setChangingProgramme] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const AxiosInstance = useAxios()
  const returnTo = (location.state as any)?.returnTo || "/admin/application_list"
  const locationWarning = (location.state as any)?.warning || null

  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(
    // Only show the "must be approved" warning if the application is genuinely
    // not yet approved. If we got the warning but the app is already accepted,
    // it's stale (e.g. user approved elsewhere) and would just confuse them.
    locationWarning && (application?.status || "").toLowerCase() !== "accepted"
      ? { message: locationWarning, type: "error" }
      : null
  )
  const [currentStatus, setCurrentStatus] = useState(application?.status || "submitted")

  useEffect(() => {
    setCurrentStatus(application?.status || "submitted")
  }, [application?.status])

  // Clear any stale "must be approved" warning the moment the app becomes accepted.
  useEffect(() => {
    if ((currentStatus || "").toLowerCase() === "accepted" && notification?.type === "error") {
      setNotification(null)
    }
  }, [currentStatus, notification])


  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const getStatusLabel = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
        return "Approved"
      case "under_review":
        return "Under Review"
      case "admitted":
        return "Admitted"
      case "submitted":
        return "Submitted"
      case "rejected":
        return "Rejected"
      default:
        return status || "Unknown"
    }
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

  const getStatusIcon = (status: string) => {
    if (["accepted", "admitted"].includes((status || "").toLowerCase())) return <CheckCircleIcon />
    return <WarningIcon />
  }

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await AxiosInstance.patch(`/api/admissions/change_applicatio_status/${application.id}`, { status: "accepted" });
      setCurrentStatus("accepted")
      window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { id: application.id, status: "accepted" } }))
      showNotification("Application approved. You can now admit the student or return to the list.", "success");
    } catch (err: any) {
      showNotification(err?.response?.data?.detail || "Failed to approve application", "error");
    } finally {
      setIsLoading(false);
    }
  };

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

    setCurrentStatus("rejected")
    setIsLoading(false);
    showNotification("Application has been successfully rejected", "success");

    // Optional: Refresh or navigate after success
    setTimeout(() => {
      navigate(returnTo);
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

  const handleChangeProgramme = async () => {
    if (selectedPrograms.length === 0) return
    setChangingProgramme(true)
    try {
      const res = await AxiosInstance.patch(`/api/admissions/change_programme/${application.id}`, {
        program_ids: selectedPrograms,
        campus_id: selectedCampus || undefined,
        note: changeNote,
      })
      showNotification(res.data.detail, "success")
      setOpenChangeProgramme(false)
      setTimeout(() => window.location.reload(), 800)
    } catch (err: any) {
      showNotification(err?.response?.data?.detail || "Failed to change programme", "error")
    } finally {
      setChangingProgramme(false)
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
                    {application.first_name} {application.last_name} {application.middle_name}
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
                {/* Program Choices */}
                {application?.programs?.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">
                      Program Choice(s)
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                      {application.programs.map((p: any, i: number) => (
                        <Chip
                          key={p.id}
                          label={`${i + 1}. ${p.name}`}
                          size="small"
                          sx={{ backgroundColor: "#0D0060", color: "#fff", fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
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
                  <Typography variant="body2" sx={{ fontWeight: 600, color:"#c9672e" }}>
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
                    <Typography variant="body2" sx={{ fontWeight: 600, color:"#e95656" }}>
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
                  {getStatusIcon(currentStatus)}
                  <Chip
                    label={getStatusLabel(currentStatus)}
                    color={getStatusColor(currentStatus) as any}
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
                  School Pay Reference
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {application.school_pay_reference || "—"}
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

              {application.entered_by && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Entered By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {application.entered_by}
                    </Typography>
                  </Box>
                </>
              )}

              <Divider />

              <Button
                variant="outlined"
                fullWidth
                startIcon={<EditIcon />}
                disabled={(currentStatus || "").toLowerCase() === 'admitted'}
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

              <Divider />

              <Button
                variant="outlined"
                fullWidth
                startIcon={<SwapHorizIcon />}
                onClick={() => {
                  setSelectedPrograms(application.programs?.map((p: any) => p.id) || [])
                  setSelectedCampus(application.campus_id || "")
                  setChangeNote("")
                  setOpenChangeProgramme(true)
                }}
                sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060" }}
              >
                Change Programme
              </Button>

              {(application.reviewed_by || application.reviewed_at) && (
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
                  {application.reviewed_at && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Review Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {new Date(application.reviewed_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              <Divider />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Actions
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>

                  {/* ── Admitted ── */}
                  {(currentStatus || "").toLowerCase() === "admitted" && (
                    <Chip
                      size="small"
                      color="success"
                      label="Application already admitted"
                      icon={<CheckCircleIcon />}
                    />
                  )}

                  {/* ── Rejected ── */}
                  {(currentStatus || "").toLowerCase() === "rejected" && (
                    <Chip size="small" color="error" label="Application rejected" />
                  )}

                  {/* ── Approved (accepted) — ready for admission ── */}
                  {(currentStatus || "").toLowerCase() === "accepted" && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => navigate(`/admin/admit_student/${application.id}`)}
                        sx={{
                          textTransform: "none",
                          bgcolor: "#0D0060",
                          "&:hover": { bgcolor: "#07003a" },
                          fontWeight: 600,
                        }}
                      >
                        Admit Student
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", borderColor: "#7c1519", color: "#7c1519" }}
                        onClick={() => setOpenReject(true)}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* ── Submitted / Under Review — Approve here, or Reject ── */}
                  {!["accepted", "admitted", "rejected"].includes((currentStatus || "").toLowerCase()) && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={isLoading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <CheckCircleIcon />}
                        disabled={isLoading}
                        onClick={handleApprove}
                        sx={{ textTransform: "none", bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isLoading}
                        sx={{ textTransform: "none", borderColor: "#7c1519", color: "#7c1519" }}
                        onClick={() => setOpenReject(true)}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                </Box>

                {/* Hint shown when not yet approved */}
                {!["accepted", "admitted", "rejected"].includes((currentStatus || "").toLowerCase()) && (
                  <Typography variant="caption" sx={{ color: "#888", mt: 1, display: "block" }}>
                    Approve to send for admission, or reject with a reason.
                  </Typography>
                )}
              </Box>
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

      {/* Change Programme Dialog */}
      <Dialog open={openChangeProgramme} onClose={() => setOpenChangeProgramme(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "#0D0060", color: "#fff" }}>
          Change Programme — {application.first_name} {application.last_name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Change campus and/or programme(s). Current values are pre-filled.
          </Typography>

          {/* Campus selector */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Campus</InputLabel>
            <Select
              value={selectedCampus}
              label="Campus"
              onChange={(e) => {
                setSelectedCampus(e.target.value as number)
                setSelectedPrograms([])
              }}
            >
              {application.batch_campuses?.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Programmes filtered by selected campus */}
          <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block" }}>
            Programmes at selected campus:
          </Typography>
          <FormGroup sx={{ maxHeight: 250, overflowY: "auto", border: "1px solid #e0e0e0", borderRadius: 1, p: 1 }}>
            {application.batch_programs
              ?.filter((p: any) => !selectedCampus || p.campus_ids.includes(selectedCampus))
              .map((p: any) => (
                <FormControlLabel
                  key={p.id}
                  control={
                    <Checkbox
                      checked={selectedPrograms.includes(p.id)}
                      onChange={(e) => {
                        setSelectedPrograms(prev =>
                          e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                        )
                      }}
                      sx={{ color: "#0D0060", "&.Mui-checked": { color: "#0D0060" } }}
                    />
                  }
                  label={p.name}
                />
              ))}
          </FormGroup>

          <TextField
            fullWidth
            size="small"
            label="Reason / Note (optional)"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangeProgramme(false)} disabled={changingProgramme}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleChangeProgramme}
            disabled={changingProgramme || selectedPrograms.length === 0}
            sx={{ bgcolor: "#0D0060" }}
          >
            {changingProgramme ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  )
}

export default ApplicationReview
