import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  School as SchoolIcon,
  Book as BookIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from '@mui/material/Select';
import useAxios from '../../AxiosInstance/UseAxios';

interface OLevelSubject { id: number; name: string; }
interface ALevelSubject { id: number; name: string; }

interface SubjectResult {
  id: string;
  subject: string;
  grade: string;
}

interface AdditionalQualification {
  institution: string;
  type: string;
  year: string;
  class_of_award: string;
}

interface AcademicResultsProps {
  formErrors: Record<string, string>;
  formData: any;
  handleOLevelSubjectChange: (id: string, field: string, value: string) => void;
  addOLevelSubject: () => void;
  removeOLevelSubject: (id: string) => void;
  handleALevelSubjectChange: (id: string, field: string, value: string) => void;
  addALevelSubject: () => void;
  removeALevelSubject: (id: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleChange: (event: SelectChangeEvent<string>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const AcademicResults: React.FC<AcademicResultsProps> = ({
  formData,
  formErrors,
  handleOLevelSubjectChange: _handleOLevelSubjectChange,
  addOLevelSubject: _addOLevelSubject,
  removeOLevelSubject: _removeOLevelSubject,
  handleALevelSubjectChange: _handleALevelSubjectChange,
  addALevelSubject: _addALevelSubject,
  removeALevelSubject: _removeALevelSubject,
  handleInputChange,
  setFormData,
}) => {
  const AxiosInstance = useAxios();

  const EXAM_GRADES: Record<string, string[]> = {
    UCE: ['D1', 'D2', 'C3', 'C4', 'C5', 'C6', 'P7', 'P8', 'F9'],
    GCE: ['A', 'B', 'C', 'D', 'E', 'O', 'F'],
  };
  const CORE_SUBJECTS = ['english language', 'mathematics'];

  const [olevelSubjectList, setOlevelSubjectList] = useState<OLevelSubject[]>([]);
  const [alevelSubjectList, setAlevelSubjectList] = useState<ALevelSubject[]>([]);
  const [examBody, setExamBody] = useState<'UCE' | 'GCE'>('UCE');

  // Fetch subjects
  const fetchOlevelSubjects = async () => {
    try {
      const response = await AxiosInstance.get('/api/admissions/list_olevel_subject');
      setOlevelSubjectList(response.data);
    } catch (err) {
      console.error('Error fetching O-Level subjects:', err);
    }
  };

  const fetchAlevelSubjects = async () => {
    try {
      const response = await AxiosInstance.get('/api/admissions/list_alevel_subject');
      setAlevelSubjectList(response.data);
    } catch (err) {
      console.error('Error fetching A-Level subjects:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([fetchOlevelSubjects(), fetchAlevelSubjects()]);
    };
    loadAll();
  }, []);

  // Map of subjectId -> grade for the grid view
  const gradeMap = useMemo(() => {
    const map: Record<string, string> = {};
    formData.oLevelSubjects.forEach((s: SubjectResult) => {
      if (s.subject && s.grade) map[s.subject] = s.grade;
    });
    return map;
  }, [formData.oLevelSubjects]);

  const handleGradeSelect = (subjectId: string, grade: string) => {
    setFormData((prev: any) => {
      const clean = prev.oLevelSubjects.filter((s: SubjectResult) => s.subject && s.grade);
      const idx = clean.findIndex((s: SubjectResult) => s.subject === subjectId);
      if (idx >= 0) {
        if (clean[idx].grade === grade) {
          return { ...prev, oLevelSubjects: clean.filter((s: SubjectResult) => s.subject !== subjectId) };
        }
        const updated = [...clean];
        updated[idx] = { ...updated[idx], grade };
        return { ...prev, oLevelSubjects: updated };
      }
      return { ...prev, oLevelSubjects: [...clean, { id: Date.now().toString(), subject: subjectId, grade }] };
    });
  };

  const sortedOLevelSubjects = useMemo(() => {
    return [...olevelSubjectList].sort((a, b) => {
      const aCore = CORE_SUBJECTS.includes(a.name.toLowerCase());
      const bCore = CORE_SUBJECTS.includes(b.name.toLowerCase());
      if (aCore && !bCore) return -1;
      if (!aCore && bCore) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [olevelSubjectList]);

  const coreCount = useMemo(
    () => sortedOLevelSubjects.filter(s => CORE_SUBJECTS.includes(s.name.toLowerCase())).length,
    [sortedOLevelSubjects]
  );

  const getGradeColor = (grade: string) => {
    if (['D1', 'D2', 'A'].includes(grade)) return '#2e7d32';
    if (['C3', 'C4', 'C5', 'C6', 'B', 'C'].includes(grade)) return '#1565c0';
    if (['P7', 'P8', 'D', 'E', 'O'].includes(grade)) return '#e65100';
    // Numeric grades: 1–3 distinction, 4–6 pass, 7–9 fail
    const n = parseInt(grade, 10);
    if (!isNaN(n)) {
      if (n <= 3) return '#2e7d32';
      if (n <= 6) return '#1565c0';
      return '#c62828';
    }
    return '#c62828';
  };

  const ALEVEL_EXAM_GRADES: Record<string, string[]> = {
    UACE: ['A', 'B', 'C', 'D', 'E', 'O', 'F'],
    Numeric: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  };
  const [aLevelExamBody, setALevelExamBody] = useState<'UACE' | 'Numeric'>('UACE');
  const ALEVEL_NUMERIC_ONLY_SUBJECTS = [
    'sub math',
    'subsidiary mathematics',
    'subsidiary computer',
    'subsidiary ict',
    'general paper',
    'gp',
  ];

  const requiresNumericOnlyGrade = (subjectName: string) => {
    const name = (subjectName || '').trim().toLowerCase();
    return ALEVEL_NUMERIC_ONLY_SUBJECTS.includes(name);
  };

  const aGradeMap = useMemo(() => {
    const map: Record<string, string> = {};
    formData.aLevelSubjects.forEach((s: SubjectResult) => {
      if (s.subject && s.grade) map[s.subject] = s.grade;
    });
    return map;
  }, [formData.aLevelSubjects]);

  const handleAGradeSelect = (subjectId: string, grade: string) => {
    setFormData((prev: any) => {
      const clean = prev.aLevelSubjects.filter((s: SubjectResult) => s.subject && s.grade);
      const idx = clean.findIndex((s: SubjectResult) => s.subject === subjectId);
      if (idx >= 0) {
        if (clean[idx].grade === grade) {
          return { ...prev, aLevelSubjects: clean.filter((s: SubjectResult) => s.subject !== subjectId) };
        }
        const updated = [...clean];
        updated[idx] = { ...updated[idx], grade };
        return { ...prev, aLevelSubjects: updated };
      }
      return { ...prev, aLevelSubjects: [...clean, { id: Date.now().toString(), subject: subjectId, grade }] };
    });
  };

  const sortedALevelSubjects = useMemo(
    () => [...alevelSubjectList].sort((a, b) => a.name.localeCompare(b.name)),
    [alevelSubjectList]
  );

  // Additional Qualifications Handlers
  const addAdditionalQualification = () => {
    setFormData((prev: any) => ({
      ...prev,
      additionalQualifications: [
        ...prev.additionalQualifications,
        { institution: '', type: '', year: '', class_of_award: '' }
      ]
    }));
  };

  const removeAdditionalQualification = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalQualifications: prev.additionalQualifications.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAdditionalQualChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      additionalQualifications: prev.additionalQualifications.map((qual: any, i: number) =>
        i === index ? { ...qual, [field]: value } : qual
      )
    }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* ==================== EDUCATION BACKGROUND ==================== */}
      <Paper sx={{ p: 3, bgcolor: "#f0f4ff", border: "1px solid #3e397b" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#1a3a52" }}>
          Education Background
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!formData.hasOLevel}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, hasOLevel: e.target.checked }))}
                />
              }
              label="I completed O-Level (S4)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!formData.hasALevel}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, hasALevel: e.target.checked }))}
                />
              }
              label="I completed A-Level (S6)"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ==================== O-LEVEL SECTION ==================== */}
      {formData.hasOLevel && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <BookIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
              O-Level Details
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Year of Sitting" name="oLevelYear" type="number" value={formData.oLevelYear} onChange={handleInputChange} required error={!!formErrors.oLevelYear} helperText={formErrors.oLevelYear} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Index/Center Number" name="oLevelIndexNumber" value={formData.oLevelIndexNumber} onChange={handleInputChange} required error={!!formErrors.oLevelIndexNumber} helperText={formErrors.oLevelIndexNumber} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="School Name" name="oLevelSchool" value={formData.oLevelSchool} onChange={handleInputChange} required error={!!formErrors.oLevelSchool} helperText={formErrors.oLevelSchool} />
            </Grid>
          </Grid>

          {/* Exam type selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#1a3a52" }}>
              Exam Type
            </Typography>
            <ToggleButtonGroup
              value={examBody}
              exclusive
              onChange={(_, val) => val && setExamBody(val)}
              size="small"
            >
              <ToggleButton value="UCE" sx={{ textTransform: "none", fontWeight: 600 }}>
                UCE / UNEB
              </ToggleButton>
              <ToggleButton value="GCE" sx={{ textTransform: "none", fontWeight: 600 }}>
                GCE / Cambridge
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Alert severity="info" sx={{ mb: 2, fontSize: "0.82rem" }}>
            Click a grade next to each subject you sat for. Click the selected grade again to clear it.
          </Alert>

          {formErrors.oLevelSubjects && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.oLevelSubjects}</Alert>}

          {/* Subject grid */}
          {olevelSubjectList.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#3e397b" }} />
            </Box>
          ) : (
            <Box sx={{ border: "1px solid #e0eef7", borderRadius: 1, overflow: "hidden" }}>
              {sortedOLevelSubjects.map((subj, idx) => {
                const selectedGrade = gradeMap[subj.id.toString()];
                const isCore = CORE_SUBJECTS.includes(subj.name.toLowerCase());
                const grades = EXAM_GRADES[examBody];

                return (
                  <React.Fragment key={subj.id}>
                    {idx === coreCount && coreCount > 0 && (
                      <Divider sx={{ bgcolor: "#e0eef7" }}>
                        <Typography variant="caption" sx={{ color: "#888", px: 1 }}>
                          Other Subjects
                        </Typography>
                      </Divider>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        bgcolor: selectedGrade
                          ? "rgba(62, 57, 123, 0.05)"
                          : idx % 2 === 0
                          ? "#fff"
                          : "#fafbff",
                        borderBottom: "1px solid #f0f4ff",
                        transition: "background 0.15s",
                        "&:hover": { bgcolor: "rgba(91,163,245,0.07)" },
                      }}
                    >
                      {/* Subject name */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          minWidth: { xs: "100%", sm: 230 },
                          flex: { sm: "0 0 230px" },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: selectedGrade ? 600 : 400, color: "#1a3a52" }}
                        >
                          {subj.name}
                        </Typography>
                        {isCore && (
                          <Chip
                            label="Core"
                            size="small"
                            sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#3e397b", color: "#fff" }}
                          />
                        )}
                        {selectedGrade && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: "#4caf50", ml: "auto" }} />
                        )}
                      </Box>

                      {/* Grade chips */}
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {grades.map((grade) => {
                          const isSelected = selectedGrade === grade;
                          const color = getGradeColor(grade);
                          return (
                            <Chip
                              key={grade}
                              label={grade}
                              size="small"
                              onClick={() => handleGradeSelect(subj.id.toString(), grade)}
                              sx={{
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                height: 26,
                                bgcolor: isSelected ? color : "transparent",
                                color: isSelected ? "#fff" : "#555",
                                border: `1.5px solid ${isSelected ? color : "#ddd"}`,
                                "&:hover": {
                                  bgcolor: isSelected ? color : "rgba(0,0,0,0.07)",
                                  borderColor: color,
                                },
                                transition: "all 0.12s",
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          )}

          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: Object.keys(gradeMap).length >= 8 ? "#2e7d32" : "#666",
              }}
            >
              {Object.keys(gradeMap).length} subject{Object.keys(gradeMap).length !== 1 ? "s" : ""} graded
            </Typography>
          </Box>
        </Paper>
      )}

      {/* ==================== A-LEVEL SECTION ==================== */}
      {formData.hasALevel && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <SchoolIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
              A-Level Details
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth label="Year of Sitting" name="aLevelYear" type="number" value={formData.aLevelYear} onChange={handleInputChange} error={!!formErrors.aLevelYear} helperText={formErrors.aLevelYear} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Index/Center Number" name="aLevelIndexNumber" value={formData.aLevelIndexNumber} onChange={handleInputChange} error={!!formErrors.aLevelIndexNumber} helperText={formErrors.aLevelIndexNumber} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="School Name" name="aLevelSchool" value={formData.aLevelSchool} onChange={handleInputChange} error={!!formErrors.aLevelSchool} helperText={formErrors.aLevelSchool} />
            </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 2 }}>
              <TextField 
                fullWidth 
                label="Combination" 
                name="alevel_combination" 
                placeholder="e.g PCM" 
                value={formData.alevel_combination} 
                onChange={handleInputChange} 
                error={!!formErrors.alevel_combination} 
                helperText={formErrors.alevel_combination}
                inputProps={{ maxLength: 10 }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'right', 
                  mt: 0.5,
                  color: formData.alevel_combination.length >= 10 ? 'error.main' : 'text.secondary' 
                }}
              >
                {formData.alevel_combination.length}/10 characters
              </Typography>
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 12, md: 2 }}>
              <TextField fullWidth label="Combination" name="alevel_combination" placeholder="e.g PCM" value={formData.alevel_combination} onChange={handleInputChange} error={!!formErrors.alevel_combination} helperText={formErrors.alevel_combination} />
            </Grid> */}
          </Grid>

          {/* Exam type selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#1a3a52" }}>
              Exam Type
            </Typography>
            <ToggleButtonGroup
              value={aLevelExamBody}
              exclusive
              onChange={(_, val) => val && setALevelExamBody(val)}
              size="small"
            >
              <ToggleButton value="UACE" sx={{ textTransform: "none", fontWeight: 600 }}>
                UACE / UNEB
              </ToggleButton>
              <ToggleButton value="Numeric" sx={{ textTransform: "none", fontWeight: 600 }}>
                Numeric (1–9)
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Alert severity="info" sx={{ mb: 2, fontSize: "0.82rem" }}>
            Click a grade next to each subject you sat for. Click the selected grade again to clear it.
          </Alert>

          {formErrors.aLevelSubjects && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.aLevelSubjects}</Alert>}

          {/* Subject grid */}
          {alevelSubjectList.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#3e397b" }} />
            </Box>
          ) : (
            <Box sx={{ border: "1px solid #e0eef7", borderRadius: 1, overflow: "hidden" }}>
              {sortedALevelSubjects.map((subj, idx) => {
                const selectedGrade = aGradeMap[subj.id.toString()];
                const grades = requiresNumericOnlyGrade(subj.name)
                  ? ALEVEL_EXAM_GRADES.Numeric
                  : ALEVEL_EXAM_GRADES[aLevelExamBody];
                return (
                  <Box
                    key={subj.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      bgcolor: selectedGrade
                        ? "rgba(62, 57, 123, 0.05)"
                        : idx % 2 === 0
                        ? "#fff"
                        : "#fafbff",
                      borderBottom: "1px solid #f0f4ff",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "rgba(91,163,245,0.07)" },
                    }}
                  >
                    {/* Subject name */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        minWidth: { xs: "100%", sm: 230 },
                        flex: { sm: "0 0 230px" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: selectedGrade ? 600 : 400, color: "#1a3a52" }}
                      >
                        {subj.name}
                      </Typography>
                      {selectedGrade && (
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#4caf50", ml: "auto" }} />
                      )}
                    </Box>

                    {/* Grade chips */}
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {grades.map((grade) => {
                        const isSelected = selectedGrade === grade;
                        const color = getGradeColor(grade);
                        return (
                          <Chip
                            key={grade}
                            label={grade}
                            size="small"
                            onClick={() => handleAGradeSelect(subj.id.toString(), grade)}
                            sx={{
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: 26,
                              bgcolor: isSelected ? color : "transparent",
                              color: isSelected ? "#fff" : "#555",
                              border: `1.5px solid ${isSelected ? color : "#ddd"}`,
                              "&:hover": {
                                bgcolor: isSelected ? color : "rgba(0,0,0,0.07)",
                                borderColor: color,
                              },
                              transition: "all 0.12s",
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: Object.keys(aGradeMap).length > 0 ? "#2e7d32" : "#666" }}
            >
              {Object.keys(aGradeMap).length} subject{Object.keys(aGradeMap).length !== 1 ? "s" : ""} graded
            </Typography>
          </Box>
        </Paper>
      )}

      {/* ==================== ADDITIONAL QUALIFICATIONS ==================== */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
        {formErrors.additionalQualifications && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formErrors.additionalQualifications}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
        {/* Header Section - Responsive Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: { xs: 2, sm: 0 },
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1a3a52",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          Additional Qualifications
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={addAdditionalQualification}
          variant="outlined"
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            whiteSpace: "nowrap",
            minWidth: { xs: "100%", sm: "auto" },
            "&:hover": {
              backgroundColor: "#3e397b",
              color: "white",
              borderColor: "#3e397b",
            },
          }}
        >
          Add Qualification
        </Button>
      </Box>
      </Box>

        {formData.additionalQualifications.map((qual: AdditionalQualification, index: number) => (
          <Paper key={index} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Institution Name" value={qual.institution} onChange={(e) => handleAdditionalQualChange(index, 'institution', e.target.value)} size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={qual.type} onChange={(e) => handleAdditionalQualChange(index, 'type', e.target.value as string)} label="Type">
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="diploma">Diploma</MenuItem>
                    <MenuItem value="certificate">Certificate</MenuItem>
                    <MenuItem value="degree">Degree</MenuItem>
                    <MenuItem value="masters">Masters</MenuItem>
                    <MenuItem value="phd">PhD</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Year" type="number" value={qual.year} onChange={(e) => handleAdditionalQualChange(index, 'year', e.target.value)} size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Class" value={qual.class_of_award} onChange={(e) => handleAdditionalQualChange(index, 'class_of_award', e.target.value)} size="small" />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <IconButton color="error" onClick={() => removeAdditionalQualification(index)}><DeleteIcon /></IconButton>
            </Box>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
};

export default AcademicResults;