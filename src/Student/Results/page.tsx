"use client"

import { Box, Card, CardContent, Typography } from "@mui/material"
import { Grade as GradeIcon } from "@mui/icons-material"

/** Placeholder until the examinations module is wired to this portal. */
export default function StudentResultsPage() {
  return (
    <Box sx={{ p: 2, maxWidth: 720 }}>
      <Card>
        <CardContent>
          <GradeIcon sx={{ fontSize: 40, color: "action.disabled", mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Academic results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Official grades and transcripts will be available here once the examinations service is connected.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
