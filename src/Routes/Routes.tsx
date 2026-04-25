import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { CircularProgress, Box, useTheme, useMediaQuery } from '@mui/material'

import Sidebar from '../Applicant/Sidebar/Sidebar'
import StudentSidebar from '../Student/Sidebar/Sidebar'
import LecturerSidebar from '../Lecturer/Sidebar/Sidebar'
import Sidebar1 from '../Admin/Sidebar/page'
import '../Routes/routes.css'
import PrivateRoute from '../PrivateRoutes/page'
import Logout from '../Auth/Logout'
import AdminRoute from './ProtectedRoutes'
import StudentRoute from './StudentRoute'
import LecturerRoute from './LecturerRoute'
import ApplicantRoute from './ApplicantRoute'

const ApplicantDashboard = lazy(() => import('../Applicant/Dashboard/ApplicantDashboard'))
const NewApplication = lazy(() => import('../Applicant/NewApplication/NewApplication'))
const ApplicantProfile = lazy(() => import('../Applicant/Profile/ApplicantProfile'))
const Home = lazy(() => import('../Applicant/Detail/page'))
const Login = lazy(() => import('../Auth/Login'))
const Register = lazy(() => import('../Auth/Register'))
const ResetPasswordForm = lazy(()=>import('../Auth/ResetPassword'))

