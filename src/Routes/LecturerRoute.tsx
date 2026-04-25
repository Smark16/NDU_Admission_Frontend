"use client"

import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { CircularProgress, Box, Alert } from "@mui/material"
import useAxios from "../AxiosInstance/UseAxios"

interface LecturerRouteProps {
  children: React.ReactNode
}

export default function LecturerRoute({ children }: LecturerRouteProps) {
  const location = useLocation()
  const AxiosInstance = useAxios()
  const [isChecking, setIsChecking] = useState(true)
  const [isLecturer, setIsLecturer] = useState(false)

  useEffect(() => {
    const checkLecturerStatus = async () => {
      try {
        const response = await AxiosInstance.get("/api/program/lecturer/check_status")
        console.log("Lecturer status check response:", response.data)
        
        if (response.data?.is_lecturer === true) {
          setIsLecturer(true)
        } else {
          console.log("User is not a lecturer or check returned false")
          setIsLecturer(false)
        }
      } catch (err: any) {
        console.error("Error checking lecturer status:", err)
        console.error("Error response:", err.response?.data)
        // Don't redirect on error - let the user stay if they're already on lecturer routes
        // Only redirect if we're certain they're not a lecturer
        setIsLecturer(false)
      } finally {
        setIsChecking(false)
      }
    }
    checkLecturerStatus()
  }, [AxiosInstance])

  if (isChecking) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isLecturer) {
    // Only redirect if we're not already on a lecturer route (avoid redirect loops)
    // Check if the current path starts with /lecturer
    if (!location.pathname.startsWith('/lecturer')) {
      return <Navigate to="/applicant/dashboard" state={{ from: location }} replace />
    }
    // If already on lecturer route but check failed, show error instead of redirecting
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          You don't have lecturer access. Please contact administration if you believe this is an error.
        </Alert>
        <Navigate to="/applicant/dashboard" state={{ from: location }} replace />
      </Box>
    )
  }

  return <>{children}</>
}

