"use client"

import { Box, Card, CardContent, Typography } from "@mui/material"
import { Assignment as AssignmentIcon } from "@mui/icons-material"

/** Placeholder until the examinations module is wired to this portal. */
export default function LecturerEnterScoresPage() {
  return (
    <Box sx={{ p: 2, maxWidth: 720 }}>
      <Card>
        <CardContent>
          <AssignmentIcon sx={{ fontSize: 40, color: "action.disabled", mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Enter scores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coursework and exam marks entry will be available here once the examinations service is connected.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
