import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CircularProgress, Box, useTheme, useMediaQuery } from '@mui/material'

import Sidebar from '../Applicant/Sidebar/Sidebar'
import Sidebar1 from '../Admin/Sidebar/page'
import '../Routes/routes.css'
import PrivateRoute from '../PrivateRoutes/page'
import Logout from '../Auth/Logout'

const ApplicantDashboard = lazy(() => import('../Applicant/Dashboard/ApplicantDashboard'))
const NewApplication = lazy(() => import('../Applicant/NewApplication/NewApplication'))
const ApplicantProfile = lazy(() => import('../Applicant/Profile/ApplicantProfile'))
const Home = lazy(() => import('../Applicant/Detail/page'))
const Login = lazy(() => import('../Auth/Login'))
const Register = lazy(() => import('../Auth/Register'))

// admin routes
const UserManagement = lazy(() => import('../Admin/UserManagement/page'))
const CampusManagement = lazy(() => import('../Admin/Campus/page'))
const AdmissionDashboard = lazy(() => import('../Admin/Admissions/Dashboard/page'))
const AdmitStudentPage = lazy(() => import('../Admin/Admissions/AdmitStudent/page'))
const AdmittedStudents = lazy(() => import('../Admin/Admissions/AdmittedStudent/page'))
const ApplicationList = lazy(() => import('../Admin/Admissions/ApplicationList/page'))
const BatchManagement = lazy(() => import('../Admin/Admissions/Intake/page'))
const FacultyManagement = lazy(() => import('../Admin/Faculty/page'))
const ProgramManagement = lazy(() => import('../Admin/Faculty/Program/page'))
const ReviewPage = lazy(() => import('../Admin/Admissions/ApplicationList/Review/page'))
const SetUpPage = lazy(() => import('../Admin/Admissions/Setup/page'))
const AdmissionsReport = lazy(() => import('../Admin/Admissions/AdmissionReports/page'))
const AddGroupDialog = lazy(() => import('../Admin/UserManagement/roles_permissions'))
const FeeManagement = lazy(() => import('../Admin/Admissions/FeeManagement/page'))
const AcademicLevels = lazy(() => import('../Admin/Admissions/AcademicLevels/page'))
const AuditLogs = lazy(()=>import('../Admin/AuditLogs/page'))

function AppRoutes() {
  const location = useLocation()
  const drawerWidth = 0
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

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
      <CircularProgress
        size={50}
        thickness={4}
      />
    </Box>
  );

  // Define routes that should use SidebarLayout
  const sidebarRoutes = [
    "/applicant/dashboard",
    "/applicant/new_application",
    "/applicant/detail/:id",
    "/applicant/profile",
    "/applicant/logout"
  ];

  // Check if current route should show sidebar
  const isSidebarRoute = sidebarRoutes.some((path) =>
    location.pathname.startsWith(path.replace(":id", "")) // match /election_details/123
  );

  return (
    <>
      <Routes>
        <Route path='/' element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
        <Route path='/register' element={<Suspense fallback={<LoadingSpinner />}><Register /></Suspense>} />
        <Route path='logout' element={<Logout />} />

        {/* Applicant */}
        {isSidebarRoute && (
          <Route path='/applicant/*' element={
            <PrivateRoute>
              <Box sx={{ display: "flex", minHeight: "100vh" }}>
                <Sidebar />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
                    ml: { xs: 0, md: `${drawerWidth}px` }, // Push content right on desktop
                    mt: { xs: "64px", md: 0 },             // Offset for mobile top bar
                    transition: "margin 0.3s ease-in-out",
                  }}
                >
                  <Routes>
                    <Route path='dashboard' element={<Suspense fallback={<LoadingSpinner />}><ApplicantDashboard /></Suspense>} />
                    <Route path='new_application' element={<Suspense fallback={<LoadingSpinner />}>< NewApplication /></Suspense>} />
                    <Route path='detail/:id' element={<Suspense fallback={<LoadingSpinner />}><Home /></Suspense>} />
                    <Route path='profile' element={<Suspense fallback={<LoadingSpinner />}><ApplicantProfile /></Suspense>} />
                  </Routes>
                </Box>
              </Box>
            </PrivateRoute>

          } />
        )}

        {/* Admin */}
        <Route path='/admin/*' element={
          <PrivateRoute>
            <Box sx={{ display: "flex", minHeight: "100vh" }}>
              <Sidebar1 />
              <Box
                component="main"
                sx={{
                  flex: 1,
                  backgroundColor: "#f5f7fa",
                  p: isMobile ? 2 : 3,
                  pt: isMobile ? 8 : 3,
                  overflowY: "auto",
                  transition: "margin 0.3s ease",
                }}
              >
                <Routes>
                  <Route path='/user_management' element={<Suspense fallback={<LoadingSpinner />}><UserManagement /></Suspense>} />
                  <Route path='/campus_management' element={<Suspense fallback={<LoadingSpinner />}><CampusManagement /></Suspense>} />
                  <Route path='/admission_dashboard' element={<Suspense fallback={<LoadingSpinner />}><AdmissionDashboard /></Suspense>} />
                  <Route path='/admit_student/:id' element={<Suspense fallback={<LoadingSpinner />}><AdmitStudentPage /></Suspense>} />
                  <Route path='/admited_students' element={<Suspense fallback={<LoadingSpinner />}><AdmittedStudents /></Suspense>} />
                  <Route path='/application_list' element={<Suspense fallback={<LoadingSpinner />}><ApplicationList /></Suspense>} />
                  <Route path='/intake' element={<Suspense fallback={<LoadingSpinner />}><BatchManagement /></Suspense>} />
                  <Route path='/faculty-management' element={<Suspense fallback={<LoadingSpinner />}><FacultyManagement /></Suspense>} />
                  <Route path='/program_list' element={<Suspense fallback={<LoadingSpinner />}><ProgramManagement /></Suspense>} />
                  <Route path='/application_review/:id' element={<Suspense fallback={<LoadingSpinner />}>< ReviewPage /></Suspense>} />
                  <Route path="/set_up" element={<Suspense fallback={<LoadingSpinner />}><SetUpPage /></Suspense>} />
                  <Route path='/admission-reports' element={<Suspense fallback={<LoadingSpinner />}><AdmissionsReport /></Suspense>} />
                  <Route path='/roles-permissions' element={<Suspense fallback={<LoadingSpinner />}><AddGroupDialog /></Suspense>} />
                  <Route path='/fee-management' element={<Suspense fallback={<LoadingSpinner />}><FeeManagement /></Suspense>} />
                  <Route path='/academic-levels' element={<Suspense fallback={<LoadingSpinner />}><AcademicLevels /></Suspense>} />
                  <Route path='/logs' element={<Suspense fallback={<LoadingSpinner />}><AuditLogs/></Suspense>}/>
                </Routes>
              </Box>
            </Box>
          </PrivateRoute>
        } />

      </Routes>
    </>
  )
}

export default AppRoutes
