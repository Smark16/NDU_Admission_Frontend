"use client"
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Divider,
} from "@mui/material"
import BookIcon from "@mui/icons-material/Book"
import { Grid } from "@mui/system"
import { CheckCircleIcon } from "lucide-react"

interface EducationalBackgroundSectionProps {
  alevelresults: any[]
  olevelresults: any[]
  application: any
  additionalQualifications: any[]
}

export default function EducationalBackgroundSection({
  alevelresults,
  olevelresults,
  application,
  additionalQualifications
}: EducationalBackgroundSectionProps) {
  const gradeColors: Record<string, "success" | "primary" | "warning" | "error"> = {
    A: "success",
    B: "primary",
    C: "warning",
    D: "error",
    F: "error",
  }

  const renderLevelContainer = (level: string, results: any[], school: string, year: string, examType: string) => {
    if (!results || results.length === 0) return null

    return (
      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { backgroundColor: "action.hover" },
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              {level}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
              {school} • {year}
            </Typography>
          </Box>
          <Chip label={examType} size="small" variant="outlined" />
        </Box>

        {/* Subjects Table */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
            Subjects & Grades
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {results.map((result: any, index: number) => (
                  <TableRow key={result.id || index} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                    <TableCell sx={{ py: 1.5, px: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {result.subject.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: 1 }}>
                      {result.grade && (
                        <Chip label={result.grade} size="small" color={gradeColors[result.grade] || "default"} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    )
  }

  // aditional qualifications
  const renderAdditionalQualifications = () => {
    if (!additionalQualifications || additionalQualifications.length === 0) {
      return (
        <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
            No additional qualifications added.
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <CheckCircleIcon color="#5ba3f5" fontSize={20} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
            Additional Qualifications
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {additionalQualifications.map((qual: any, index: number) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e7f0",
                backgroundColor: "#ffffff",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
                  borderColor: "#5ba3f5",
                },
              }}
            >
              {/* Institution Name - Prominent */}
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                INSTITUTION
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#1a3a52",
                  mb: 2.5,
                  fontSize: "1.08rem"
                }}
              >
                {qual.additional_qualification_institution || "Unnamed Institution"}
              </Typography>

              <Divider sx={{ mb: 2.5 }} />

              {/* Details Grid - Clear Labels */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                    QUALIFICATION TYPE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
                    {qual.additional_qualification_type || "Not specified"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                    AWARD YEAR
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {qual.additional_qualification_year || "Not specified"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                    CLASS OF AWARD
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {qual.class_of_award || "Not specified"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      </Paper>
    );
  };


  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<BookIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Educational Background
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {olevelresults && olevelresults.length > 0 ? (
            renderLevelContainer(
              "O Level",
              olevelresults,
              application?.olevel_school || "Not specified",
              application?.olevel_year || "Not specified",
              "UCE",
            )
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
              No O Level results where Added by this Candidate
            </Typography>
          )}

          {alevelresults && alevelresults.length > 0 ? (
            renderLevelContainer(
              "A Level",
              alevelresults,
              application?.alevel_school || "Not specified",
              application?.alevel_year || "Not specified",
              "UACE",
            )
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
              No A Level results where Added by this Candidate
            </Typography>
          )}
          
          {/* additional qualifications */}
          <Divider sx={{ my: 1 }} />
          {renderAdditionalQualifications()}
        </Box>
      </CardContent>
    </Card>
  )
}