const StudentPortal = lazy(() => import('../Student/Portal/page'))
const StudentDashboard = lazy(() => import('../Student/Dashboard/page'))
const StudentTuitionFees = lazy(() => import('../Student/TuitionFees/page'))
const CourseRegistration = lazy(() => import('../Student/CourseRegistration/page'))
const StudentResults = lazy(() => import('../Student/Results/page'))
const StudentProfile = lazy(() => import('../Applicant/Profile/ApplicantProfile'))
const AcademicTrackerPage = lazy(() => import('../Student/AcademicTracker/page'))
const LecturerDashboard = lazy(() => import('../Lecturer/Dashboard/page'))
const LecturerPortal = lazy(() => import('../Lecturer/Portal/page'))
const LecturerCourses = lazy(() => import('../Lecturer/Courses/page'))
const LecturerStudents = lazy(() => import('../Lecturer/Students/page'))
const LecturerEnterScores = lazy(() => import('../Lecturer/EnterScores/page'))

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
const CourseCatalog = lazy(() => import('../Admin/Faculty/CourseCatalog/page'))
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
const TuitionRegistrationSettings = lazy(() => import('../Admin/Finance/RegistrationSettings/page'))
const BatchSemesterTuition = lazy(() => import('../Admin/FeesPayments/BatchSemesterTuition/page'))
const FeeHeadsPage = lazy(() => import('../Admin/FeesPayments/FeeHeads/page'))
const AcademicBatchManagement = lazy(() => import('../Admin/BatchManagement/page'))
const AdminEnrollmentPage = lazy(() => import('../Admin/Enrollment/page'))
const CurriculumOverridesPage = lazy(() => import('../Admin/Enrollment/CurriculumOverrides'))
const StudentChargesPage = lazy(() => import('../Admin/StudentCharges/page'))
const StudentEnrollmentPage = lazy(() => import('../Student/Enrollment/page'))
const AdminChangeRequestsPage = lazy(() => import('../Admin/Admissions/ChangeRequests/page'))
const StudentAdmissionChangePage = lazy(() => import('../Student/AdmissionChange/page'))
const DirectApplicationEntryPage = lazy(() => import('../Admin/Admissions/DirectApplicationEntry/page'))
const DirectAdmissionEntryPage = lazy(() => import('../Admin/Admissions/DirectAdmissionEntry/page'))
const StudentChangePasswordPage = lazy(() => import('../Student/ChangePassword/page'))

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

  const applicantRoutes = [
    "/applicant/dashboard",
    "/applicant/new_application",
    "/applicant/detail/:id",
    "/applicant/profile",
    "/applicant/logout",
  ]
  const studentRoutes = [
    "/student/dashboard",
    "/student/portal",
    "/student/tuition",
    "/student/finances",
    "/student/registration",
    "/student/results",
    "/student/enrollment",
    "/student/tracker",
    "/student/admission-change",
    "/student/profile",
    "/student/logout",
  ]
  const lecturerRoutes = [
    "/lecturer/dashboard",
    "/lecturer/portal",
    "/lecturer/courses",
    "/lecturer/students",
    "/lecturer/enter-scores",
    "/lecturer/profile",
    "/lecturer/logout",
    "/lecturer/courses/",
  ]

  const isSidebarRoute =
    applicantRoutes.some((path) => location.pathname.startsWith(path.replace(":id", ""))) ||
    studentRoutes.some((path) => location.pathname.startsWith(path.replace(":id", ""))) ||
    lecturerRoutes.some((path) => location.pathname.startsWith(path.replace(":id", "")))

  return (
    <>
      <Routes>
        <Route path='/' element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
        <Route path='/login' element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
        <Route path='/register' element={<Suspense fallback={<LoadingSpinner />}><Register /></Suspense>} />
        <Route path='logout' element={<Logout />} />
        <Route path='/reset-password' element={<Suspense fallback={<LoadingSpinner />}><ResetPasswordForm/></Suspense>}/>

        {/* Student first-login forced password change — no sidebar, no role guard */}
        <Route path='/student/change-password' element={<PrivateRoute><Suspense fallback={<LoadingSpinner />}><StudentChangePasswordPage /></Suspense></PrivateRoute>} />

        {/* Applicant */}
        {isSidebarRoute && (
          <Route path='/applicant/*' element={
            <PrivateRoute>
              <ApplicantRoute>
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
              </ApplicantRoute>
            </PrivateRoute>

          } />
        )}

        {/* Student */}
        {isSidebarRoute && (
          <Route path='/student/*' element={
            <PrivateRoute>
              <StudentRoute>
                <Box sx={{ display: "flex", minHeight: "100vh" }}>
                  <StudentSidebar />
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
                      <Route path='dashboard' element={<Suspense fallback={<LoadingSpinner />}><StudentDashboard /></Suspense>} />
                      <Route path='portal' element={<Suspense fallback={<LoadingSpinner />}><StudentPortal /></Suspense>} />
                      <Route path='tuition' element={<Suspense fallback={<LoadingSpinner />}><StudentTuitionFees /></Suspense>} />
                      <Route path='finances' element={<Suspense fallback={<LoadingSpinner />}><StudentTuitionFees /></Suspense>} />
                      <Route path='registration' element={<Suspense fallback={<LoadingSpinner />}><CourseRegistration /></Suspense>} />
                      <Route path='results' element={<Suspense fallback={<LoadingSpinner />}><StudentResults /></Suspense>} />
                      <Route path='enrollment' element={<Suspense fallback={<LoadingSpinner />}><StudentEnrollmentPage /></Suspense>} />
                      <Route path='tracker' element={<Suspense fallback={<LoadingSpinner />}><AcademicTrackerPage /></Suspense>} />
                      <Route path='admission-change' element={<Suspense fallback={<LoadingSpinner />}><StudentAdmissionChangePage /></Suspense>} />
                      <Route path='profile' element={<Suspense fallback={<LoadingSpinner />}><StudentProfile /></Suspense>} />
                    </Routes>
                  </Box>
                </Box>
              </StudentRoute>
            </PrivateRoute>
          } />
        )}

        {/* Lecturer */}
        {isSidebarRoute && (
          <Route path='/lecturer/*' element={
            <PrivateRoute>
              <LecturerRoute>
                <Box sx={{ display: "flex", minHeight: "100vh" }}>
                  <LecturerSidebar />
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
                      <Route path='dashboard' element={<Suspense fallback={<LoadingSpinner />}><LecturerDashboard /></Suspense>} />
                      <Route path='portal' element={<Suspense fallback={<LoadingSpinner />}><LecturerPortal /></Suspense>} />
                      <Route path='courses' element={<Suspense fallback={<LoadingSpinner />}><LecturerCourses /></Suspense>} />
                      <Route path='courses/:courseId' element={<Suspense fallback={<LoadingSpinner />}><LecturerStudents /></Suspense>} />
                      <Route path='students' element={<Suspense fallback={<LoadingSpinner />}><LecturerStudents /></Suspense>} />
                      <Route path='enter-scores' element={<Suspense fallback={<LoadingSpinner />}><LecturerEnterScores /></Suspense>} />
                      <Route path='profile' element={<Suspense fallback={<LoadingSpinner />}><ApplicantProfile /></Suspense>} />
                    </Routes>
                  </Box>
                </Box>
              </LecturerRoute>
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

                  <Route path='/course-catalog' element={
                     <AdminRoute permission='Programs.view_program'>
                       <Suspense fallback={<LoadingSpinner />}><CourseCatalog /></Suspense>
                     </AdminRoute>
                    } />

                  <Route
                    path="/program_batches"
                    element={
                      <AdminRoute permission="Programs.view_program">
                        <Navigate to="/admin/batch-management" replace />
                      </AdminRoute>
                    }
                  />

                  <Route path='/batch-management' element={
                     <AdminRoute permission='Programs.view_program'>
                       <Suspense fallback={<LoadingSpinner />}><AcademicBatchManagement /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/enrollments' element={
                     <AdminRoute permission='Programs.view_studentprogrammeenrollment'>
                       <Suspense fallback={<LoadingSpinner />}><AdminEnrollmentPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/student/:studentId/curriculum' element={
                     <AdminRoute permission='Programs.view_studentprogrammeenrollment'>
                       <Suspense fallback={<LoadingSpinner />}><CurriculumOverridesPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/student/:studentId/charges' element={
                     <AdminRoute permission='payments.view_studenttuitionpayment'>
                       <Suspense fallback={<LoadingSpinner />}><StudentChargesPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/admission-change-requests' element={
                     <AdminRoute permission='admissions.view_admissionchangerequest'>
                       <Suspense fallback={<LoadingSpinner />}><AdminChangeRequestsPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/direct-application-entry' element={
                     <AdminRoute permission='admissions.add_application'>
                       <Suspense fallback={<LoadingSpinner />}><DirectApplicationEntryPage /></Suspense>
                     </AdminRoute>
                    } />

                  <Route path='/direct-admission-entry' element={
                     <AdminRoute permission='admissions.add_admittedstudent'>
                       <Suspense fallback={<LoadingSpinner />}><DirectAdmissionEntryPage /></Suspense>
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

                  <Route
                    path="/fees-payments/tuition-fees"
                    element={<Navigate to="/admin/fees-payments/batch-semester-tuition" replace />}
                  />
                  <Route path='/fees-payments/batch-semester-tuition' element={
                    <AdminRoute permission='payments.view_applicationfee'>
                      <Suspense fallback={<LoadingSpinner />}><BatchSemesterTuition /></Suspense>
                    </AdminRoute>
                    } />

                  <Route path='/fees-payments/fee-heads' element={
                    <AdminRoute permission='payments.view_feehead'>
                      <Suspense fallback={<LoadingSpinner />}><FeeHeadsPage /></Suspense>
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

                  <Route path='/tuition_registration' element={
                     <AdminRoute permission='payments.view_applicationpayment'>
                       <Suspense fallback={<LoadingSpinner />}><TuitionRegistrationSettings /></Suspense>
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
