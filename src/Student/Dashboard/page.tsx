"use client"

import { useEffect } from "react"
import { Container, Typography, Box } from "@mui/material"
import { School as SchoolIcon } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

export default function StudentDashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to student portal
    navigate("/student/portal", { replace: true })
  }, [navigate])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", py: 8 }}>
        <SchoolIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          Redirecting to Student Portal...
        </Typography>
      </Box>
    </Container>
  )
}

