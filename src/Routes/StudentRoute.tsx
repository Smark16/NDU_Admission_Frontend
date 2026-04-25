"use client"

import { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { AuthContext } from "../Context/AuthContext"

interface StudentRouteProps {
  children: React.ReactNode
}

export default function StudentRoute({ children }: StudentRouteProps) {
  const location = useLocation()
  const { loggeduser } = useContext(AuthContext) || {}

  // Student users have is_student=true in their JWT
  // Redirect anyone who isn't a student back to their correct portal
  if (!loggeduser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!loggeduser.is_student) {
    return <Navigate to="/applicant/dashboard" state={{ from: location }} replace />
  }

  return <>{children}</>
}
