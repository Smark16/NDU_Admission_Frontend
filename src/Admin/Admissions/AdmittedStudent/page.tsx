"use client";

import { useEffect, useState, useMemo, useContext } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Container,
  Grid,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CancelIcon from "@mui/icons-material/Cancel";

import {
  Visibility,
  Campaign as CampaignIcon,
  PictureAsPdf as PdfIcon,
  AutoAwesome as GenerateIcon,
  Block as RevokeIcon,
} from "@mui/icons-material";

import { Checkbox } from "@mui/material";
import { Link } from "react-router-dom";

import useAxios from "../../../AxiosInstance/UseAxios";
import AnnouncementDialog from "../../../ReUsables/AnnouncementDialog";
import { AuthContext } from "../../../Context/AuthContext";
import TableChartIcon from '@mui/icons-material/TableChart';

interface Admitted {
  id: number;
  batch: string;
  application: number;
  campus: string;
  program: string;
  name: string;
  student_id: string;
  reg_no: string;
  faculty: string;
  admission_date: string;
  is_registered_with_schoolpay:boolean;
  status: string;
  is_admitted: boolean;
  is_registered: boolean;
  is_approved: boolean;
  approved_by_name: string | null;
  approved_at: string | null;
  admission_letter_pdf: string | null;
}

type PersistedAdmittedFilters = {
  searchTerm: string;
  registrationFilter: "all" | "registered" | "not-registered";
  approvalFilter: "all" | "pending" | "approved";
  campusFilter: string;
  facultyFilter: string;
  programFilter: string;
  batchFilter: string;
  dateFrom: string;
  dateTo: string;
};

const ADMITTED_FILTERS_STORAGE_KEY = "ndu-admissions-admitted-filters-v1";

const readPersistedAdmittedFilters = (): PersistedAdmittedFilters | null => {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(ADMITTED_FILTERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      searchTerm: String(parsed.searchTerm ?? ""),
      registrationFilter: (parsed.registrationFilter as PersistedAdmittedFilters["registrationFilter"]) ?? "all",
      approvalFilter: (parsed.approvalFilter as PersistedAdmittedFilters["approvalFilter"]) ?? "all",
      campusFilter: String(parsed.campusFilter ?? "all"),
      facultyFilter: String(parsed.facultyFilter ?? "all"),
      programFilter: String(parsed.programFilter ?? "all"),
      batchFilter: String(parsed.batchFilter ?? "all"),
      dateFrom: String(parsed.dateFrom ?? ""),
      dateTo: String(parsed.dateTo ?? ""),
    };
  } catch {
    return null;
  }
};

