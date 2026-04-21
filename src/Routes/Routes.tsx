import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CircularProgress, Box, useTheme, useMediaQuery } from '@mui/material'

import Sidebar from '../Applicant/Sidebar/Sidebar'
import Sidebar1 from '../Admin/Sidebar/page'
import '../Routes/routes.css'
import PrivateRoute from '../PrivateRoutes/page'
import Logout from '../Auth/Logout'
import AdminRoute from './ProtectedRoutes'

const ApplicantDashboard = lazy(() => import('../Applicant/Dashboard/ApplicantDashboard'))
const NewApplication = lazy(() => import('../Applicant/NewApplication/NewApplication'))
const ApplicantProfile = lazy(() => import('../Applicant/Profile/ApplicantProfile'))
const Home = lazy(() => import('../Applicant/Detail/page'))
const Login = lazy(() => import('../Auth/Login'))
const Register = lazy(() => import('../Auth/Register'))
const ResetPasswordForm = lazy(()=>import('../Auth/ResetPassword'))

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
const ApplicationReviewPage = lazy(() => import('../Admin/Admissions/AdmittedStudent/Review/page'))
const SetUpPage = lazy(() => import('../Admin/Admissions/Setup/page'))
const AdmissionsReport = lazy(() => import('../Admin/Admissions/AdmissionReports/page'))
const AddGroupDialog = lazy(() => import('../Admin/UserManagement/roles_permissions'))
const FeeManagement = lazy(() => import('../Admin/Admissions/FeeManagement/page'))
const AcademicLevels = lazy(() => import('../Admin/Admissions/AcademicLevels/page'))
const EditAdmittedStudentPage = lazy(() => import('../Admin/Admissions/AdmitStudent/edit_strudent'))
const AuditLogs = lazy(() => import('../Admin/AuditLogs/page'))
const Finance = lazy(() => import('../Admin/Finance/page'))
const DirectApplicationForm = lazy(() => import('../Admin/Admissions/DirectApplication/page'))
const DirectEntryList = lazy(() => import('../Admin/Admissions/DirectApplication/DirectEntryList'))
const RejectedList = lazy(()=>import('../Admin/Admissions/ApplicationList/Rejected'))
const AllApplicantsReport = lazy(() => import('../Admin/Reports/AllApplicants'))
const ProspectiveStudents = lazy(() => import('../Admin/ProspectiveStudents/page'))
const SystemUsageReport = lazy(() => import('../Admin/Reports/SystemUsage'))
const SystemSettingsPage = lazy(() => import('../Admin/Settings/SystemSettings'))

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
        sx={{ color: "#7c1519" }}
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
    location.pathname.startsWith(path.replace(":id", "")) 
  );

  return (
    <>
      <Routes>
        <Route path='/' element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
        <Route path='/register' element={<Suspense fallback={<LoadingSpinner />}><Register /></Suspense>} />
        <Route path='logout' element={<Logout />} />
        <Route path='/reset-password' element={<Suspense fallback={<LoadingSpinner />}><ResetPasswordForm/></Suspense>}/>

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
                    ml: { xs: 0, md: `${drawerWidth}px` },
                    mt: { xs: "64px", md: 0 },
                    transition: "margin 0.3s ease-in-out",
                  }}
                >
                  <Routes>
                    <Route path='dashboard' element={<Suspense fallback={<LoadingSpinner />}><ApplicantDashboard /></Suspense>} />
                    <Route path="new_application" element={<Suspense fallback={<LoadingSpinner />}><NewApplication /></Suspense>}/>
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
                  <Route path='/user_management' element={
                     <AdminRoute permission='accounts.view_user'>
                       <Suspense fallback={<LoadingSpinner />}><UserManagement /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/campus_management' element={
                     <AdminRoute permission='accounts.view_campus'>
                       <Suspense fallback={<LoadingSpinner />}><CampusManagement /></Suspense>
                     </AdminRoute>
                    } />
                    
                  <Route path='/admission_dashboard' element={<Suspense fallback={<LoadingSpinner />}><AdmissionDashboard /></Suspense>} />

                  <Route path='/admit_student/:id' element={
                     <AdminRoute permission='admissions.add_admittedstudent'>
                       <Suspense fallback={<LoadingSpinner />}><AdmitStudentPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/edit_admitted_student/:id' element={
                     <AdminRoute permission='admissions.change_admittedstudent'>
                       <Suspense fallback={<LoadingSpinner />}><EditAdmittedStudentPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/admited_students' element={
                     <AdminRoute permission='admissions.view_admittedstudent'>
                       <Suspense fallback={<LoadingSpinner />}><AdmittedStudents /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/application_list' element={
                     <AdminRoute permission='admissions.view_application'>
                       <Suspense fallback={<LoadingSpinner />}><ApplicationList /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/rejected_students' element={
                    <AdminRoute permission='admissions.view_application'>
                       <Suspense fallback={<LoadingSpinner />}><RejectedList /></Suspense>
                     </AdminRoute>
                  }
                  
                  />

                    <Route path='/direct_application' element={
                     <AdminRoute permission='admissions.view_application'>
                       <Suspense fallback={<LoadingSpinner />}><DirectApplicationForm /></Suspense>
                     </AdminRoute>
                    } />

                    <Route path='/direct_entry_list' element={
                     <AdminRoute permission='admissions.view_application'>
                       <Suspense fallback={<LoadingSpinner />}><DirectEntryList /></Suspense>
                     </AdminRoute>
                    } />

                    <Route path='/reports/all-applicants' element={
                     <AdminRoute permission='admissions.view_application'>
                       <Suspense fallback={<LoadingSpinner />}><AllApplicantsReport /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/intake' element={
                     <AdminRoute permission='admissions.view_batch'>
                       <Suspense fallback={<LoadingSpinner />}><BatchManagement /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/faculty-management' element={
                     <AdminRoute permission='admissions.view_faculty'>
                       <Suspense fallback={<LoadingSpinner />}><FacultyManagement /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/program_list' element={
                     <AdminRoute permission='Programs.view_program'>
                       <Suspense fallback={<LoadingSpinner />}><ProgramManagement /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/application_review/:id' element={
                     <AdminRoute permission='admissions.view_application'>
                       <Suspense fallback={<LoadingSpinner />}>< ReviewPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/admitted_student_review/:id' element={
                     <AdminRoute permission='admissions.view_admittedstudent'>
                       <Suspense fallback={<LoadingSpinner />}>< ApplicationReviewPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path="/set_up" element={
                     <AdminRoute permission='AdmissionReports.view_setup'>
                       <Suspense fallback={<LoadingSpinner />}><SetUpPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/admission-reports' element={
                    <AdminRoute permission='AdmissionReports.view_admissionreports'>
                      <Suspense fallback={<LoadingSpinner />}><AdmissionsReport /></Suspense>
                    </AdminRoute>
                    } />

                  <Route path='/roles-permissions' element={
                    <AdminRoute permission='auth.view_group'>
                      <Suspense fallback={<LoadingSpinner />}><AddGroupDialog /></Suspense>
                    </AdminRoute>
                    } />
                  <Route path='/fee-management' element={
                    <AdminRoute permission='payments.view_applicationfee'>
                      <Suspense fallback={<LoadingSpinner />}><FeeManagement /></Suspense>
                    </AdminRoute>
                    } />

                  <Route path='/academic-levels' element={
                    <AdminRoute permission='admissions.view_academiclevel'>
                      <Suspense fallback={<LoadingSpinner />}><AcademicLevels /></Suspense>
                    </AdminRoute>
                    } />

                  <Route path='/logs' element={
                    <AdminRoute permission='audit.view_auditlog'>
                      <Suspense fallback={<LoadingSpinner />}><AuditLogs /></Suspense>
                    </AdminRoute>
                    } />

                  <Route path='/finance' element={
                     <AdminRoute permission='payments.view_applicationpayment'>
                       <Suspense fallback={<LoadingSpinner />}><Finance /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/prospective-students' element={
                    <AdminRoute permission='accounts.view_user'>
                      <Suspense fallback={<LoadingSpinner />}><ProspectiveStudents /></Suspense>
                    </AdminRoute>
                    } />

                  <Route path='/reports/system-usage' element={
                    <AdminRoute permission='audit.view_auditlog'>
                      <Suspense fallback={<LoadingSpinner />}><SystemUsageReport /></Suspense>
                    </AdminRoute>
                    } />

                  <Route path='/system-settings' element={
                    <AdminRoute permission='accounts.view_user'>
                      <Suspense fallback={<LoadingSpinner />}><SystemSettingsPage /></Suspense>
                    </AdminRoute>
                    } />
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
