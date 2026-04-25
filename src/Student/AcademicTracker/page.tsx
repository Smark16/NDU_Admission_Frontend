"use client"

import { useState, useEffect } from "react"
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import {
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  PauseCircle as DeferredIcon,
  AccountTree as SpecIcon,
  TrendingUp as ProgressIcon,
  EventNote as CalendarIcon,
  ErrorOutline as WarningIcon,
  Cancel as SuspendedIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

// ── Types ─────────────────────────────────────────────────────────────────────

interface AcademicPosition {
  year_of_study: number
  term_number: number
  term_label: string
  program: string
  program_short: string
  batch: string
  calendar_type: string
  max_years: number
  entry_year: number | null
  entry_term: number | null
}

interface EnrollmentInfo {
  status: string
  status_display: string
  is_enrolled: boolean
  enrolled_at: string | null
}

interface RegistrationInfo {
  status: "not_eligible" | "no_courses" | "pending" | "partial" | "registered"
  label: string
  active_count: number
  registered_count: number
}

interface DeferredCourseEntry {
  course_code: string
  course_name: string
  original_year: number | null
  original_term: number | null
  deferred_to_year: number | null
  deferred_to_term: number | null
}

interface DeferredInfo {
  count: number
  courses: DeferredCourseEntry[]
}

interface SpecializationInfo {
  program_has_specialization: boolean
  entry_year: number | null
  entry_term: number | null
  selected: string | null
  required_now: boolean
  is_missing: boolean
}

interface PromotionInfo {
  has_record: boolean
  last_promoted_at: string | null
  promoted_to_semester: string | null
}

interface TrackerData {
  academic_position: AcademicPosition
  enrollment: EnrollmentInfo
  registration: RegistrationInfo
  deferred: DeferredInfo
  specialization: SpecializationInfo
  promotion: PromotionInfo
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

// ── Section card wrapper ──────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  accent = "#3e397b",
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  accent?: string
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e4e2f0",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: accent,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ color: "white", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography fontWeight={700} fontSize="0.9rem" color="white">
          {title}
        </Typography>
      </Box>
      {/* Body */}
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  )
}

// ── Info row helper ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ py: 0.75, borderBottom: "1px solid #f0eef8" }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: "right" }}>{value}</Box>
    </Stack>
  )
}

// ── Enrollment status chip ────────────────────────────────────────────────────

function EnrollmentChip({ status, label }: { status: string; label: string }) {
  const map: Record<string, { color: "success" | "warning" | "error" | "info" | "default"; icon: React.ReactNode }> = {
    enrolled:  { color: "success", icon: <CheckIcon sx={{ fontSize: 14 }} /> },
    pending:   { color: "warning", icon: <PendingIcon sx={{ fontSize: 14 }} /> },
    suspended: { color: "error",   icon: <SuspendedIcon sx={{ fontSize: 14 }} /> },
    completed: { color: "info",    icon: <CheckIcon sx={{ fontSize: 14 }} /> },
    withdrawn: { color: "default", icon: <SuspendedIcon sx={{ fontSize: 14 }} /> },
  }
  const cfg = map[status] ?? { color: "default", icon: null }
  return (
    <Chip
      icon={cfg.icon as any}
      label={label}
      size="small"
      color={cfg.color}
      sx={{ fontWeight: 600 }}
    />
  )
}

// ── Registration status chip ──────────────────────────────────────────────────

