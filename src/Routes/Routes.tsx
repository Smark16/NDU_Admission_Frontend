import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'

import Sidebar from '../Applicant/Sidebar/Sidebar'
import '../Routes/routes.css'
import PrivateRoute from '../PrivateRoutes/page'
import Logout from '../Auth/Logout'

const ApplicantDashboard = lazy(() => import('../Applicant/Dashboard/ApplicantDashboard'))
const NewApplication = lazy(() => import('../Applicant/NewApplication/NewApplication'))
const ApplicantProfile = lazy(() => import('../Applicant/Profile/ApplicantProfile'))
const Home = lazy(() => import('../Applicant/Detail/page'))
const Login = lazy(() => import('../Auth/Login'))
const Register = lazy(() => import('../Auth/Register'))
const ResetPasswordForm = lazy(() => import('../Auth/ResetPassword'))

function AppRoutes() {
  const location = useLocation()
  const drawerWidth = 0

  const LoadingSpinner = () => (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: 2000,
      }}
    >
      <CircularProgress size={50} thickness={4} sx={{ color: '#7c1519' }} />
    </Box>
  )

  const sidebarRoutes = [
    '/applicant/dashboard',
    '/applicant/new_application',
    '/applicant/detail/:id',
    '/applicant/profile',
    '/applicant/logout',
  ]

  const isSidebarRoute = sidebarRoutes.some((path) =>
    location.pathname.startsWith(path.replace(':id', '')),
  )

  return (
    <>
      <Routes>
        <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<LoadingSpinner />}><Register /></Suspense>} />
        <Route path="logout" element={<Logout />} />
        <Route path="/reset-password" element={<Suspense fallback={<LoadingSpinner />}><ResetPasswordForm /></Suspense>} />

        {isSidebarRoute && (
          <Route
            path="/applicant/*"
            element={
              <PrivateRoute>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Sidebar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                      ml: { xs: 0, md: `${drawerWidth}px` },
                      mt: { xs: '64px', md: 0 },
                      transition: 'margin 0.3s ease-in-out',
                    }}
                  >
                    <Routes>
                      <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><ApplicantDashboard /></Suspense>} />
                      <Route path="new_application" element={<Suspense fallback={<LoadingSpinner />}><NewApplication /></Suspense>} />
                      <Route path="detail/:id" element={<Suspense fallback={<LoadingSpinner />}><Home /></Suspense>} />
                      <Route path="profile" element={<Suspense fallback={<LoadingSpinner />}><ApplicantProfile /></Suspense>} />
                    </Routes>
                  </Box>
                </Box>
              </PrivateRoute>
            }
          />
        )}
      </Routes>
    </>
  )
}

export default AppRoutes
