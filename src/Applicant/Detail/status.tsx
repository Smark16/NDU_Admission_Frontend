"use client"
import { Card, CardContent, CardHeader, Typography, Box, Alert, Divider} from "@mui/material"
import type React from "react"

import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ScheduleIcon from "@mui/icons-material/Schedule"
import CancelIcon from "@mui/icons-material/Cancel"
import InfoIcon from "@mui/icons-material/Info"

interface StatusSectionProps {
  application: any
}

export default function StatusSection({ application }: StatusSectionProps) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const statusIcons: Record<string, React.ReactNode> = {
    accepted: <CheckCircleIcon sx={{ color: "success.main" }} />,
    submitted: <ScheduleIcon sx={{ color: "info.main" }} />,
    rejected: <CancelIcon sx={{ color: "error.main" }} />,
    draft: <ScheduleIcon sx={{ color: "warning.main" }} />,
  }

  const InfoField = ({
    label,
    value,
  }: {
    label: string
    value: React.ReactNode
  }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  )

  return (
    <Card sx={{ boxShadow: 1, position: { md: "sticky" }, top: { md: 20 } }}>
      <CardHeader
        avatar={statusIcons[application?.status] || statusIcons.draft}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Status Details
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <InfoField label="Application Fee" value={application?.application_fee_amount} />

          <Divider />

          <InfoField
            label="Submitted On"
            value={new Date(application?.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />

          {application?.reviewed_by && (
            <>
              <Divider />
              <InfoField label="Reviewed By" value={application?.reviewed_by?.first_name && application.reviewed_by?.last_name ?
                        `${application?.reviewed_by?.first_name} ${application?.reviewed_by?.first_name}`
                        : application?.reviewed_by?.username} />
              <InfoField
                label="Reviewed On"
                value={new Date(application?.reviewed_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </>
          )}

          {application?.review_notes && (
            <>
              <Divider />
              <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Review Notes
                </Typography>
                <Typography variant="body2">{application?.review_notes}</Typography>
              </Alert>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
