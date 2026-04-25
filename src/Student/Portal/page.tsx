"use client"

import { useState, useEffect } from "react"
import {
  Box, Container, Typography, Grid, Chip, CircularProgress,
  Alert, Stack, Avatar, Button, Tab, Tabs, Paper, Snackbar,
  Divider, Tooltip,
} from "@mui/material"
import {
  School as SchoolIcon,
  MenuBook as BookIcon,
  CheckCircle as CheckCircleIcon,
  HowToReg as HowToRegIcon,
  Print as PrintIcon,
  LocationOn as CampusIcon,
  Tag as TagIcon,
  Badge as BadgeIcon,
  AutoStories as CoursesIcon,
  AssignmentTurnedIn as RegisteredIcon,
  PauseCircle as DeferredIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import Swal from "sweetalert2"

// ── Types ──────────────────────────────────────────────────────────────────
interface Lecturer  { id: number; name: string; email: string }
interface Semester  { id: number | null; name: string | null; order: number | null }
interface ProgramBatch { id: number | null; name: string | null }
interface Program   { id: number | null; name: string | null }

interface EnrolledCourse {
  enrollment_id: number
  course_unit_id: number
  course_code: string
  course_name: string
  credit_units: number | null
  semester: Semester | null
  program_batch: ProgramBatch | null
  program: Program | null
  lecturers: Lecturer[]
  enrollment_date: string
  registration_date: string | null
  is_registered: boolean
  status: string
  grade: string | null
}

// Deferred courses come from StudentCurriculumOverride rows directly,
// not from StudentCourseUnitEnrollment — so the shape is different.
interface DeferredCourse {
  curriculum_line_id: number | null
  course_code: string
  course_name: string
  credit_units: number | null
  blueprint_year: number | null
  blueprint_term: number | null
  deferred_until: { year: number | null; term: number | null }
}

interface StudentData {
  student_id: string
  reg_no: string
  student_name: string
  program: string | null
  campus: string | null
  passport_photo: string | null
  current_year_of_study: number | null
  current_term_number: number | null
  total_courses: number
  enrolled_courses: EnrolledCourse[]
  deferred_courses: DeferredCourse[]
  registered_courses: EnrolledCourse[]
  total_enrolled: number
  total_deferred: number
  total_registered: number
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const statusColor = (s: string): "success" | "primary" | "error" | "warning" | "default" =>
  ({ completed: "success", enrolled: "primary", withdrawn: "error", failed: "warning" } as any)[s] ?? "default"

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

// ── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({
  course,
  onRegister,
  registering,
}: {
  course: EnrolledCourse
  onRegister?: (id: number, code: string) => void
  registering?: number | null
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e8e8f0",
        borderRadius: 2.5,
        p: 2.5,
        transition: "all 0.18s",
        "&:hover": { borderColor: "#3e397b", boxShadow: "0 4px 16px rgba(62,57,123,0.10)" },
      }}
    >
      {/* Top row */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Box sx={{ flex: 1, mr: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip
              label={course.course_code}
              size="small"
              sx={{ bgcolor: "#ece9f7", color: "#3e397b", fontWeight: 700, fontSize: "0.72rem" }}
            />
            {course.credit_units && (
              <Chip
                label={`${course.credit_units} CU`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", color: "text.secondary", borderColor: "#d0d0d0" }}
              />
            )}
          </Stack>
          <Typography fontWeight={600} fontSize="0.95rem" color="text.primary">
            {course.course_name}
          </Typography>
        </Box>

        <Stack alignItems="flex-end" spacing={0.5}>
          <Chip
            label={course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            color={statusColor(course.status)}
            size="small"
          />
          {course.grade && (
            <Chip
              label={`Grade: ${course.grade}`}
              size="small"
              sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 }}
            />
          )}
        </Stack>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Bottom row */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {/* Semester */}
          <Typography variant="caption" color="text.secondary">
            <strong>Semester:</strong> {course.semester?.name ?? course.program_batch?.name ?? "—"}
          </Typography>
          {/* Date */}
          <Typography variant="caption" color="text.secondary">
            <strong>Enrolled:</strong> {fmt(course.enrollment_date)}
          </Typography>
        </Stack>

        {/* Lecturers */}
        {course.lecturers.length > 0 && (
          <Stack direction="row" spacing={0.5}>
            {course.lecturers.slice(0, 2).map(l => (
              <Tooltip key={l.id} title={l.name}>
                <Avatar sx={{ width: 26, height: 26, bgcolor: "#3e397b", fontSize: "0.7rem" }}>
                  {l.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
            {course.lecturers.length > 2 && (
              <Avatar sx={{ width: 26, height: 26, bgcolor: "#ccc", fontSize: "0.65rem" }}>
                +{course.lecturers.length - 2}
              </Avatar>
            )}
          </Stack>
        )}

        {/* Register button or badge */}
        {onRegister && (
          course.is_registered ? (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
              label="Registered"
              color="success"
              size="small"
            />
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={() => onRegister(course.course_unit_id, course.course_code)}
              disabled={registering === course.course_unit_id}
              sx={{
                bgcolor: "#3e397b", textTransform: "none", borderRadius: 1.5, fontSize: "0.78rem",
                "&:hover": { bgcolor: "#2d2960" },
              }}
            >
              {registering === course.course_unit_id ? "Registering…" : "Register"}
            </Button>
          )
        )}
      </Stack>
    </Paper>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentPortal() {
  const AxiosInstance = useAxios()
  const [loading,     setLoading]     = useState(true)
  const [registering, setRegistering] = useState<number | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [success,     setSuccess]     = useState<string | null>(null)
  const [data,        setData]        = useState<StudentData | null>(null)
  const [tab,         setTab]         = useState(0)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await AxiosInstance.get("/api/program/student/my_courses")
      setData(res.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load your courses")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (courseUnitId: number, courseCode: string) => {
    try {
      setRegistering(courseUnitId)
      await AxiosInstance.post("/api/payments/student/register_for_courses", {
        course_unit_ids: [courseUnitId],
      })
      setSuccess(`Successfully registered for ${courseCode}`)
      await fetchData()
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Failed to register"
      setError(msg)
      Swal.fire("Error", msg, "error")
    } finally {
      setRegistering(null)
    }
  }

  const handlePrint = () => {
    if (!data?.registered_courses?.length) {
      Swal.fire("Info", "No registered courses to print", "info")
      return
    }
    const regDate = data.registered_courses[0]?.registration_date
      ? fmt(data.registered_courses[0].registration_date)
      : fmt(new Date().toISOString())

    const qrData = encodeURIComponent(JSON.stringify({
      student_id: data.student_id, reg_no: data.reg_no,
      name: data.student_name, program: data.program,
    }))
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`

    const w = window.open("", "_blank")
    if (!w) { Swal.fire("Error", "Please allow popups to print", "error"); return }

    w.document.write(`<!DOCTYPE html><html><head><title>Registration Card</title>
    <style>
      body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#333}
      .hdr{text-align:center;border-bottom:3px solid #3e397b;padding-bottom:16px;margin-bottom:24px}
      .hdr h1{color:#3e397b;margin:0;font-size:24px} .hdr h2{color:#666;margin:8px 0 0;font-size:16px;font-weight:normal}
      .info{background:#f5f7fa;padding:16px;border-radius:8px;margin-bottom:24px}
      .info h3{color:#3e397b;margin:0 0 12px;border-bottom:2px solid #3e397b;padding-bottom:8px}
      .info-row{display:flex;gap:16px;align-items:flex-start}
      .photo{width:100px;height:120px;object-fit:cover;border:2px solid #3e397b;border-radius:4px;flex-shrink:0}
      .photo-placeholder{width:100px;height:120px;border:2px solid #3e397b;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#e8e6f0;color:#3e397b;font-size:11px;text-align:center}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1}
      .label{font-weight:bold;color:#666;font-size:11px;text-transform:uppercase;margin-bottom:4px}
      .val{font-size:14px}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th{background:#3e397b;color:#fff;padding:10px;text-align:left}
      td{padding:10px;border-bottom:1px solid #eee}
      tr:nth-child(even){background:#f9f9f9}
      .qr{text-align:center;margin-top:24px;padding:16px;border:2px solid #3e397b;border-radius:8px}
      .sigs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px}
      .sig{border-top:2px solid #333;padding-top:8px;text-align:center;font-weight:bold}
      .ftr{margin-top:24px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}
    </style></head><body>
    <div class="hdr"><h1>NDEJJE UNIVERSITY</h1><h2>STUDENT REGISTRATION CARD</h2></div>
    <div class="info"><h3>Student Information</h3><div class="info-row">
      ${data.passport_photo
        ? `<img src="${data.passport_photo}" class="photo" alt="Student Photo" />`
        : `<div class="photo-placeholder">No Photo</div>`}
      <div class="grid">
        <div><div class="label">Name</div><div class="val">${data.student_name}</div></div>
        <div><div class="label">Student ID</div><div class="val">${data.student_id}</div></div>
        <div><div class="label">Reg Number</div><div class="val">${data.reg_no}</div></div>
        <div><div class="label">Program</div><div class="val">${data.program ?? "N/A"}</div></div>
        <div><div class="label">Campus</div><div class="val">${data.campus ?? "N/A"}</div></div>
        <div><div class="label">Date</div><div class="val">${regDate}</div></div>
      </div>
    </div></div>
    <h3 style="color:#3e397b">Registered Courses (${data.registered_courses.length})</h3>
    <table><thead><tr><th>Code</th><th>Course Name</th><th>Credit Units</th><th>Semester</th></tr></thead>
    <tbody>${data.registered_courses.map(c =>
      `<tr><td>${c.course_code}</td><td>${c.course_name}</td><td>${c.credit_units ?? "—"}</td><td>${c.semester?.name ?? c.program_batch?.name ?? "N/A"}</td></tr>`
    ).join("")}</tbody></table>
    <div class="qr"><h4 style="margin:0 0 12px;color:#3e397b">Verification QR Code</h4>
    <img src="${qrUrl}" width="150" height="150" /><br>
    <small style="color:#999">Scan to verify registration</small></div>
    <div class="sigs"><div class="sig">Student Signature</div><div class="sig">Registrar Signature</div></div>
    <div class="ftr"><p>Official registration card — Ndejje University</p>
    <p>Generated: ${fmt(new Date().toISOString())} &nbsp;|&nbsp; ID: ${data.student_id}</p></div>
    <script>window.onload=()=>window.print()</script></body></html>`)
    w.document.close()
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <CircularProgress sx={{ color: "#3e397b" }} />
    </Box>
  )

  if (error && !data) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  )

  if (!data) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="info">No student data found. Contact administration.</Alert>
    </Container>
  )

  // ── Initials for avatar ───────────────────────────────────────────────────
  const initials = data.student_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()

  // ── Tab content ────────────────────────────────────────────────────────────
  const activeCourses    = data.enrolled_courses
  const deferredCourses  = data.deferred_courses ?? []
  const enrolledPending  = activeCourses.filter(c => !c.is_registered)

  return (
    <Box sx={{ bgcolor: "#f7f8fc", minHeight: "100vh" }}>
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(120deg, #2d2960 0%, #3e397b 60%, #5a4fa3 100%)",
          px: { xs: 2, md: 5 },
          py: { xs: 3, md: 4 },
          color: "white",
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "center" }}>
            {/* Avatar */}
            <Avatar
              src={data.passport_photo || undefined}
              sx={{
                width: 72, height: 72, bgcolor: "rgba(255,255,255,0.2)",
                fontSize: "1.6rem", fontWeight: 700, border: "2px solid rgba(255,255,255,0.4)",
              }}
            >
              {initials}
            </Avatar>

            {/* Name + details */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                {data.student_name}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <BadgeIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>{data.student_id}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TagIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>{data.reg_no}</Typography>
                </Stack>
                {data.program && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <SchoolIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>{data.program}</Typography>
                  </Stack>
                )}
                {data.campus && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CampusIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>{data.campus}</Typography>
                  </Stack>
                )}
                {data.current_year_of_study != null && data.current_term_number != null && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Year {data.current_year_of_study} &mdash; Semester {data.current_term_number}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* Stat pills */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {[
                { icon: <CoursesIcon sx={{ fontSize: 18 }} />,   value: data.total_enrolled,    label: "Active" },
                { icon: <DeferredIcon sx={{ fontSize: 18 }} />,  value: data.total_deferred ?? 0, label: "Deferred" },
                { icon: <RegisteredIcon sx={{ fontSize: 18 }} />, value: data.total_registered,  label: "Registered" },
              ].map(s => (
                <Box
                  key={s.label}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 2,
                    px: 2, py: 1,
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  {s.icon}
                  <Typography fontWeight={700} fontSize="1.3rem" lineHeight={1}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>{s.label}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 3 }}>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{ border: "1px solid #e0e0e0", borderRadius: 2.5, overflow: "hidden", mb: 3 }}
        >
          <Box sx={{ borderBottom: "1px solid #e0e0e0", px: 2 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.9rem" },
                "& .Mui-selected": { color: "#3e397b", fontWeight: 700 },
                "& .MuiTabs-indicator": { bgcolor: "#3e397b", height: 3 },
              }}
            >
              <Tab
                icon={<BookIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`Enrolled Courses (${activeCourses.length})`}
              />
              <Tab
                icon={<HowToRegIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={`Registered Courses (${data.registered_courses.length})`}
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* ── Tab 0: Enrolled ──────────────────────────────────────── */}
            {tab === 0 && (
              <>
                {enrolledPending.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                    You have <strong>{enrolledPending.length}</strong> course{enrolledPending.length > 1 ? "s" : ""} pending registration.
                  </Alert>
                )}

                {/* Active / current courses */}
                {activeCourses.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <BookIcon sx={{ fontSize: 60, color: "action.disabled", mb: 2 }} />
                    <Typography color="text.secondary" fontWeight={500}>No active enrolled courses</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {activeCourses.map(c => (
                      <Grid key={c.enrollment_id} size={{ xs: 12, md: 6 }}>
                        <CourseCard
                          course={c}
                          onRegister={handleRegister}
                          registering={registering}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Deferred courses section */}
                {deferredCourses.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <DeferredIcon sx={{ color: "#ed6c02", fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={700} color="#ed6c02">
                        Deferred Courses ({deferredCourses.length})
                      </Typography>
                    </Stack>
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                      These courses have been deferred. They will appear for registration in the scheduled term.
                    </Alert>
                    <Grid container spacing={2}>
                      {deferredCourses.map((c, idx) => (
                        <Grid key={c.curriculum_line_id ?? idx} size={{ xs: 12, md: 6 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              border: "1px solid #ffe0b2",
                              borderRadius: 2.5,
                              p: 2.5,
                              bgcolor: "#fffbf5",
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                              <Box sx={{ flex: 1, mr: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                  <Chip
                                    label={c.course_code}
                                    size="small"
                                    sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 700, fontSize: "0.72rem" }}
                                  />
                                  {c.credit_units && (
                                    <Chip
                                      label={`${c.credit_units} CU`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.7rem", color: "text.secondary", borderColor: "#d0d0d0" }}
                                    />
                                  )}
                                </Stack>
                                <Typography fontWeight={600} fontSize="0.95rem" color="text.primary">
                                  {c.course_name}
                                </Typography>
                              </Box>
                              <Chip
                                icon={<DeferredIcon sx={{ fontSize: 14 }} />}
                                label="Deferred"
                                size="small"
                                sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600 }}
                              />
                            </Stack>
                            <Divider sx={{ my: 1.5 }} />
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                              <Typography variant="caption" color="text.secondary">
                                <strong>Deferred to:</strong>{" "}
                                {c.deferred_until?.year != null
                                  ? `Year ${c.deferred_until.year}, Semester ${c.deferred_until.term ?? "—"}`
                                  : "To be determined"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <strong>Originally:</strong> Year {c.blueprint_year ?? "—"}, Semester {c.blueprint_term ?? "—"}
                              </Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
            )}

            {/* ── Tab 1: Registered ────────────────────────────────────── */}
            {tab === 1 && (
              <>
                {data.registered_courses.length > 0 && (
                  <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                      sx={{
                        bgcolor: "#3e397b", textTransform: "none", borderRadius: 2,
                        "&:hover": { bgcolor: "#2d2960" },
                      }}
                    >
                      Print Registration Card
                    </Button>
                  </Stack>
                )}
                {data.registered_courses.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <HowToRegIcon sx={{ fontSize: 60, color: "action.disabled", mb: 2 }} />
                    <Typography color="text.secondary" fontWeight={500}>No registered courses yet</Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                      Register for your enrolled courses in the Enrolled tab.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {data.registered_courses.map(c => (
                      <Grid key={c.enrollment_id} size={{ xs: 12, md: 6 }}>
                        <CourseCard course={c} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={5000}
        onClose={() => { setSuccess(null); setError(null) }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={success ? "success" : "error"}
          onClose={() => { setSuccess(null); setError(null) }}
          sx={{ width: "100%" }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  )
}
