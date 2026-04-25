"use client"

import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { CircularProgress, Box } from "@mui/material"
import useAxios from "../AxiosInstance/UseAxios"

interface ApplicantRouteProps {
  children: React.ReactNode
}

export default function ApplicantRoute({ children }: ApplicantRouteProps) {
  const location = useLocation()
  const AxiosInstance = useAxios()
  const [isChecking, setIsChecking] = useState(true)
  const [isStudent, setIsStudent] = useState(false)

  useEffect(() => {
    const checkStudentStatus = async () => {
      try {
        const response = await AxiosInstance.get("/api/admissions/check_student_status")
        if (response.data?.is_admitted_student === true) {
          setIsStudent(true)
        } else {
          setIsStudent(false)
        }
      } catch (err) {
        setIsStudent(false)
      } finally {
        setIsChecking(false)
      }
    }
    checkStudentStatus()
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

  if (isStudent) {
    // Redirect to student portal if they are a student
    return <Navigate to="/student/portal" state={{ from: location }} replace />
  }

  return <>{children}</>
}

