"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Description as FileTextIcon,
  Edit as EditIcon,
  AccessTime as ClockIcon,
} from "@mui/icons-material";
// import { Payment } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import useHook from "../../Hooks/useHook";
import useAxios from "../../AxiosInstance/UseAxios";
import CustomButton from "../../ReUsables/custombutton";
// import PaymentModal from "./PaymentModal";

// Single application type (not array)
interface Application {
  id: number | null;
  program: string;
  application_status: "accepted" | "rejected" | "submitted" | "pending" | "draft";
  batch: string | null;
  campus: string | null;
  admission_letter_pdf: string | null;
  applied_date: string;
  has_admission: boolean;
  student_id: string | null;
  // draft-only fields
  draft_id?: number;
  last_saved?: string;
  applicant_name?: string | null;
  programs?: string[];
}

const ApplicantDashboard: React.FC = () => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { batch } = useHook();
  const AxiosInstance = useAxios();

  // payment modal handlers
  // const handleOpenPaymentModal = () => {
  //   setPaymentModalOpen(true);
  // }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      case "submitted":
        return "info";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Fetch single application
  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get("/api/admissions/dashboard");
      console.log("Application data:", response.data);

      // Normalize keys (your backend uses snake_case)
      const data: Application = {
        id: response.data.id,
        program: response.data.program || "Not assigned",
        application_status: response.data.application_status,
        batch: response.data.batch || null,
        campus: response.data.campus || null,
        admission_letter_pdf: response.data.admission_letter_pdf,
        applied_date: response.data.applied_date,
        has_admission: response.data.has_admission || false,
        student_id: response.data.student_id || null,
      };

      setApplication(data);
    } catch (err: any) {
      console.error("Failed to fetch application:", err);
      if (err.response?.status === 404) {
        setApplication(null); // No application yet
      }
    } finally {
      setLoading(false);
    }
  };

  console.log(application)
  useEffect(() => {
    fetchApplication();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Loading your application...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 3,
          borderBottom: "2px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
          My Application
        </Typography>

        {batch?.is_active && (
          <Link to="/applicant/new_application">
            <CustomButton text='New Application' icon={<AddIcon />} />
          </Link>
        )}
      </Box>

      {/* ── Draft in progress ── */}
      {application?.application_status === "draft" ? (
        <Card
          sx={{
            maxWidth: 800,
            mx: "auto",
            border: "2px dashed #f57c00",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(245,124,0,0.10)",
          }}
        >
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#e65100" }}>
                Application Draft — Not Yet Submitted
              </Typography>
            }
            action={
              <Chip label="Draft" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 700 }} />
            }
            sx={{ bgcolor: "#fff8f0", borderBottom: "1px dashed #f57c00" }}
          />

          <CardContent sx={{ py: 3 }}>
            <Grid container spacing={3}>
              {application.applicant_name && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Name on application
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {application.applicant_name}
                  </Typography>
                </Grid>
              )}

              {application.campus && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Campus
                  </Typography>
                  <Typography variant="body1">{application.campus}</Typography>
                </Grid>
              )}

              {application.programs && application.programs.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Programme choices
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {application.programs.map((p, i) => (
                      <Chip key={i} label={p} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              )}

              {application.last_saved && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ClockIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      Last saved: {new Date(application.last_saved).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>

          <Box
            sx={{
              p: 2,
              bgcolor: "#fff8f0",
              borderTop: "1px dashed #f57c00",
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate("/applicant/new_application")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#f57c00",
                "&:hover": { bgcolor: "#e65100" },
              }}
            >
              Continue Application &amp; Pay
            </Button>
          </Box>
        </Card>

      ) : application ? (
        /* ── Submitted / admitted application ── */
        <Card
          sx={{
            maxWidth: 800,
            mx: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
              transform: "translateY(-4px)",
            },
          }}
        >
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                {application.program}
              </Typography>
            }
            action={
              <Chip
                label={getStatusLabel(application.application_status)}
                color={getStatusColor(application.application_status) as any}
                sx={{ fontWeight: 600 }}
              />
            }
            sx={{ bgcolor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}
          />

          <CardContent sx={{ py: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Batch
                </Typography>
                <Typography variant="body1">
                  {application.batch || "Pending assignment"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Campus
                </Typography>
                <Typography variant="body1">{application.campus}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Applied Date
                </Typography>
                <Typography variant="body1">
                  {new Date(application.applied_date).toLocaleDateString()}
                </Typography>
              </Grid>

              {application.student_id && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Student ID
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {application.student_id}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>

          <Box
            sx={{
              p: 2,
              bgcolor: "#f8f9fa",
              borderTop: "1px solid #e9ecef",
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Link to={`/applicant/detail/${application.id}`}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<ViewIcon />}
                sx={{
                  textTransform: "none",
                  borderColor: "#5ba3f5",
                  color: "#5ba3f5",
                  fontWeight: 600,
                }}
              >
                View Details
              </Button>
            </Link>

            {(application.has_admission && application.admission_letter_pdf) && (
              <Button
                component="a"
                href={`${import.meta.env.VITE_API_BASE_URL}${application.admission_letter_pdf}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Download Offer Letter
              </Button>
            )}
          </Box>
        </Card>
      ) : (
        /* No Application Yet */
        <Paper
          sx={{
            py: 8,
            px: 4,
            textAlign: "center",
            backgroundColor: "#f9fafb",
            border: "2px dashed #e5e7eb",
            borderRadius: "12px",
          }}
        >
          <FileTextIcon sx={{ fontSize: 80, color: "#d1d5db", mb: 2 }} />
          <Typography variant="h5" sx={{ color: "#6b7280", fontWeight: 600, mb: 1 }}>
            No Application Yet
          </Typography>

          {batch?.is_active ? (
            <>
              <Typography variant="body1" sx={{ color: "#9ca3af", mb: 3 }}>
                Start your admission journey by creating your first application.
              </Typography>
              <Link to="/applicant/new_application">
              <CustomButton icon={<AddIcon />} text="create Application"/>
              </Link>
            </>
          ) : (
            <Typography variant="body1" sx={{ color: "#9ca3af" }}>
              Applications are currently closed. Please check back later.
            </Typography>
          )}
        </Paper>
      )}

      {/* <PaymentModal 
      open={paymentModalOpen} 
      onClose={() => setPaymentModalOpen(false)} 
      /> */}
    </Container>
  );
};

export default ApplicantDashboard;