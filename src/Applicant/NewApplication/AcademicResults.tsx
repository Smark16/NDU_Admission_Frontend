import React, { useEffect, useState } from 'react';
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
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  School as SchoolIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
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
  addALevelSubject: () => void;
  addOLevelSubject: () => void;
  removeOLevelSubject: (id: string) => void;
  handleALevelSubjectChange: (id: string, field: string, value: string) => void;
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
  addALevelSubject,
  handleInputChange,
  removeOLevelSubject,
  handleALevelSubjectChange,
  removeALevelSubject,
  setFormData,
}) => {
  const AxiosInstance = useAxios();

  const oLevelGrades = ["D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9", "A", "B", "C", "D", "E", "O"];
  const aLevelGrades = ["A", "B", "C", "D", "E", "O", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

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

  // Additional Qualification Handlers
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
      {/* O-Level Section */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <BookIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
            O-Level Details
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Year of Sitting"
              name="oLevelYear"
              type="number"
              value={formData.oLevelYear}
              onChange={handleInputChange}
              required
              variant="outlined"
              inputProps={{ min: 1990, max: new Date().getFullYear() }}
              error={!!formErrors.oLevelYear}
              helperText={formErrors.oLevelYear}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Index/Center Number"
              name="oLevelIndexNumber"
              value={formData.oLevelIndexNumber}
              onChange={handleInputChange}
              required
              variant="outlined"
              error={!!formErrors.oLevelIndexNumber}
              helperText={formErrors.oLevelIndexNumber}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="School Name"
              name="oLevelSchool"
              value={formData.oLevelSchool}
              onChange={handleInputChange}
              required
              variant="outlined"
              error={!!formErrors.oLevelSchool}
              helperText={formErrors.oLevelSchool}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
          Subject Results (Minimum 6, Maximum 10)
        </Typography>

        {/* O-Level Table - Responsive */}
        <TableContainer sx={{ mb: 2, overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.oLevelSubjects.map((subject: SubjectResult) => (
                <TableRow key={subject.id} sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}>
                  <TableCell>
                    <FormControl fullWidth size="small" error={!!formErrors.oLevelSubjects}>
                      <Select
                        value={subject.subject}
                        onChange={(e) => handleOLevelSubjectChange(subject.id, "subject", e.target.value)}
                      >
                        <MenuItem value="">Select Subject</MenuItem>
                        {olevelSubjectList.map((subj) => (
                          <MenuItem key={subj.id} value={subj.id.toString()}>
                            {subj.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small" error={!!formErrors.oLevelSubjects}>
                      <Select
                        value={subject.grade}
                        onChange={(e) => handleOLevelSubjectChange(subject.id, "grade", e.target.value)}
                      >
                        <MenuItem value="">Select Grade</MenuItem>
                        {oLevelGrades.map((grade) => (
                          <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => removeOLevelSubject(subject.id)}
                      disabled={formData.oLevelSubjects.length <= 1}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={addOLevelSubject}
            disabled={formData.oLevelSubjects.length >= 10}
            variant="outlined"
            size="small"
            sx={{ color: "#5ba3f5", borderColor: "#5ba3f5" }}
          >
            Add Subject
          </Button>
          <Typography variant="caption" sx={{ color: "#666" }}>
            {formData.oLevelSubjects.length}/10 subjects
          </Typography>
        </Box>
      </Paper>

      {/* A-Level Section */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <SchoolIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
            A-Level Details
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              label="Year of Sitting"
              name="aLevelYear"
              type="number"
              value={formData.aLevelYear}
              onChange={handleInputChange}
              variant="outlined"
              inputProps={{ min: 1990, max: new Date().getFullYear() }}
              error={!!formErrors.aLevelYear}
              helperText={formErrors.aLevelYear}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Index/Center Number"
              name="aLevelIndexNumber"
              value={formData.aLevelIndexNumber}
              onChange={handleInputChange}
              variant="outlined"
              error={!!formErrors.aLevelIndexNumber}
              helperText={formErrors.aLevelIndexNumber}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="School Name"
              name="aLevelSchool"
              value={formData.aLevelSchool}
              onChange={handleInputChange}
              variant="outlined"
              error={!!formErrors.aLevelSchool}
              helperText={formErrors.aLevelSchool}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <TextField
              fullWidth
              label="A-Level Combination"
              name="alevel_combination"
              placeholder="e.g PCM, HEG"
              value={formData.alevel_combination}
              onChange={handleInputChange}
              variant="outlined"
              error={!!formErrors.alevel_combination}
              helperText={formErrors.alevel_combination}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
          Subject Results (Minimum 2, Maximum 5)
        </Typography>

        <TableContainer sx={{ mb: 2, overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.aLevelSubjects.map((subject: SubjectResult) => (
                <TableRow key={subject.id} sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}>
                  <TableCell>
                    <FormControl fullWidth size="small" error={!!formErrors.aLevelSubjects}>
                      <Select
                        value={subject.subject}
                        onChange={(e) => handleALevelSubjectChange(subject.id, "subject", e.target.value)}
                      >
                        <MenuItem value="">Select Subject</MenuItem>
                        {alevelSubjectList.map((subj) => (
                          <MenuItem key={subj.id} value={subj.id.toString()}>
                            {subj.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small" error={!!formErrors.aLevelSubjects}>
                      <Select
                        value={subject.grade}
                        onChange={(e) => handleALevelSubjectChange(subject.id, "grade", e.target.value)}
                      >
                        <MenuItem value="">Select Grade</MenuItem>
                        {aLevelGrades.map((grade) => (
                          <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => removeALevelSubject(subject.id)}
                      disabled={formData.aLevelSubjects.length <= 1}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={addALevelSubject}
            disabled={formData.aLevelSubjects.length >= 5}
            variant="outlined"
            size="small"
            sx={{ color: "#5ba3f5", borderColor: "#5ba3f5" }}
          >
            Add Subject
          </Button>
          <Typography variant="caption" sx={{ color: "#666" }}>
            {formData.aLevelSubjects.length}/5 subjects
          </Typography>
        </Box>
      </Paper>

      {/* ==================== ADDITIONAL QUALIFICATIONS SECTION - FIXED RESPONSIVE ==================== */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
              Additional Qualifications
            </Typography>
          </Box>

          {/* Responsive Add Button */}
          <Button
            startIcon={<AddIcon />}
            onClick={addAdditionalQualification}
            variant="outlined"
            size="small"
            sx={{ 
              color: "#5ba3f5", 
              borderColor: "#5ba3f5",
              minWidth: { xs: 'auto', sm: 160 },
              px: { xs: 2, sm: 3 }
            }}
          >
            {window.innerWidth < 600 ? "Add" : "Add Qualification"}
          </Button>
        </Box>

        {formData.additionalQualifications.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No additional qualifications added yet.
          </Typography>
        )}

        {formData.additionalQualifications.map((qual: AdditionalQualification, index: number) => (
          <Paper 
            key={index} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: 3, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2 
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Institution Name"
                  value={qual.institution}
                  onChange={(e) => handleAdditionalQualChange(index, 'institution', e.target.value)}
                  placeholder="e.g., Makerere University"
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Qualification Type</InputLabel>
                  <Select
                    value={qual.type}
                    onChange={(e) => handleAdditionalQualChange(index, 'type', e.target.value as string)}
                    label="Qualification Type"
                  >
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
                <TextField
                  fullWidth
                  label="Award Year"
                  type="number"
                  value={qual.year}
                  onChange={(e) => handleAdditionalQualChange(index, 'year', e.target.value)}
                  inputProps={{ min: 1990, max: new Date().getFullYear() }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Class of Award"
                  value={qual.class_of_award}
                  onChange={(e) => handleAdditionalQualChange(index, 'class_of_award', e.target.value)}
                  placeholder="e.g. First Class, Second Class"
                  size="small"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <IconButton
                color="error"
                onClick={() => removeAdditionalQualification(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
};

export default AcademicResults;