"use client"
import { Container, Grid, Box, Typography, Chip, AppBar, Toolbar} from "@mui/material"
import PersonalInfoSection from "./personal-info"
import AcademicInfoSection from "./academin-info"
import EducationalBackgroundSection from "./educational-background"
import DocumentsSection from "./documents"
import PassportPhotoSection from "./passport-photo"
import StatusSection from "./status"
import ActionsSection from "./actions"

interface ApplicationDetailProps {
  application: any
  olevelresults: any[]
  alevelresults: any[]
  documents: any[]
}

export default function ApplicationDetail({ application, olevelresults,  alevelresults, documents }: ApplicationDetailProps) {
  // const theme = useTheme()
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const statusColors: Record<string, "success" | "error" | "info" | "warning"> = {
    accepted: "success",
    rejected: "error",
    submitted: "info",
    draft: "warning",
  }

  console.log('application', olevelresults)

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
            label={application?.status}
            color={statusColors[application?.status] || "default"}
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
            Application for <strong>{application?.batch.name}</strong>
          </Typography>
        </Box>

        {/* Main Grid Layout - Responsive */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Main Content Area */}
          <Grid size={{xs:12, md:8}}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
              <PersonalInfoSection application={application} />
              <AcademicInfoSection application={application} />
              <EducationalBackgroundSection alevelresults={alevelresults} olevelresults={olevelresults} application={application} />
              <DocumentsSection documents={documents} />
              <PassportPhotoSection application={application} />
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid size={{xs:12, md:4}}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
              <StatusSection application={application} />
              <ActionsSection application={application} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
