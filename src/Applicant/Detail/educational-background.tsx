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
} from "@mui/material"
import BookIcon from "@mui/icons-material/Book"

interface EducationalBackgroundSectionProps {
  alevelresults: any[]
  olevelresults: any[]
  application: any
}

export default function EducationalBackgroundSection({
  alevelresults,
  olevelresults,
  application,
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
              No O Level results added yet
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
              No A Level results added yet
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