export default function AdmittedStudents() {
  const theme = useTheme();
  const AxiosInstance = useAxios();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { loggeduser } = useContext(AuthContext) || {};
  const isRegistrar = loggeduser?.role === "Academic Registrar";
  const initialFilters = readPersistedAdmittedFilters();

  // States
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm ?? "");
  const [registrationFilter, setRegistrationFilter] = useState<"all" | "registered" | "not-registered">(
    initialFilters?.registrationFilter ?? "all"
  );
  const [approvalFilter, setApprovalFilter] = useState<"all" | "pending" | "approved">(initialFilters?.approvalFilter ?? "all");
  const [campusFilter, setCampusFilter] = useState(initialFilters?.campusFilter ?? "all");
  const [facultyFilter, setFacultyFilter] = useState(initialFilters?.facultyFilter ?? "all");
  const [programFilter, setProgramFilter] = useState(initialFilters?.programFilter ?? "all");
  const [batchFilter, setBatchFilter] = useState(initialFilters?.batchFilter ?? "all");
  const [dateFrom, setDateFrom] = useState(initialFilters?.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(initialFilters?.dateTo ?? "");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [admittedStudents, setAdmittedStudents] = useState<Admitted[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadExport, setLoadExport] = useState(false)

  const [revokeReason, setRevokeReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [letterActionLoading, setLetterActionLoading] = useState<Record<number, boolean>>({});
  const [schoolPayLoading, setSchoolPayLoading] = useState<Record<number, boolean>>({});

  const [selectedStudent, setSelectedStudent] = useState<Admitted | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  // Communication
  const [selectedAppIds, setSelectedAppIds] = useState<number[]>([]);
  const [commDialogOpen, setCommDialogOpen] = useState(false);

  // Column view per row (mobile)
  const [columnViewIndex, setColumnViewIndex] = useState<Record<number, number>>({});

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch data
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        setLoading(true);
        const { data } = await AxiosInstance.get("/api/admissions/list_admitted_students");
        setAdmittedStudents(data);
      } catch (err) {
        console.error("Failed to fetch admitted students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, [AxiosInstance]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedAdmittedFilters = {
      searchTerm,
      registrationFilter,
      approvalFilter,
      campusFilter,
      facultyFilter,
      programFilter,
      batchFilter,
      dateFrom,
      dateTo,
    };
    window.localStorage.setItem(ADMITTED_FILTERS_STORAGE_KEY, JSON.stringify(payload));
  }, [searchTerm, registrationFilter, approvalFilter, campusFilter, facultyFilter, programFilter, batchFilter, dateFrom, dateTo]);

  const allCampuses = useMemo(
    () => [...new Set(admittedStudents.map((s) => (s.campus || "").trim()).filter(Boolean))],
    [admittedStudents]
  );
  const allFaculties = useMemo(
    () => [...new Set(admittedStudents.map((s) => (s.faculty || "").trim()).filter(Boolean))],
    [admittedStudents]
  );
  const allPrograms = useMemo(
    () => [...new Set(admittedStudents.map((s) => (s.program || "").trim()).filter(Boolean))],
    [admittedStudents]
  );
  const allBatches = useMemo(
    () => [...new Set(admittedStudents.map((s) => (s.batch || "").trim()).filter(Boolean))],
    [admittedStudents]
  );

  const showToast = (message: string, severity: "success" | "error" | "info" = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const setStudentActionLoading = (studentId: number, isLoading: boolean) => {
    setLetterActionLoading((prev) => ({ ...prev, [studentId]: isLoading }));
  };

  const setSchoolPayActionLoading = (studentId: number, isLoading: boolean) => {
  setSchoolPayLoading((prev) => ({ ...prev, [studentId]: isLoading }));
  };

  // Handlers
  const handleApproveClick = (student: Admitted) => {
    setSelectedStudent(student);
    setApproveDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedStudent) return;
    setActionLoading(true);

    try {
      await AxiosInstance.post(`/api/admissions/approve_admission/${selectedStudent.id}/`);
      setAdmittedStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id ? { ...s, is_approved: true } : s
        )
      );
      setApproveDialogOpen(false);
      showToast("Admission approved successfully.", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to approve admission.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeClick = (student: Admitted) => {
    // Remove focus from clicked button
    (document.activeElement as HTMLElement)?.blur?.();
    setSelectedStudent(student);
    setRevokeReason("");
    setRevokeDialogOpen(true);
  };

  const confirmRevoke = async () => {
    if (!selectedStudent) return;
    const reason = revokeReason.trim();
    if (!reason) {
      showToast("Please provide a revocation reason.", "error");
      return;
    }

    setActionLoading(true);
    try {
      await AxiosInstance.post(
        `/api/admissions/admitted_students/${selectedStudent.id}/revoke/`,
        { reason }
      );

      setAdmittedStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setRevokeDialogOpen(false);
      setRevokeReason("");
      showToast("Admission revoked successfully.", "success");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Could not revoke admission.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filters
  const filteredStudents = useMemo(() => {
    return admittedStudents.filter((student) => {
      const matchesSearch =
        (student.student_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegistration =
        registrationFilter === "all" ||
        (registrationFilter === "registered" && student.is_registered) ||
        (registrationFilter === "not-registered" && !student.is_registered);

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "pending" && !student.is_approved) ||
        (approvalFilter === "approved" && student.is_approved);
      const matchesCampus = campusFilter === "all" || student.campus === campusFilter;
      const matchesFaculty = facultyFilter === "all" || student.faculty === facultyFilter;
      const matchesProgram = programFilter === "all" || student.program === programFilter;
      const matchesBatch = batchFilter === "all" || student.batch === batchFilter;

      const admittedDate = student.admission_date ? new Date(student.admission_date) : null;
      const matchesDateFrom = !dateFrom || (admittedDate ? admittedDate >= new Date(`${dateFrom}T00:00:00`) : false);
      const matchesDateTo = !dateTo || (admittedDate ? admittedDate <= new Date(`${dateTo}T23:59:59.999`) : false);

      return (
        matchesSearch &&
        matchesRegistration &&
        matchesApproval &&
        matchesCampus &&
        matchesFaculty &&
        matchesProgram &&
        matchesBatch &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [admittedStudents, searchTerm, registrationFilter, approvalFilter, campusFilter, facultyFilter, programFilter, batchFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm("");
    setRegistrationFilter("all");
    setApprovalFilter("all");
    setCampusFilter("all");
    setFacultyFilter("all");
    setProgramFilter("all");
    setBatchFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(0);
    if (typeof window !== "undefined") window.localStorage.removeItem(ADMITTED_FILTERS_STORAGE_KEY);
  };

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Column groups for mobile horizontal scrolling
  const columnGroups = isMobile
    ? [
        ["student_id", "reg_no", "name", "status", "admission"],
        ["program", "faculty", "campus", "batch", "admission_date"],
      ]
    : [
        ["student_id", "reg_no", "name", "program", "faculty", "status", "admission"],
        ["campus", "batch", "admission_date"],
      ];

  const getVisibleColumns = (studentId: number) => {
    const index = columnViewIndex[studentId] ?? 0;
    return columnGroups[index] ?? columnGroups[0];
  };

  const handleNextColumns = (studentId: number) => {
    setColumnViewIndex((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] ?? 0) + 1 >= columnGroups.length ? 0 : (prev[studentId] ?? 0) + 1,
    }));
  };

  const handlePrevColumns = (studentId: number) => {
    setColumnViewIndex((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] ?? 0) === 0 ? columnGroups.length - 1 : (prev[studentId] ?? 0) - 1,
    }));
  };

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/+$/, "") || "";

  const toAbsoluteUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const normalized = url.startsWith("/") ? url : `/${url}`;
    return `${apiBaseUrl || window.location.origin}${normalized}`;
  };

