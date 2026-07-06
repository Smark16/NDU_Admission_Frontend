"use client"
import { Container, Grid, Box, Typography, Chip, AppBar, Toolbar} from "@mui/material"
import PersonalInfoSection from "./personal-info"
import AcademicInfoSection from "./academin-info"
import EducationalBackgroundSection from "./educational-background"
import DocumentsSection from "./documents"
import PassportPhotoSection from "./passport-photo"
import StatusSection from "./status"
import ActionsSection from "./actions"
import ProgramChoiceConfirmation from "./ProgramChoiceConfirmation"

interface ApplicationDetailProps {
  application: {
    id: number
    first_name?: string
    last_name?: string
    status?: string
    batch?: { name?: string }
  } | null
  olevelresults: unknown[]
  alevelresults: unknown[]
  documents: Array<{
    id: number
    uploaded_at: string
    file?: string | File | null
    file_url?: string
    name?: string
    document_type?: string
  }>
  program_choices: unknown[]
  additionalQualifications: unknown[]
  onUpdate?: () => void | Promise<void>
}

export default function ApplicationDetail({ application, olevelresults,  alevelresults, documents, program_choices, additionalQualifications, onUpdate }: ApplicationDetailProps) {
  if (!application) return null

  const statusKey = application.status || ""
 
  const statusColors: Record<string, "success" | "error" | "info" | "warning"> = {
    accepted: "success",
    admitted: "success",
    rejected: "error",
    submitted: "info",
    under_review: "warning",
    draft: "warning",
  }

  const getStatusLabel = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
        return "Approved"
      case "under_review":
        return "Under Review"
      default:
        return (status || "Unknown").replace("_", " ")
    }
  }

  return (
    <>
      {/* Header AppBar */}
      <AppBar position="static" sx={{ background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)" }}>
        <Toolbar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Application Details
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(statusKey)}
            color={statusColors[statusKey] || "default"}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
          >
            {application?.first_name} {application?.last_name}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
            Application for <strong>{application.batch?.name || "N/A"}</strong>
          </Typography>
        </Box>

        {/* Main Grid Layout - Responsive */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Main Content Area */}
          <Grid size={{xs:12, md:8}}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
              <ProgramChoiceConfirmation applicationId={application.id} />
              <PersonalInfoSection application={application} />
              <AcademicInfoSection application={application} program_choices={program_choices} />
              <EducationalBackgroundSection alevelresults={alevelresults} olevelresults={olevelresults} application={application} additionalQualifications={additionalQualifications} />
              <DocumentsSection documents={documents} application={application} onUpdate={onUpdate} />
              <PassportPhotoSection application={application} />
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid size={{xs:12, md:4}}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
              <StatusSection application={application} />
              <ActionsSection />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
