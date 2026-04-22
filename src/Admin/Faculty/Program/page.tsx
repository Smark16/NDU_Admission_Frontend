"use client";

import React, { useEffect, useState, type ChangeEvent } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
  // InputAdornment,
  Paper,
  LinearProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  School as SchoolIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";

import BulkUpload from "./bulk_upload";
import ListPrograms from "./list_programs";
import Manage from "./manage";
import CustomButton from "../../../ReUsables/custombutton";
import useAxios from "../../../AxiosInstance/UseAxios";

interface Campus {
  id: number;
  name: string;
  code?: string;
}

interface Faculty {
  id: number;
  name: string;
}

interface AcademicLevel {
  id: number;
  name: string;
}

interface Program {
  id: number;
  name: string;
  short_form: string;
  code: string;
  academic_level: string;
  campuses: Campus[];
  faculty: string;
  min_years?: number;
  max_years?: number;
  is_active: boolean;
}

interface ProgramStats {
  total_programs: number;
  active_programs: number;
  campus_breakdown: Array<{
    id: number;
    name: string;
    program_count: number;
    active_program_count: number;
  }>;
}

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
}

const ProgramManagement: React.FC = () => {
  const AxiosInstance = useAxios();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<number | "">("");
  const [selectedCampus, setSelectedCampus] = useState<number | "">("");
  const [selectedLevel, setSelectedLevel] = useState<number | "">("");

  const [programStats, setProgramStats] = useState<ProgramStats | null>(null);
  const [programStatsLoading, setProgramStatsLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({ open: false, message: "", type: "success" });
  const [bulkUploadResult, setBulkUploadResult] = useState<BulkUploadResult | null>(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadProgram, setDownLoadProgram] = useState(false);

  const initialForm = {
    name: "",
    short_form: "",
    code: "",
    academic_level: null as number | null,
    campuses: [] as number[],
    faculty: null as number | null,
    min_years: undefined as number | undefined,
    max_years: undefined as number | undefined,
    is_active: true,
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch Academic Levels
  const fetchAcademicLevels = async () => {
    try {
      const response = await AxiosInstance.get<AcademicLevel[]>("/api/admissions/list_academic_level");
      setAcademicLevels(response.data);
    } catch (err) {
      console.error("Failed to fetch academic levels", err);
    }
  };

  // Fetch Programs
  const fetchPrograms = async () => {
    try {
      const response = await AxiosInstance.get("/api/program/list_programs");
      setPrograms(response.data);
    } catch (e) {
      console.error("Failed to fetch programs", e);
    }
  };

  const fetchCampuses = async () => {
    try {
      const { data } = await AxiosInstance.get<Campus[]>("/api/accounts/list_campus");
      setCampuses(data);
    } catch (e) {
      console.error("Failed to fetch campuses", e);
    }
  };

  const fetchFaculties = async () => {
    try {
      const { data } = await AxiosInstance.get<Faculty[]>("/api/admissions/faculties");
      setFaculties(data);
    } catch (e) {
      console.error("Failed to fetch faculties", e);
    }
  };

  // Program Stats
  const fetchProgramStats = async () => {
    try {
      setProgramStatsLoading(true);
      const { data } = await AxiosInstance.get<ProgramStats>("/api/program/program_statistics");
      setProgramStats(data);
    } catch (err: any) {
      console.error("Failed to fetch program stats", err);
    } finally {
      setProgramStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchCampuses();
    fetchFaculties();
    fetchAcademicLevels();
    fetchProgramStats();
  }, []);

  // Enhanced filtered programs with all filters
  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFaculty =
      !selectedFaculty ||
      faculties.find((f) => f.id === selectedFaculty)?.name === p.faculty;

    const matchesCampus =
      !selectedCampus || p.campuses.some((c) => c.id === selectedCampus);

    const matchesLevel =
      !selectedLevel ||
      academicLevels.find((al) => al.id === selectedLevel)?.name === p.academic_level;

    return matchesSearch && matchesFaculty && matchesCampus && matchesLevel;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFaculty("");
    setSelectedCampus("");
    setSelectedLevel("");
  };

  // Handle Campus Multi-Select Change
  const handleCampusChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    const selectedIds = typeof value === "string" ? value.split(",").map(Number) : value;
    setFormData((prev) => ({ ...prev, campuses: selectedIds }));
  };

  // open dialog
  const handleOpenDialog = (program?: Program) => {
    if (program) {
      setEditingId(program.id);
      const facultyObj = faculties.find((f) => f.name === program.faculty);
      const academicLevelObj = academicLevels.find((al) => al.name === program.academic_level);
      setFormData({
        name: program.name,
        short_form: program.short_form,
        code: program.code,
        academic_level: academicLevelObj?.id ?? null,
        campuses: program.campuses.map((c) => c.id),
        faculty: facultyObj?.id ?? null,
        min_years: program.min_years,
        max_years: program.max_years,
        is_active: program.is_active,
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  // Save Program
  const handleSaveProgram = async () => {
    if (!formData.name) {
      setSnackbar({ open: true, message: "Name and Code are required", type: "error" });
      return;
    }
    setIsLoading(true);
    const payload = {
      ...formData,
      academic_level: Number(formData.academic_level),
      campuses: formData.campuses,
      faculty: formData.faculty || null,
    };

    try {
      if (editingId) {
        const { data } = await AxiosInstance.put<Program>(`/api/program/update_program/${editingId}`, payload);
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...data,
                  faculty: faculties.find((f) => f.id === Number(data.faculty))?.name ?? data.faculty,
                  academic_level: academicLevels.find((a) => a.id === Number(data.academic_level))?.name ?? data.academic_level,
                }
              : p
          )
        );
        setSnackbar({ open: true, message: "Program updated", type: "success" });
      } else {
        const { data } = await AxiosInstance.post<Program>("/api/program/create_programs", payload);
        setPrograms((prev) => [
          ...prev,
          {
            ...data,
            faculty: faculties.find((f) => f.id === Number(data.faculty))?.name ?? data.faculty,
            academic_level: academicLevels.find((a) => a.id === Number(data.academic_level))?.name ?? data.academic_level,
          },
        ]);
        setSnackbar({ open: true, message: "Program created", type: "success" });
      }
      handleCloseDialog();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.response?.data?.detail || "Save failed", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Program
  const handleDeleteProgram = async (id: number) => {
    try {
      setIsLoading(true);
      await AxiosInstance.delete(`/api/program/delete_program/${id}`);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      setSnackbar({ open: true, message: "Program deleted", type: "success" });
    } catch (e) {
      setSnackbar({ open: true, message: "Delete failed", type: "error" });
    } finally {
      setDeleteConfirm(null);
      setIsLoading(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: number) => {
    const prog = programs.find((p) => p.id === id);
    if (!prog) return;
    try {
      const { data } = await AxiosInstance.patch<Program>(`/api/program/change_status/${id}`, {
        is_active: !prog.is_active,
      });
      setPrograms((prev) => prev.map((p) => (p.id === id ? data : p)));
      setSnackbar({
        open: true,
        message: `program has been ${data.is_active ? "activated" : "deactivated"} successfully`,
        type: "success",
      });
    } catch (e) {
      console.error(e);
    }
  };

  // bulk upload
  const handleBulkUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setBulkUploadResult(null);
    setBulkUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file_name", file.name);
      formDataUpload.append("file_path", file);

      const response = await AxiosInstance.post("/api/program/bulk_upload", formDataUpload, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setBulkUploadProgress(percent);
          }
        },
      });

      const summary = response.data.summary || {
        success: response.data.created_programs?.length || 0,
        failed: response.data.failed_count || 0,
        errors: response.data.errors || [],
      };

      setBulkUploadResult(summary);

      if (response.data.created_programs?.length) {
        const normalizedNewPrograms = response.data.created_programs.map((p: any) => ({
          ...p,
          faculty: faculties.find((f) => f.id === Number(p.faculty))?.name ?? "Unknown Faculty",
          academic_level: academicLevels.find((al) => al.id === Number(p.academic_level))?.name ?? "Unknown Level",
          campuses: Array.isArray(p.campuses)
            ? p.campuses.map((c: any) => (typeof c === "object" ? c : campuses.find((cc) => cc.id === c))).filter(Boolean)
            : [],
        }));

        setPrograms((prev) => [...prev, ...normalizedNewPrograms]);
      }

      setSnackbar({
        open: true,
        message: `${summary.success} program(s) imported successfully`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Bulk upload failed:", err);
      const data = err.response?.data;
      setBulkUploadResult({
        success: 0,
        failed: 1,
        errors: [data?.detail || "Unknown error occurred"],
      });
      setSnackbar({
        open: true,
        message: data?.detail || "Upload failed",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setBulkUploadProgress(100);
      setTimeout(() => setBulkUploadProgress(0), 1000);
      e.target.value = "";
    }
  };

  // Export to Excel (Template)
  const handleExportExcel = async () => {
    try {
      setIsLoading(true);
      const url = "/api/program/download_program_sheet";
      const resp = await AxiosInstance.get(url, { responseType: "blob" });

      const blob = new Blob([resp.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `programs-template-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setSnackbar({ open: true, message: "Template downloaded successfully!", type: "success" });
    } catch (e) {
      setSnackbar({ open: true, message: "Export failed. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Download programs
  const handleExport = async () => {
    try {
      setDownLoadProgram(true);
      const url = "/api/program/export_program_data";
      const resp = await AxiosInstance.get(url, { responseType: "blob" });

      const blob = new Blob([resp.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `programs-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setSnackbar({ open: true, message: "Programs downloaded successfully.", type: "success" });
    } catch (error: any) {
      console.log(error);
      setSnackbar({ open: true, message: "Export failed. Please try again.", type: "error" });
    } finally {
      setDownLoadProgram(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 32, color: "#0D0060" }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Program Management
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Manage academic programs, fees, and enrollment information
        </Typography>
      </Box>

      {/* Stats Cards - Using your original Grid size syntax */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #0D0060 0%, #07003A 100%)", color: "white" }}>
            <CardContent>
              <Typography color="inherit" variant="body2" sx={{ mb: 1 }}>Total Programs</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {programStatsLoading ? <LinearProgress /> : programStats?.total_programs || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #f05f64ff 0%, #7c1519 100%)", color: "white" }}>
            <CardContent>
              <Typography color="inherit" variant="body2" sx={{ mb: 1 }}>Active Programs</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {programStatsLoading ? <LinearProgress /> : programStats?.active_programs || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Dynamic Campus Stats - Top 2 Campuses */}
        {(programStats?.campus_breakdown || []).slice(0, 2).map((campus, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={campus.id}>
            <Card
              sx={{
                background: index === 0
                  ? "linear-gradient(135deg, #0D0060 0%, #0D0060 100%)"
                  : "linear-gradient(135deg, #f07a7eff 0%, #7c1519 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ mb: 1 }}>
                  {campus.name} 
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {campus.program_count} Programs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search + Filters + Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Filter Programs
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Search programs by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
              }}
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Faculty</InputLabel>
              <Select
                value={selectedFaculty}
                label="Faculty"
                onChange={(e: SelectChangeEvent<number | "">) => setSelectedFaculty(Number(e.target.value) || "")}
              >
                <MenuItem value="">All Faculties</MenuItem>
                {faculties.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Campus</InputLabel>
              <Select
                value={selectedCampus}
                label="Campus"
                onChange={(e: SelectChangeEvent<number | "">) => setSelectedCampus(Number(e.target.value) || "")}
              >
                <MenuItem value="">All Campuses</MenuItem>
                {campuses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Academic Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Academic Level"
                onChange={(e: SelectChangeEvent<number | "">) => setSelectedLevel(Number(e.target.value) || "")}
              >
                <MenuItem value="">All Levels</MenuItem>
                {academicLevels.map((al) => (
                  <MenuItem key={al.id} value={al.id}>
                    {al.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <CustomButton variant="text" onClick={resetFilters} text="Clear Filters" size="small" />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
        <CustomButton icon={<AddIcon />} onClick={() => handleOpenDialog()} text="Add Program" />
        <CustomButton
          icon={<CloudUploadIcon />}
          onClick={() => setOpenBulkDialog(true)}
          variant="outlined"
          text="Upload"
          sx={{ borderColor: "#7c1519", color: "#7c1519" }}
        />
        <CustomButton
          variant="outlined"
          icon={<FileDownloadIcon />}
          onClick={handleExportExcel}
          text={isLoading ? <CircularProgress size={20} /> : "Download sheet"}
          sx={{ borderColor: "#7c1519", color: "#7c1519" }}
        />
        <CustomButton
          icon={<FileDownloadIcon />}
          text={downloadProgram ? "Downloading..." : "DownLoad Programs"}
          onClick={handleExport}
        />
      </Box>

      {/* Table */}
      <ListPrograms
        programs={filteredPrograms}
        onEdit={handleOpenDialog}
        onDelete={setDeleteConfirm}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add/Edit Dialog */}
      <Manage
        open={openDialog}
        editingId={editingId}
        formData={formData}
        campuses={campuses}
        faculties={faculties}
        academicLevels={academicLevels}
        isLoading={isLoading}
        onClose={handleCloseDialog}
        onSave={handleSaveProgram}
        onFormChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
        onCampusChange={handleCampusChange}
      />

      {/* Bulk Upload Dialog */}
      <BulkUpload
        open={openBulkDialog}
        onClose={() => setOpenBulkDialog(false)}
        isUploading={isUploading}
        uploadProgress={bulkUploadProgress}
        result={bulkUploadResult}
        onUpload={handleBulkUpload}
        onResetResult={() => setBulkUploadResult(null)}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Program</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this program? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
            variant="outlined"
            text="Cancel"
            onClick={() => setDeleteConfirm(null)}
          />
          <CustomButton
            onClick={() => deleteConfirm !== null && handleDeleteProgram(deleteConfirm)}
            text={isLoading ? "deleting..." : "Delete"}
          />
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProgramManagement;