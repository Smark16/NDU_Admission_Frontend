"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import useAxios from "../../../AxiosInstance/UseAxios";

interface Campus {
  id: number;
  name: string;
}

interface StudentRow {
  id: number;
  student_names: string;
  gender: string;
  nationality: string;
  contact_address: string;
  course_applied_for: string;
  other_choices: string;
  program: string;
  study_mode: string;
  campus: string;
  olevel_school: string;
  olevel_year: string;
  olevel_index_number: string;
  olevel_scores: string;
  alevel_school: string;
  alevel_year: string;
  alevel_index_number: string;
  alevel_combination: string;
  alevel_scores: string;
  principal_subsidiaries: string;
  other_qualifications: string;
  institution: string;
  class_of_award: string;
  course_admitted_for: string;
  remarks: string;
  payments: string;
  admission_date: string;
  origin: string;
}

interface StudentGroup {
  academic_year: string;
  admission_period: string;
  students: StudentRow[];
}

interface Props {
  academicYear: string;
  setAcademicYear: (v: string) => void;
  admissionPeriod: string;
  setAdmissionPeriod: (v: string) => void;
  campusFilter: string;
  setCampusFilter: (v: string) => void;
  applicantSearch: string;
  setApplicantSearch: (v: string) => void;
  applicantPage: number;
  setApplicantPage: React.Dispatch<React.SetStateAction<number>>;
  applicantsPerPage: number;
  setSnackbarMessage: (v: string) => void;
  setShowSnackbar: (v: boolean) => void;
  openExportDialog: boolean;
  setOpenExportDialog: (v: boolean) => void;
}

export default function ApplicantsDB({
  academicYear,
  setAcademicYear,
  admissionPeriod,
  setAdmissionPeriod,
  campusFilter,
  setCampusFilter,
  applicantSearch,
  setApplicantSearch,
  applicantPage,
  setApplicantPage,
  applicantsPerPage,
  setSnackbarMessage,
  setShowSnackbar,
  openExportDialog,
  setOpenExportDialog,
}: Props) {
  const AxiosInstance = useAxios();

  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchStudents = async () => {
    try {
      const { data } = await AxiosInstance.get<StudentGroup[]>("/api/admission_reports/students_data");
      setStudentGroups(data);
    } catch (e) {
      console.error("Failed to fetch students:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const { data } = await AxiosInstance.get<Campus[]>("/api/accounts/list_campus");
      setCampuses(data);
    } catch (e) {
      console.error("Failed to fetch campuses:", e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCampuses();
  }, []);

  // Set default academic year & intake after data loads
  useEffect(() => {
    if (studentGroups.length > 0 && !academicYear && !admissionPeriod) {
      const first = studentGroups[0];
      setAcademicYear(first.academic_year);
      setAdmissionPeriod(first.admission_period);
    }
  }, [studentGroups, academicYear, admissionPeriod, setAcademicYear, setAdmissionPeriod]);

  // Derived data
  const currentGroup = useMemo(() => {
    return studentGroups.find(
      (g) => g.academic_year === academicYear && g.admission_period === admissionPeriod
    );
  }, [studentGroups, academicYear, admissionPeriod]);

  const allRows = currentGroup?.students ?? [];

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      const search = applicantSearch.toLowerCase();
      const matchesSearch =
        r.student_names.toLowerCase().includes(search) ||
        r.course_applied_for.toLowerCase().includes(search) ||
        r.nationality.toLowerCase().includes(search);

      const matchesCampus = campusFilter === "all" || r.campus === campusFilter;

      return matchesSearch && matchesCampus;
    });
  }, [allRows, applicantSearch, campusFilter]);

  const paginated = useMemo(() => {
    const start = applicantPage * applicantsPerPage;
    return filtered.slice(start, start + applicantsPerPage);
  }, [filtered, applicantPage, applicantsPerPage]);

  // Export to Excel (sends campus ID)
  const handleExportExcel = async () => {
    try {
      const campusId = campusFilter === "all" ? "" : campuses.find((c) => c.name === campusFilter)?.id || "";

      const url = `/api/admission_reports/export_faculty_excel/?academic_year=${academicYear}&admission_period=${admissionPeriod}&campus=${campusId}`;

      const resp = await AxiosInstance.get(url, { responseType: "blob" });

      const blob = new Blob([resp.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `admissions-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setSnackbarMessage("Excel exported successfully!");
      setShowSnackbar(true);
    } catch (e) {
      console.error("Export failed:", e);
      setSnackbarMessage("Export failed. Please try again.");
      setShowSnackbar(true);
    } finally {
      setOpenExportDialog(false);
    }
  };

  // Show loading
  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading admissions data...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Applicants Database
          </Typography>

          {/* FILTERS */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Academic Year */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setApplicantPage(0);
                  }}
                  label="Academic Year"
                >
                  {[...new Set(studentGroups.map((g) => g.academic_year))].map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Admission Period */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Admission Period</InputLabel>
                <Select
                  value={admissionPeriod}
                  onChange={(e) => {
                    setAdmissionPeriod(e.target.value);
                    setApplicantPage(0);
                  }}
                  label="Admission Period"
                >
                  {[...new Set(studentGroups.map((g) => g.admission_period))].map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Campus */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Campus</InputLabel>
                <Select
                  value={campusFilter}
                  onChange={(e) => {
                    setCampusFilter(e.target.value);
                    setApplicantPage(0);
                  }}
                  label="Campus"
                >
                  <MenuItem value="all">All Campuses</MenuItem>
                  {campuses.map((c) => (
                    <MenuItem key={c.id} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Search */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                placeholder="Search name / course / nationality"
                value={applicantSearch}
                onChange={(e) => {
                  setApplicantSearch(e.target.value);
                  setApplicantPage(0);
                }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          {/* TABLE */}
          <Box sx={{ overflowX: "auto" }}>
            <TableContainer component={Paper} sx={{ border: "1px solid #e0e0e0" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f7fa" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Names</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nationality</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Course Applied</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Other Choices</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Study Mode</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Campus</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>O-Level School</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>O-Level Year</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>O-Level Index</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>O-Level Scores</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>A-Level School</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>A-Level Year</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>A-Level Index</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>A-Level Combo</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>A-Level Scores</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>PP/SP</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Other Qual.</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Institution</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Admitted Course</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payments</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Entry Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Origin</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length > 0 ? (
                    paginated.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>{r.student_names}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.gender}
                            size="small"
                            sx={{
                              bgcolor: r.gender === "M" ? "#dbeafe" : "#fce7f3",
                              color: r.gender === "M" ? "#1e40af" : "#be185d",
                            }}
                          />
                        </TableCell>
                        <TableCell>{r.nationality}</TableCell>
                        <TableCell>{r.course_applied_for}</TableCell>
                        <TableCell>{r.other_choices}</TableCell>
                        <TableCell>{r.study_mode}</TableCell>
                        <TableCell>{r.campus}</TableCell>
                        <TableCell>{r.olevel_school}</TableCell>
                        <TableCell>{r.olevel_year}</TableCell>
                        <TableCell>{r.olevel_index_number}</TableCell>
                        <TableCell>{r.olevel_scores}</TableCell>
                        <TableCell>{r.alevel_school}</TableCell>
                        <TableCell>{r.alevel_year}</TableCell>
                        <TableCell>{r.alevel_index_number}</TableCell>
                        <TableCell>{r.alevel_combination}</TableCell>
                        <TableCell>{r.alevel_scores}</TableCell>
                        <TableCell>{r.principal_subsidiaries}</TableCell>
                        <TableCell>{r.other_qualifications}</TableCell>
                        <TableCell>{r.institution}</TableCell>
                        <TableCell>{r.class_of_award}</TableCell>
                        <TableCell>{r.course_admitted_for}</TableCell>
                        <TableCell>{r.remarks}</TableCell>
                        <TableCell>{r.payments}</TableCell>
                        <TableCell>{r.admission_date}</TableCell>
                        <TableCell>{r.origin}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={26} align="center" sx={{ py: 3, color: "#999" }}>
                        No records match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* PAGINATION */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Showing {filtered.length === 0 ? 0 : applicantPage * applicantsPerPage + 1} to{" "}
              {Math.min((applicantPage + 1) * applicantsPerPage, filtered.length)} of {filtered.length}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={applicantPage === 0}
                onClick={() => setApplicantPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Typography sx={{ display: "flex", alignItems: "center", px: 1 }}>
                Page {applicantPage + 1}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={(applicantPage + 1) * applicantsPerPage >= filtered.length}
                onClick={() => setApplicantPage((p) => p + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* EXPORT DIALOG */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>Export to Excel</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography sx={{ mb: 2 }}>
            Export the currently filtered data to an Excel file.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            File: admissions-{new Date().toISOString().split("T")[0]}.xlsx
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleExportExcel}>
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}