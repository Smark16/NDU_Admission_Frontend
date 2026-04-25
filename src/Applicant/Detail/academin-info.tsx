"use client"
import { Card, CardContent, CardHeader, Typography, Grid, Box } from "@mui/material"
import SchoolIcon from "@mui/icons-material/School"

interface AcademicInfoSectionProps {
  application: any
}

export default function AcademicInfoSection({ application }: AcademicInfoSectionProps) {
  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  )

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<SchoolIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Academic Information
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={{ xs: 2, md: 3 }}>
      
  
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="Batch" value={application?.batch?.name || "To be assigned"} />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="O-Level School" value={application?.olevel_school} />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="O-Level Year" value={application?.olevel_year.toString()} />
          </Grid>
          {application?.alevel_school && (
            <>
              <Grid size={{xs:12, sm:6}}>
                <InfoField label="A-Level School" value={application?.alevel_school} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoField label="A-Level Year" value={application?.alevel_year.toString()} />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