function RegChip({ status, label }: { status: string; label: string }) {
  const map: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
    registered:   "success",
    partial:      "warning",
    pending:      "warning",
    no_courses:   "default",
    not_eligible: "error",
  }
  return (
    <Chip
      label={label}
      size="small"
      color={map[status] ?? "default"}
      sx={{ fontWeight: 600 }}
    />
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AcademicTrackerPage() {
  const AxiosInstance = useAxios()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TrackerData | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await AxiosInstance.get("/api/program/student/academic_tracker")
        setData(res.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load academic tracker.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress sx={{ color: "#3e397b" }} />
      </Box>
    )

  if (error || !data)
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error ?? "No tracker data available."}</Alert>
      </Container>
    )

  const { academic_position: pos, enrollment, registration, deferred, specialization, promotion } = data
  const tl = pos.term_label // "Semester" or "Trimester"

  return (
    <Box sx={{ bgcolor: "#f7f8fc", minHeight: "100vh" }}>
      {/* ── Hero bar ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(120deg, #2d2960 0%, #3e397b 60%, #5a4fa3 100%)",
          px: { xs: 2, md: 5 },
          py: { xs: 3, md: 4 },
          color: "white",
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <ProgressIcon sx={{ fontSize: 32, opacity: 0.85 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Academic Tracker
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                {pos.program_short} &mdash; {pos.batch}
              </Typography>
            </Box>
          </Stack>

          {/* Position pill */}
          <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2 }}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
                px: 2.5,
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography fontWeight={800} fontSize="1.5rem" lineHeight={1}>
                Y{pos.year_of_study}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Year of Study
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
                px: 2.5,
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography fontWeight={800} fontSize="1.5rem" lineHeight={1}>
                {tl.charAt(0)}{pos.term_number}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {tl}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
                px: 2.5,
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography fontWeight={800} fontSize="1.5rem" lineHeight={1}>
                {deferred.count}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Deferred
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
                px: 2.5,
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography fontWeight={800} fontSize="1.5rem" lineHeight={1}>
                {registration.registered_count}/{registration.active_count}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Registered
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Specialization warning */}
        {specialization.is_missing && (
          <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Specialization Required</strong> — Your programme requires a specialization
            track from Year {specialization.entry_year} {tl} {specialization.entry_term}. Please
            select your track in the <em>My Enrollment</em> page.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* ── 1. Academic Position ──────────────────────────────────────── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Academic Position" icon={<SchoolIcon fontSize="small" />}>
              <InfoRow
                label="Current Position"
                value={
                  <Typography fontWeight={700} color="#3e397b">
                    Year {pos.year_of_study}, {tl} {pos.term_number}
                  </Typography>
                }
              />
              <InfoRow label="Programme" value={<Typography variant="body2" fontWeight={500}>{pos.program}</Typography>} />
              <InfoRow label="Batch / Intake" value={<Typography variant="body2">{pos.batch}</Typography>} />
              <InfoRow
                label="Programme Duration"
                value={<Typography variant="body2">{pos.max_years} year{pos.max_years !== 1 ? "s" : ""}</Typography>}
              />
              {pos.entry_year != null && (
                <InfoRow
                  label="Entered At"
                  value={
                    <Typography variant="body2" color="text.secondary">
                      Year {pos.entry_year}, {tl} {pos.entry_term ?? 1}
                    </Typography>
                  }
                />
              )}
            </SectionCard>
          </Grid>

          {/* ── 2. Enrollment & Registration ─────────────────────────────── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Enrollment & Registration" icon={<CheckIcon fontSize="small" />} accent="#1b5e20">
              <InfoRow
                label="Enrollment Status"
                value={<EnrollmentChip status={enrollment.status} label={enrollment.status_display} />}
              />
              {enrollment.enrolled_at && (
                <InfoRow
                  label="Enrolled Since"
                  value={<Typography variant="body2">{fmtDate(enrollment.enrolled_at)}</Typography>}
                />
              )}
              <InfoRow
                label="Registration Status"
                value={<RegChip status={registration.status} label={registration.label} />}
              />
              {registration.active_count > 0 && (
                <InfoRow
                  label="Course Units"
                  value={
                    <Typography variant="body2">
                      {registration.registered_count} registered of {registration.active_count} enrolled
                    </Typography>
                  }
                />
              )}
            </SectionCard>
          </Grid>

          {/* ── 3. Deferred Courses ───────────────────────────────────────── */}
          <Grid size={{ xs: 12, md: deferred.count > 0 ? 12 : 6 }}>
            <SectionCard
              title={`Deferred Courses (${deferred.count})`}
              icon={<DeferredIcon fontSize="small" />}
              accent="#e65100"
            >
              {deferred.count === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No deferred courses — all your course units are active.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#fff3e0" }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.78rem" }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.78rem" }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.78rem" }}>Original Slot</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.78rem" }}>Deferred To</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deferred.courses.map((c, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Chip
                              label={c.course_code}
                              size="small"
                              sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 700, fontSize: "0.7rem" }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.82rem" }}>{c.course_name}</TableCell>
                          <TableCell sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                            {c.original_year != null ? `Y${c.original_year} ${tl.charAt(0)}${c.original_term ?? "—"}` : "—"}
                          </TableCell>
                          <TableCell>
                            {c.deferred_to_year != null ? (
                              <Chip
                                label={`Y${c.deferred_to_year} ${tl.charAt(0)}${c.deferred_to_term ?? "—"}`}
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.disabled">TBD</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </SectionCard>
          </Grid>

          {/* ── 4. Specialization ─────────────────────────────────────────── */}
          {specialization.program_has_specialization && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Specialization" icon={<SpecIcon fontSize="small" />} accent="#1565c0">
                <InfoRow
                  label="Selected Track"
                  value={
                    specialization.selected ? (
                      <Chip
                        label={specialization.selected}
                        size="small"
                        sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label={specialization.required_now ? "Not Selected — Required" : "Not yet required"}
                        size="small"
                        color={specialization.required_now ? "error" : "default"}
                        sx={{ fontWeight: 600 }}
                      />
                    )
                  }
                />
                {specialization.entry_year != null && (
                  <InfoRow
                    label="Required From"
                    value={
                      <Typography variant="body2" color="text.secondary">
                        Year {specialization.entry_year}, {tl} {specialization.entry_term ?? 1}
                      </Typography>
                    }
                  />
                )}
                <InfoRow
                  label="Status"
                  value={
                    <Chip
                      label={
                        specialization.is_missing
                          ? "Action Required"
                          : specialization.selected
                          ? "Confirmed"
                          : "Not yet applicable"
                      }
                      size="small"
                      color={
                        specialization.is_missing ? "error" : specialization.selected ? "success" : "default"
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  }
                />
              </SectionCard>
            </Grid>
          )}

          {/* ── 5. Promotion / Progression Visibility ────────────────────── */}
          <Grid size={{ xs: 12, md: specialization.program_has_specialization ? 6 : 12 }}>
            <SectionCard title="Progression" icon={<CalendarIcon fontSize="small" />} accent="#4a148c">
              <InfoRow
                label="Current Position"
                value={
                  <Typography fontWeight={700} color="#4a148c">
                    Year {pos.year_of_study} — {tl} {pos.term_number}
                  </Typography>
                }
              />
              {promotion.has_record && promotion.last_promoted_at ? (
                <>
                  <InfoRow
                    label="Last Promoted"
                    value={<Typography variant="body2">{fmtDateTime(promotion.last_promoted_at)}</Typography>}
                  />
                  {promotion.promoted_to_semester && (
                    <InfoRow
                      label="Promoted Into"
                      value={<Typography variant="body2">{promotion.promoted_to_semester}</Typography>}
                    />
                  )}
                </>
              ) : (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No promotion record found via the promotion tool. Your current position is Year{" "}
                    {pos.year_of_study}, {tl} {pos.term_number} as tracked in the system.
                  </Typography>
                </Box>
              )}
              {pos.entry_year != null &&
                (pos.entry_year !== pos.year_of_study || (pos.entry_term ?? 1) !== pos.term_number) && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #ede7f6" }}>
                    <Typography variant="caption" color="text.disabled">
                      Started at Year {pos.entry_year}, {tl} {pos.entry_term ?? 1}
                    </Typography>
                  </Box>
                )}
            </SectionCard>
          </Grid>
        </Grid>

        {/* ── Footer note ─────────────────────────────────────────────────── */}
        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
          <Typography variant="caption" color="text.disabled">
            This tracker shows your current academic status. Grades, GPA, and transcripts will be
            available in the Academic Results section when published.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
