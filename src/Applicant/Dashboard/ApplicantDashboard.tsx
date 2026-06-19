"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Box,
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
  // GetApp as DownloadIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import useHook from "../../Hooks/useHook";
import useAxios from "../../AxiosInstance/UseAxios";
import CustomButton from "../../ReUsables/custombutton";
import ProgramChoiceConfirmation from "../Detail/ProgramChoiceConfirmation";

interface Application {
  id: number;
  program: string;
  application_status: "accepted" | "rejected" | "submitted" | "pending" | "under_review" | "Admitted" | "draft";
  batch: string | null;
  campus: string | null;
  admission_letter_pdf?: string;
  applied_date: string;
  has_admission: boolean;
  student_id?: string | null;
  program_choices_confirmed_at?: string | null;
}

interface DraftInfo {
  draft_exists: boolean;
  last_updated?: string;
}

const ApplicantDashboard: React.FC = () => {
  const [application, setApplication] = useState<Application | null>(null);
  const [draft, setDraft] = useState<DraftInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { batch, batchError } = useHook();
  const AxiosInstance = useAxios();

  const getStatusLabel = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
        return "APPROVED";
      case "under_review":
        return "UNDER REVIEW";
      default:
        return (status || "UNKNOWN").replace("_", " ").toUpperCase();
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "info" | "warning" => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
      case "admitted":
        return "success";
      case "rejected":
        return "error";
      case "under_review":
        return "warning";
      default:
        return "info";
    }
  };

  // Fetch both submitted application and draft
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch submitted application
      const appRes = await AxiosInstance.get("/api/admissions/dashboard").catch(() => null);

      if (appRes?.data) {
        setApplication({
          id: appRes.data.id,
          program: appRes.data.program || "Not assigned",
          application_status: appRes.data.application_status,
          batch: appRes.data.batch,
          campus: appRes.data.campus,
          admission_letter_pdf: appRes.data.admission_letter_pdf,
          applied_date: appRes.data.applied_date,
          has_admission: appRes.data.has_admission || false,
          student_id: appRes.data.student_id,
          program_choices_confirmed_at: appRes.data.program_choices_confirmed_at,
        });
      }

      // Fetch draft info
      const draftRes = await AxiosInstance.get("/api/drafts/get_draft_info/");
      setDraft(draftRes.data);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Application
        </Typography>
      </Box>

      {/* ==================== HAS SUBMITTED APPLICATION ==================== */}
      {application && application.application_status !== "draft" ? (
        <>
        {(application.application_status === "submitted" ||
          application.application_status === "under_review") &&
          !application.program_choices_confirmed_at &&
          application.id && (
          <Box sx={{ maxWidth: 850, mx: "auto", mb: 3 }}>
            <ProgramChoiceConfirmation applicationId={application.id} onConfirmed={fetchData} />
          </Box>
        )}
        <Card sx={{ maxWidth: 850, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
          <CardHeader
            title={application.program}
            action={
              <Chip
                label={getStatusLabel(application.application_status)}
                color={getStatusColor(application.application_status)}
              />
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Batch</Typography>
                <Typography variant="body1">{application.batch || "Pending"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Campus</Typography>
                <Typography variant="body1">{application.campus || "Pending"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Applied Date</Typography>
                <Typography variant="body1">
                  {new Date(application.applied_date).toLocaleDateString()}
                </Typography>
              </Grid>
              {application.student_id && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
                  <Typography variant="body1" fontWeight={600}>{application.student_id}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>

          <Box sx={{ p: 2, bgcolor: "#f8f9fa", display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Link to={`/applicant/detail/${application.id}`}>
              <CustomButton icon={<ViewIcon />} text="View Details" />
            </Link>

            {/* {application.has_admission && application.admission_letter_pdf && (
              <a
                href={`${import.meta.env.VITE_API_BASE_URL}${application.admission_letter_pdf}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CustomButton icon={<DownloadIcon />} text="Download Offer Letter" variant="contained" />
              </a>
            )} */}
          </Box>
        </Card>
        </>
      ) : (
        /* ==================== NO SUBMITTED APPLICATION ==================== */
        <>
          {draft?.draft_exists ? (
            /* Has Saved Draft */
            <Paper
              sx={{
                p: 5,
                textAlign: "center",
                border: "2px dashed #3e397b",
                borderRadius: 3,
                backgroundColor: "#f8f9ff",
              }}
            >
              <Typography variant="h5" sx={{ color: "#3e397b", mb: 1 }}>
                You have a saved draft
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You started an application earlier. Would you like to continue?
              </Typography>

              <Link to="/applicant/new_application">
                <CustomButton
                  icon={<EditIcon />}
                  text="Resume Application"
                  variant="contained"
                  size="large"
                />
              </Link>

              <Typography variant="caption" sx={{ mt: 3, display: "block", color: "#666" }}>
                Last saved: {draft.last_updated ? new Date(draft.last_updated).toLocaleString() : "Recently"}
              </Typography>
            </Paper>
          ) : (
            /* No Application & No Draft */
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
              <Typography variant="h5" sx={{ color: "#6b7280", mb: 1 }}>
                No Application Yet
              </Typography>
              <Typography variant="body1" sx={{ color: "#9ca3af", mb: 4 }}>
                Creating an account does not submit an application. Use the button below to start the form, then complete all steps and pay the application fee to submit.
              </Typography>

              {batch?.is_active ? (
                <Link to="/applicant/new_application">
                  <CustomButton icon={<AddIcon />} text="Start New Application" />
                </Link>
              ) : batchError ? (
                <Typography color="text.secondary">{batchError}</Typography>
              ) : (
                <Typography color="text.secondary">Applications are currently closed.</Typography>
              )}
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default ApplicantDashboard;
