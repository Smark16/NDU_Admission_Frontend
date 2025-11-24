"use client"
import { Card, CardContent, CardHeader, Typography, Box, Button, useTheme, useMediaQuery } from "@mui/material"
import ImageIcon from "@mui/icons-material/Image"
import DownloadIcon from "@mui/icons-material/Download"

interface PassportPhotoSectionProps {
  application: any
}

export default function PassportPhotoSection({ application }: PassportPhotoSectionProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  if (!application?.passport_photo) return null

  const downloadPhoto = async () => {
  if (!application?.passport_photo) return;

  const url = `${import.meta.env.VITE_API_BASE_URL}${application.passport_photo}`;
  
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Network response was not ok");
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "passport-photo.jpg"; // give proper extension
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Failed to download photo:", error);
  }
};

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<ImageIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Passport Photo
          </Typography>
        }
      />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 300,
              aspectRatio: "1",
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <img
              src={`http://127.0.0.1:8000${application?.passport_photo}` || "/placeholder.svg"}
              alt="Passport Photo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
          <Button
            fullWidth={isMobile}
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={downloadPhoto}
          >
            Download Photo
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
