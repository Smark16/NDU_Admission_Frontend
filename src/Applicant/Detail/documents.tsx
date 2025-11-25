"use client"
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material"
import FileIcon from "@mui/icons-material/Description"
// import DownloadIcon from "@mui/icons-material/Download"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"

interface DocumentsSectionProps {
  documents: any[]
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  console.log('document', documents)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<FileIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Documents
          </Typography>
        }
      />
      <CardContent>
        {documents.length > 0 ? (
          <Grid container spacing={2}>
            {documents.map((doc: any) => (
              <Grid size={{xs:12, sm:6}} key={doc.id}>
                <Paper
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <FileIcon sx={{ color: "primary.main", fontSize: 20 }} />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {new Date(doc.uploaded_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>

                    <Typography variant="h6">
                      <Chip label={doc.document_type} size="small" />
                    </Typography>
                  </Box>

                  <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<OpenInNewIcon />}
                      // onClick={() => openInNewTab(`${import.meta.env.VITE_API_BASE_URL}${doc.file}`)}
                      onClick={() => openInNewTab(`${doc.file_url}`)}
                      fullWidth={isMobile}
                      sx={{ flex: 1 }}
                    >
                      View File
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
            No documents uploaded yet
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
