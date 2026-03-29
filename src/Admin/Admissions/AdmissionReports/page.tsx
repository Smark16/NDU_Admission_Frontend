"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
} from "@mui/material";
import { FileDownload as FileDownloadIcon } from "@mui/icons-material";
import ApplicantsDB from "./applicants_db";
import Charts, { type FacultyAdmitted } from "./charts";
import useAxios from "../../../AxiosInstance/UseAxios";
import CustomButton from "../../../ReUsables/custombutton";

interface ReportStats {
  admission_period: string;
  total_applications: number;
  academic_year: string;
  accepted: number;
  rejected: number;
  total_admitted: number;
  pending: number;
}
interface FacultyStats {
  faculty: string;
  admitted: number;
}
interface FacultyStudents {
  academic_year: string;
  admission_period: string;
  faculty_data: FacultyStats[];
}

/* ------------------------------------------------------------------ */
/* 1. MAIN COMPONENT                                                  */
/* ------------------------------------------------------------------ */
export default function AdmissionsReport() {
  const AxiosInstance = useAxios();

  /* ------------------- state --------------------------------------- */
  const [stats, setStats] = useState<ReportStats[]>([]);
  const [facultyStudents, setFacultyStudents] = useState<FacultyStudents[]>([]);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  /* filters that are passed down to the table */
  const [academicYear, setAcademicYear] = useState("");
  const [admissionPeriod, setAdmissionPeriod] = useState("");
  const [campusFilter, setCampusFilter] = useState("all");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantPage, setApplicantPage] = useState(0);
  const applicantsPerPage = 10;

  /* ------------------- API calls ----------------------------------- */
  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const { data } = await AxiosInstance.get<ReportStats[]>("/api/admission_reports/general_overview");
      setStats(data);
      setIsLoading(false)
    } catch (e) { console.error(e); }
  };
  const fetchFacultyChart = async () => {
    try {
      setIsLoading(true)
      const { data } = await AxiosInstance.get<FacultyStudents[]>("/api/admission_reports/Admitted_students_by_Faculty");
      setFacultyStudents(data);
      setIsLoading(false)
    } catch (e) { console.error(e); }
  };
  useEffect(() => {
    fetchStats();
    fetchFacultyChart();
  }, []);

  /* ------------------- key helpers --------------------------------- */
  const getKey = (s: ReportStats) => `${s.admission_period}||${s.academic_year}`;
  const defaultKey = stats[0] ? getKey(stats[0]) : "";
  const [selectedKey, setSelectedKey] = useState(defaultKey);
  useEffect(() => {
    if (stats.length && !selectedKey) setSelectedKey(getKey(stats[0]));
  }, [stats, selectedKey]);

  /* ------------------- selected stats ------------------------------ */
  const selectedStat = useMemo(() => {
    if (!selectedKey) return null;
    const [period, year] = selectedKey.split("||");
    return stats.find(s => s.admission_period === period && s.academic_year === year) ?? null;
  }, [selectedKey, stats]);

  const facultyChartStats = useMemo(() => {
    if (!selectedKey) return null;
    const [period, year] = selectedKey.split("||");
    return facultyStudents.find(s => s.admission_period === period && s.academic_year === year) ?? null;
  }, [selectedKey, facultyStudents]);

  /* ------------------- chart data --------------------------------- */
  const facultyAdmittedData: FacultyAdmitted[] = facultyChartStats?.faculty_data ?? [];
  const totalAdmitted = facultyAdmittedData.reduce((s, i) => s + i.admitted, 0);

  /* ------------------- UI ------------------------------------------ */
  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Admissions Report
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Comprehensive analytics and insights on your admission process
        </Typography>
      </Box>

      {/* Intake selector */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Admission Intake</InputLabel>
            <Select value={selectedKey} onChange={e => setSelectedKey(e.target.value)} label="Admission Intake">
              {stats.map(item => {
                const k = getKey(item);
                return (
                  <MenuItem key={k} value={k}>
                    {item.admission_period} ({item.academic_year})
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ---------- STAT CARDS ---------- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: "Total Applications", value: selectedStat?.total_applications ?? 0, grad: "135deg, #667eea 0%, #764ba2 100%" },
          { label: "Pending Applications", value: selectedStat?.pending ?? 0, grad: "135deg, #8b5cf6 0%, #7c3aed 100%" },
          { label: "Rejected Applications", value: selectedStat?.rejected ?? 0, grad: "135deg, #ec4899 0%, #be185d 100%" },
          { label: "Total Admitted Students", value: selectedStat?.total_admitted ?? 0, grad: "135deg, #10b981 0%, #059669 100%" },
        ].map((c, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: `linear-gradient(${c.grad})` }}>
              <CardContent>
                <Typography sx={{ color: "white", mb: 1, fontSize: 12, fontWeight: 600 }}>{c.label}</Typography>
                {isLoading ? <LinearProgress/> : (
                  <Typography sx={{ color: "white", fontSize: 28, fontWeight: 700, mb: 1 }}>{c.value}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ---------- CHARTS ---------- */}
      <Charts facultyAdmittedData={facultyAdmittedData} totalAdmitted={totalAdmitted} />

      {/* ---------- APPLICANTS TABLE ---------- */}
      <ApplicantsDB
        academicYear={academicYear}
        setAcademicYear={setAcademicYear}
        admissionPeriod={admissionPeriod}
        setAdmissionPeriod={setAdmissionPeriod}
        campusFilter={campusFilter}
        setCampusFilter={setCampusFilter}
        applicantSearch={applicantSearch}
        setApplicantSearch={setApplicantSearch}
        applicantPage={applicantPage}
        setApplicantPage={setApplicantPage}
        applicantsPerPage={applicantsPerPage}
        setSnackbarMessage={setSnackbarMessage}
        setShowSnackbar={setShowSnackbar}
        openExportDialog={openExportDialog}
        setOpenExportDialog={setOpenExportDialog}
      />

      {/* ---------- EXPORT BUTTON (outside table) ---------- */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomButton icon={<FileDownloadIcon />} onClick={() => setOpenExportDialog(true)} fullWidth text="Export to Excel"/>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ---------- SNACKBAR ---------- */}
      {showSnackbar && (
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          sx={{ position: "fixed", bottom: 20, right: 20, minWidth: 300 }}
        >
          {snackbarMessage}
        </Alert>
      )}
    </Box>
  );
}