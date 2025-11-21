"use client"
import type React from "react"
import { Card, CardContent, CardHeader, Typography, Grid, Box } from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
// import { useTheme, useMediaQuery } from "@mui/material"

interface PersonalInfoSectionProps {
  application: any
}

export default function PersonalInfoSection({ application }: PersonalInfoSectionProps) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const InfoField = ({
    label,
    value,
    icon,
  }: {
    label: string
    value: string
    icon?: React.ReactNode
  }) => (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      {icon && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "primary.main",
            mt: 0.5,
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<PersonIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Personal Information
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="Full Name" value={`${application?.first_name} ${application?.last_name}`} />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoField
              label="Date of Birth"
              value={new Date(application?.date_of_birth).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="Gender" value={application?.gender} />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="Nationality" value={application?.nationality} />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="Phone" value={application?.phone} icon={<PhoneIcon sx={{ fontSize: 18 }} />} />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <InfoField label="Email" value={application?.email} icon={<EmailIcon sx={{ fontSize: 18 }} />} />
          </Grid>
          <Grid size={{xs:12}}>
            <InfoField label="Address" value={application?.address} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
