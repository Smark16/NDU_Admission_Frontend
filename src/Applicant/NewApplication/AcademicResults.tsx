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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Checkbox,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import {
  School as SchoolIcon,
  Book as BookIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
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
  handleOLevelSubjectChange,
  addOLevelSubject,
  removeOLevelSubject,
  handleALevelSubjectChange,
  addALevelSubject,
  removeALevelSubject,
  handleInputChange,
  setFormData,
}) => {
  const AxiosInstance = useAxios();

  const oLevelGrades = ["D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9", "A", "B", "C", "D", "E", "O", "F"];
  const aLevelGrades = ["A", "B", "C", "D", "E", "O", "F", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const [olevelSubjectList, setOlevelSubjectList] = useState<OLevelSubject[]>([]);
  const [alevelSubjectList, setAlevelSubjectList] = useState<ALevelSubject[]>([]);

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

  // Duplicate Detection Memoization
  const oLevelDuplicates = useMemo(() => {
    const subjectIds = formData.oLevelSubjects.map((s: SubjectResult) => s.subject).filter(Boolean);
    const countMap = new Map();
    subjectIds.forEach((id: any) => countMap.set(id, (countMap.get(id) || 0) + 1));
    return new Set([...countMap.entries()].filter(([_, count]) => count > 1).map(([id]) => id));
  }, [formData.oLevelSubjects]);

  const aLevelDuplicates = useMemo(() => {
    const subjectIds = formData.aLevelSubjects.map((s: SubjectResult) => s.subject).filter(Boolean);
    const countMap = new Map();
    subjectIds.forEach((id: any) => countMap.set(id, (countMap.get(id) || 0) + 1));
    return new Set([...countMap.entries()].filter(([_, count]) => count > 1).map(([id]) => id));
  }, [formData.aLevelSubjects]);

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

          {oLevelDuplicates.size > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Duplicate subjects detected in O-Level results. Please ensure each subject is unique.
            </Alert>
          )}

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

          {formErrors.oLevelSubjects && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.oLevelSubjects}</Alert>}

          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.oLevelSubjects.map((subject: SubjectResult) => {
                  const isDup = oLevelDuplicates.has(subject.subject);
                  return (
                    <TableRow key={subject.id} sx={{ bgcolor: isDup ? "#fff5f5" : "inherit" }}>
                      <TableCell>
                        <FormControl fullWidth size="small" error={isDup}>
                          <Select 
                            value={subject.subject} 
                            onChange={(e) => handleOLevelSubjectChange(subject.id, "subject", e.target.value)}
                          >
                            <MenuItem value="">Select Subject</MenuItem>
                            {olevelSubjectList.map((subj) => (
                              <MenuItem key={subj.id} value={subj.id.toString()}>{subj.name}</MenuItem>
                            ))}
                          </Select>
                          {isDup && <FormHelperText>Duplicate selection</FormHelperText>}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select value={subject.grade} onChange={(e) => handleOLevelSubjectChange(subject.id, "grade", e.target.value)}>
                            <MenuItem value="">Select Grade</MenuItem>
                            {oLevelGrades.map((grade) => <MenuItem key={grade} value={grade}>{grade}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => removeOLevelSubject(subject.id)} disabled={formData.oLevelSubjects.length <= 1} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button startIcon={<AddIcon />} onClick={addOLevelSubject} disabled={formData.oLevelSubjects.length >= 10} variant="outlined">
              Add Subject
            </Button>
            <Typography variant="caption">{formData.oLevelSubjects.length}/10 subjects</Typography>
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

          {aLevelDuplicates.size > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Duplicate subjects detected in A-Level results.
            </Alert>
          )}

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
              <TextField fullWidth label="Combination" name="alevel_combination" placeholder="e.g PCM" value={formData.alevel_combination} onChange={handleInputChange} error={!!formErrors.alevel_combination} helperText={formErrors.alevel_combination} />
            </Grid>
          </Grid>

          {formErrors.aLevelSubjects && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.aLevelSubjects}</Alert>}

          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.aLevelSubjects.map((subject: SubjectResult) => {
                  const isDup = aLevelDuplicates.has(subject.subject);
                  return (
                    <TableRow key={subject.id} sx={{ bgcolor: isDup ? "#fff5f5" : "inherit" }}>
                      <TableCell>
                        <FormControl fullWidth size="small" error={isDup}>
                          <Select 
                            value={subject.subject} 
                            onChange={(e) => handleALevelSubjectChange(subject.id, "subject", e.target.value)}
                          >
                            <MenuItem value="">Select Subject</MenuItem>
                            {alevelSubjectList.map((subj) => (
                              <MenuItem key={subj.id} value={subj.id.toString()}>{subj.name}</MenuItem>
                            ))}
                          </Select>
                          {isDup && <FormHelperText>Duplicate selection</FormHelperText>}
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select value={subject.grade} onChange={(e) => handleALevelSubjectChange(subject.id, "grade", e.target.value)}>
                            <MenuItem value="">Select Grade</MenuItem>
                            {aLevelGrades.map((grade) => <MenuItem key={grade} value={grade}>{grade}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => removeALevelSubject(subject.id)} disabled={formData.aLevelSubjects.length <= 1} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button startIcon={<AddIcon />} onClick={addALevelSubject} disabled={formData.aLevelSubjects.length >= 5} variant="outlined">
              Add Subject
            </Button>
            <Typography variant="caption">{formData.aLevelSubjects.length}/5 subjects</Typography>
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
            Additional Qualifications
          </Typography>
          <Button startIcon={<AddIcon />} onClick={addAdditionalQualification} variant="outlined" size="small">
            Add Qualification
          </Button>
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