// EXPORT ADMITTED STUDENTS - CORRECTED
const handleExportExcel = async () => {
  try {
    setLoadExport(true);

    const params = new URLSearchParams();

    // Add your current filters to match backend expectations
    if (batchFilter && batchFilter !== "all") {
      params.append("batch", batchFilter);
    }

    if (campusFilter && campusFilter !== "all") {
        params.append("campus", campusFilter);
    }

    if (facultyFilter && facultyFilter !== "all") {
      params.append("faculty", facultyFilter);
    }

    if (programFilter && programFilter !== "all") {
      params.append("program", programFilter);
    }

    if (registrationFilter !== "all") {
      params.append("is_registered", registrationFilter === "registered" ? "true" : "false");
    }

    // You can add academic year if you have it in state
    // params.append("academic_year", currentAcademicYear || "");

    const url = `/api/admission_reports/export_admitted_students/?${params.toString()}`;

    const response = await AxiosInstance.get(url, { 
      responseType: "blob" 
    });

    // Create download link
    const blob = new Blob([response.data], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `admitted_students_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    showToast("Admitted Students exported successfully!", "success");

  } catch (err: any) {
    console.error("Export failed:", err);
    const errorMsg = err?.response?.data?.detail || 
                    err?.response?.data?.error || 
                    "Failed to export Excel file";
    showToast(errorMsg, "error");
  } finally {
    setLoadExport(false);
  }
};

  const handleGenerateOfferLetter = async (student: Admitted) => {
    setStudentActionLoading(student.id, true);
    try {
      const { data } = await AxiosInstance.post(`/api/offer_letter/send_letter/${student.application}`);
      const updatedPdf = data?.pdf_url ? toAbsoluteUrl(data.pdf_url) : student.admission_letter_pdf;

      setAdmittedStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, admission_letter_pdf: updatedPdf } : s))
      );
      showToast(data?.detail || "Offer letter generated.", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to generate offer letter.", "error");
    } finally {
      setStudentActionLoading(student.id, false);
    }
  };

  const handlePrintOfferLetter = (student: Admitted) => {
    if (!student.admission_letter_pdf) {
      showToast("No offer letter available. Generate it first.", "info");
      return;
    }
    const url = toAbsoluteUrl(student.admission_letter_pdf);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleGenerateSchoolPayCode = async (student: Admitted) => {
  setSchoolPayActionLoading(student.id, true);

  try {
    const { data } = await AxiosInstance.post(
      `/api/payments/register_with_schoolpay/${student.id}/`
    );

    setAdmittedStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,
              is_registered_with_schoolpay: true,
              schoolpay_code: data.schoolpay_code,
              student_id: data.schoolpay_code || s.student_id,
            }
          : s
      )
    );

    showToast(
      data.detail || "SchoolPay code generated successfully.",
      "success"
    );
  } catch (err: any) {
    const errorMessage =
      err?.response?.data?.details ||
      err?.response?.data?.error ||
      "Failed to generate SchoolPay code.";

    showToast(errorMessage, "error");
  } finally {
    setSchoolPayActionLoading(student.id, false);
  }
};

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SchoolIcon sx={{ fontSize: 32, color: "#0D0060" }} />
            <Typography variant="h4" fontWeight={700}>
              Admitted Students
            </Typography>
          </Stack>
          
          <Box sx={{display:"flex", gap:2}}>
          <Button
            variant="contained"
            startIcon={<CampaignIcon />}
            onClick={() => setCommDialogOpen(true)}
            sx={{ bgcolor: "#0D0060", "&:hover": { bgcolor: "#0a004a" }, textTransform: "none", fontWeight: 700 }}
          >
            {selectedAppIds.length > 0 ? `Send to ${selectedAppIds.length}` : "Send Communication"}
          </Button>

          <Button
            variant="contained"
            startIcon={loadExport ? <CircularProgress size={20} color="inherit" /> : <TableChartIcon />}
            onClick={handleExportExcel}
            disabled={loadExport}
            sx={{ 
              backgroundColor: '#217346', // Excel green
              '&:hover': { backgroundColor: '#1e6b3f' },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loadExport ? "Exporting..." : "Export to Excel"}
          </Button>
          </Box>

          
        </Stack>

        {/* Filters */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by Student ID, Name, or Program..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Registration Status</InputLabel>
              <Select
                value={registrationFilter}
                label="Registration Status"
                onChange={(e) => {
                  setRegistrationFilter(e.target.value as typeof registrationFilter);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="registered">Registered Only</MenuItem>
                <MenuItem value="not-registered">Not Registered</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Campus</InputLabel>
              <Select
                value={campusFilter}
                label="Campus"
                onChange={(e) => {
                  setCampusFilter(e.target.value as string);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All campuses</MenuItem>
                {allCampuses.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Faculty</InputLabel>
              <Select
                value={facultyFilter}
                label="Faculty"
                onChange={(e) => {
                  setFacultyFilter(e.target.value as string);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All faculties</MenuItem>
                {allFaculties.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Program</InputLabel>
              <Select
                value={programFilter}
                label="Program"
                onChange={(e) => {
                  setProgramFilter(e.target.value as string);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All programs</MenuItem>
                {allPrograms.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Batch</InputLabel>
              <Select
                value={batchFilter}
                label="Batch"
                onChange={(e) => {
                  setBatchFilter(e.target.value as string);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All batches</MenuItem>
                {allBatches.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Approval Status</InputLabel>
              <Select
                value={approvalFilter}
                label="Approval Status"
                onChange={(e) => {
                  setApprovalFilter(e.target.value as typeof approvalFilter);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending Registrar Approval</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date From"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date To"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={clearFilters}
              sx={{ textTransform: "none", height: 40 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Table Card */}
      <Card sx={{ boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}>
        {loading ? (
          <Box sx={{ p: 8, textAlign: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#7c1519" }} />
            <Typography color="text.secondary" sx={{ mt: 3 }}>
              Loading admitted students...
            </Typography>
          </Box>
        ) : filteredStudents.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#0D0060" }}>
                    <TableCell padding="checkbox" sx={{ color: "white" }}>
                      <Checkbox
                        sx={{ color: "white", "&.Mui-checked": { color: "white" } }}
                        indeterminate={
                          paginatedStudents.some((s) => selectedAppIds.includes(s.application)) &&
                          !paginatedStudents.every((s) => selectedAppIds.includes(s.application))
                        }
                        checked={
                          paginatedStudents.length > 0 &&
                          paginatedStudents.every((s) => selectedAppIds.includes(s.application))
                        }
                        onChange={() => {
                          const ids = paginatedStudents.map((s) => s.application);
                          const allSelected = ids.every((id) => selectedAppIds.includes(id));
                          setSelectedAppIds((prev) =>
                            allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>Student ID</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>Reg No</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>Name</TableCell>

                    {getVisibleColumns(0).includes("program") && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Program</TableCell>
                    )}
                    {getVisibleColumns(0).includes("faculty") && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Faculty</TableCell>
                    )}
                    {getVisibleColumns(0).includes("campus") && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Campus</TableCell>
                    )}
                    {getVisibleColumns(0).includes("batch") && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Batch</TableCell>
                    )}
                    {getVisibleColumns(0).includes("admission_date") && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Admission Date</TableCell>
                    )}
                    {getVisibleColumns(0).includes("status") && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Reg. Status</TableCell>
                    )}
                    {getVisibleColumns(0).includes("admission") && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Approval</TableCell>
                    )}

                    <TableCell align="center" sx={{ color: "white", fontWeight: 700 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedStudents.map((student) => {
                    const visibleColumns = getVisibleColumns(student.id);
                    const viewIndex = columnViewIndex[student.id] ?? 0;

                    return (
                      <TableRow key={student.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedAppIds.includes(student.application)}
                            onChange={() =>
                              setSelectedAppIds((prev) =>
                                prev.includes(student.application)
                                  ? prev.filter((x) => x !== student.application)
                                  : [...prev, student.application]
                              )
                            }
                          />
                        </TableCell>

                        <TableCell sx={{ fontWeight: 600 }}>{student.student_id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{student.reg_no}</TableCell>
                        <TableCell>{student.name}</TableCell>

                        {visibleColumns.includes("program") && <TableCell>{student.program}</TableCell>}
                        {visibleColumns.includes("faculty") && <TableCell>{student.faculty}</TableCell>}
                        {visibleColumns.includes("campus") && <TableCell>{student.campus}</TableCell>}
                        {visibleColumns.includes("batch") && <TableCell>{student.batch}</TableCell>}
                        {visibleColumns.includes("admission_date") && (
                          <TableCell>{formatDate(student.admission_date)}</TableCell>
                        )}
                        {visibleColumns.includes("status") && (
                          <TableCell>
                            <Chip
                              label={student.is_registered ? "Registered" : "Not Registered"}
                              color={student.is_registered ? "success" : "warning"}
                              size="small"
                            />
                          </TableCell>
                        )}
                        {visibleColumns.includes("admission") && (
                          <TableCell>
                            <Chip
                              label={student.is_approved ? "Approved" : "Pending"}
                              color={student.is_approved ? "success" : "warning"}
                              size="small"
                            />
                          </TableCell>
                        )}

                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" flexWrap="nowrap">
                            {columnGroups.length > 1 && (
                              <>
                                <IconButton size="small" onClick={() => handlePrevColumns(student.id)} disabled={viewIndex === 0}>
                                  <ChevronLeftIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleNextColumns(student.id)} disabled={viewIndex === columnGroups.length - 1}>
                                  <ChevronRightIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}

                            {isRegistrar && !student.is_approved && (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveClick(student)}
                                title="Approve"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            )}

                            <IconButton
                              size="small"
                              color="primary"
                              component={Link}
                              to={`/admin/admitted_student_review/${student.application}`}
                              title="View"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleGenerateOfferLetter(student)}
                              disabled={letterActionLoading[student.id]}
                              title="Generate Offer Letter"
                            >
                              <GenerateIcon fontSize="small" />
                            </IconButton>

                            {/* pay code retry */}
                            <IconButton
                              size="small"
                              color={
                                student.is_registered_with_schoolpay ? "success" : "warning"
                              }
                              onClick={() => handleGenerateSchoolPayCode(student)}
                              disabled={schoolPayLoading[student.id]}
                              title={
                                student.is_registered_with_schoolpay
                                  ? "Retry SchoolPay Registration"
                                  : "Generate SchoolPay Code"
                              }
                            >
                              {schoolPayLoading[student.id] ? (
                                <CircularProgress size={18} />
                              ) : (
                                <SchoolIcon fontSize="small" />
                              )}
                            </IconButton>

                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handlePrintOfferLetter(student)}
                              disabled={letterActionLoading[student.id]}
                              title="Print Offer Letter"
                            >
                              <PdfIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="primary"
                              component={Link}
                              to={`/admin/edit_admitted_student/${student.id}`}
                              title="Edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRevokeClick(student)}
                              title="Revoke Admission"
                            >
                              <RevokeIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <SchoolIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No admitted students found
            </Typography>
          </Box>
        )}
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: "#0D0060" }}>Approve Admission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Approve admission for <strong>{selectedStudent?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={confirmApprove} disabled={actionLoading}>
            {actionLoading ? "Approving..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialogOpen} onClose={() => setRevokeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: "#c0001a" }}>Revoke Admission</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Revoke admission for <strong>{selectedStudent?.name}</strong>?
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Revocation Reason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="Please provide a reason..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmRevoke} disabled={actionLoading}>
            {actionLoading ? "Revoking..." : "Revoke"}
          </Button>
        </DialogActions>
      </Dialog>

      <AnnouncementDialog
        open={commDialogOpen}
        onClose={() => setCommDialogOpen(false)}
        selectedIds={selectedAppIds.length > 0 ? selectedAppIds : undefined}
        context="admitted student"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}