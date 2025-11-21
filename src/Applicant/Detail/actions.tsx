"use client"
import { Card, CardContent, CardHeader, Typography, Stack, Button } from "@mui/material"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

interface ActionsSectionProps {
  application: any
}

export default function ActionsSection({ application }: ActionsSectionProps) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Card sx={{ boxShadow: 1 }}>
      <CardHeader
        avatar={<MoreVertIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Actions
          </Typography>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          {application?.status === "accepted" && (
            <Button fullWidth variant="contained" color="success" startIcon={<FileDownloadIcon />}>
              Download Offer Letter
            </Button>
          )}

          <Button fullWidth variant="outlined" startIcon={<ArrowBackIcon />}>
            Back to Dashboard
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
