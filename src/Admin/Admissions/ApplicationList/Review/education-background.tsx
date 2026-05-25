"use client"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  IconButton,
  Select,
  MenuItem,
  DialogActions,
} from "@mui/material"
import BookIcon from "@mui/icons-material/Book"
import { Grid } from "@mui/system"
import { CheckCircleIcon } from "lucide-react"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import useAxios from "../../../../AxiosInstance/UseAxios";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface EducationalBackgroundSectionProps {
  alevelresults: any[]
  olevelresults: any[]
  application: any,
  additionalQualifications: any[]
  onUpdate?: () => void;
}

export default function EducationalBackgroundSection({
  alevelresults: initialAlevel,
  olevelresults: initialOlevel,
  additionalQualifications: initialAdditional = [],
  application,
  onUpdate
}: EducationalBackgroundSectionProps) {
  const AxiosInstance = useAxios();
  const [openOlevelModal, setOpenOlevelModal] = useState(false);
  const [openAlevelModal, setOpenAlevelModal] = useState(false);
  const [openAdditionalModal, setOpenAdditionalModal] = useState(false);

  const [currentOlevel, setCurrentOlevel] = useState<any[]>([]);
  const [currentAlevel, setCurrentAlevel] = useState<any[]>([]);
  const [currentAdditional, setCurrentAdditional] = useState<any[]>([]);

  const [olevelSubjects, setOlevelSubjects] = useState<any[]>([]);
  const [alevelSubjects, setAlevelSubjects] = useState<any[]>([]);


  const [olevelResults, setOlevelResults] = useState<any[]>([]);
  const [alevelResults, setAlevelResults] = useState<any[]>([]);
  const [additionalQuals, setAdditionalQuals] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [savingLevel, setSavingLevel] = useState<string>("");

  const GRADE_OPTIONS = ["A", "B", "C", "D", "E", "F", "O", "D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const QUALIFICATION_TYPES = [
  "Diploma",
  "Certificate",
  "Degree",
  "Masters",
  "PhD",
  "Other"
];

  // Sync props
  useEffect(() => setOlevelResults(initialOlevel || []), [initialOlevel]);
  useEffect(() => setAlevelResults(initialAlevel || []), [initialAlevel]);
  useEffect(() => setAdditionalQuals(initialAdditional || []), [initialAdditional]);

  const getGradeColor = (grade: string): "success" | "primary" | "warning" | "error" | "default" => {
    const letterMap: Record<string, "success" | "primary" | "warning" | "error"> = {
      A: "success",
      B: "primary",
      C: "warning",
      D: "error",
      E: "error",
      O: "warning",
      F: "error",
    }
    if (letterMap[grade]) return letterMap[grade]
    // Numeric grades: 1–3 distinction (green), 4–6 pass (blue), 7–9 fail (red)
    const n = parseInt(grade, 10)
    if (!isNaN(n)) {
      if (n <= 3) return "success"
      if (n <= 6) return "primary"
      return "error"
    }
    return "default"
  }

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const [oRes, aRes] = await Promise.all([
          AxiosInstance.get("/api/admissions/list_olevel_subject"),
          AxiosInstance.get("/api/admissions/list_alevel_subject"),
        ]);

        setOlevelSubjects(Array.isArray(oRes.data) ? oRes.data : []);
        setAlevelSubjects(Array.isArray(aRes.data) ? aRes.data : []);
      } catch (err: any) {
        console.error("Failed to load subjects", err);
        if (err.response) {
          console.error("Response status:", err.response.status);
        }
      }
    };

    fetchSubjects();
  }, [AxiosInstance]);
  

  // Open Modals
  const handleOpenOlevel = () => {
    setCurrentOlevel([...olevelResults]);
    setOpenOlevelModal(true);
  };

  const handleOpenAlevel = () => {
    setCurrentAlevel([...alevelResults]);
    setOpenAlevelModal(true);
  };

  const handleOpenAdditional = () => {
    setCurrentAdditional([...additionalQuals]);
    setOpenAdditionalModal(true);
  };

  const addSubject = (level: "olevel" | "alevel") => {
    const newSub = { subject: { id: null, name: "" }, grade: "" };
    if (level === "olevel") setCurrentOlevel(prev => [...prev, newSub]);
    else setCurrentAlevel(prev => [...prev, newSub]);
  };

  const addQualification = () => {
    setCurrentAdditional(prev => [...prev, {
      additional_qualification_institution: "",
      additional_qualification_type: "",
      additional_qualification_year: "",
      class_of_award: ""
    }]);
  };

  const updateField = (index: number, field: string, value: any, type: "olevel" | "alevel" | "additional") => {
    if (type === "additional") {
      setCurrentAdditional(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    } else {
      const setter = type === "olevel" ? setCurrentOlevel : setCurrentAlevel;
      setter(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    }
  };

  const removeItem = (index: number, type: "olevel" | "alevel" | "additional") => {
    if (type === "additional") {
      setCurrentAdditional(prev => prev.filter((_, i) => i !== index));
    } else {
      const setter = type === "olevel" ? setCurrentOlevel : setCurrentAlevel;
      setter(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getDuplicateIndices = (items: any[]) => {
    const subjectIds = new Map();
    const duplicates = new Set<number>();

    items.forEach((item, index) => {
      const subId = item.subject?.id;
      if (subId) {
        if (subjectIds.has(subId)) {
          duplicates.add(subjectIds.get(subId));
          duplicates.add(index);
        } else {
          subjectIds.set(subId, index);
        }
      }
    });
    return duplicates;
  };

  const handleSave = async (type: "olevel" | "alevel" | "additional") => {
    setIsSaving(true);
    setSavingLevel(type);

    let endpoint = "";
    let payloadKey = "";
    let payloadData: any = [];

    if (type === "olevel") {
      endpoint = `/api/admissions/update_olevel_results/${application?.id}/`;
      payloadKey = "results";
      payloadData = currentOlevel
        .filter(item => item.subject?.id && item.grade)
        .map(item => ({ subject_id: item.subject.id, grade: item.grade }));
    } else if (type === "alevel") {
      endpoint = `/api/admissions/update_alevel_results/${application?.id}/`;
      payloadKey = "results";
      payloadData = currentAlevel
        .filter(item => item.subject?.id && item.grade)
        .map(item => ({ subject_id: item.subject.id, grade: item.grade }));
    } else {
      endpoint = `/api/admissions/update_additional_qualifications/${application?.id}/`;
      payloadKey = "qualifications";
      payloadData = currentAdditional.filter(q =>
        q.additional_qualification_institution?.trim() &&
        q.additional_qualification_type?.trim()
      );
    }

    try {
      await AxiosInstance.post(endpoint, {
        [payloadKey]: payloadData
      });

      if (type === "olevel") setOlevelResults(currentOlevel);
      else if (type === "alevel") setAlevelResults(currentAlevel);
      else setAdditionalQuals(currentAdditional);

      setOpenOlevelModal(false);
      setOpenAlevelModal(false);
      setOpenAdditionalModal(false);
      onUpdate?.();

    } catch (err: any) {
      console.error("Save error:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSaving(false);
      setSavingLevel("");
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const renderLevelContainer = (level: string, results: any[], school: string, year: string, examType: string, onClick: () => void) => {
    if (!results || results.length === 0) return null

    return (
      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { backgroundColor: "action.hover" },
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              {level}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
              {school} • {year}
            </Typography>
          </Box>
          <Chip label={examType} size="small" variant="outlined" />
        </Box>

        {/* Subjects Table */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
            Subjects & Grades
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {results.map((result: any, index: number) => (
                  <TableRow key={result.id || index} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                    <TableCell sx={{ py: 1.5, px: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {result.subject.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, px: 1 }}>
                      {result.grade && (
                        <Chip label={result.grade} size="small" color={getGradeColor(result.grade)} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<SwapHorizIcon />}
          sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060", mt: 1 }}
          onClick={onClick}
        >
          Update {level} results
        </Button>
      </Paper>
    )
  }

  // aditional qualifications
  const renderAdditionalQualifications = () => {
    if (!additionalQuals || additionalQuals.length === 0) {
      return (
        <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
            No additional qualifications added yet.
          </Typography>

          <Button variant="outlined" size="small" startIcon={<SwapHorizIcon />} onClick={handleOpenAdditional}>
            Update
          </Button>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <CheckCircleIcon color="#5ba3f5" fontSize={20} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
            Additional Qualifications
          </Typography>

          <Button variant="outlined" size="small" startIcon={<SwapHorizIcon />} onClick={handleOpenAdditional}>
            Update
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {additionalQuals.map((qual: any, index: number) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e7f0",
                backgroundColor: "#ffffff",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
                  borderColor: "#5ba3f5",
                },
              }}
            >
              {/* Institution Name - Prominent */}
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                INSTITUTION
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#1a3a52",
                  mb: 2.5,
                  fontSize: "1.08rem"
                }}
              >
                {qual.additional_qualification_institution || "Unnamed Institution"}
              </Typography>

              <Divider sx={{ mb: 2.5 }} />

              {/* Details Grid - Clear Labels */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                    QUALIFICATION TYPE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
                    {qual.additional_qualification_type || "Not specified"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                    AWARD YEAR
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {qual.additional_qualification_year || "Not specified"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                    CLASS OF AWARD
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {qual.class_of_award || "Not specified"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      </Paper>
    );
  };

  const olevelDuplicates = getDuplicateIndices(currentOlevel);
  const alevelDuplicates = getDuplicateIndices(currentAlevel);

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<BookIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Educational Background
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {olevelResults && olevelResults.length > 0 ? (
            renderLevelContainer(
              "O Level",
              olevelResults,
              application?.olevel_school || "Not specified",
              application?.olevel_year || "Not specified",
              "UCE",
              handleOpenOlevel,
            )
          ) : (
            <>
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                No O Level results where Added by this student
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SwapHorizIcon />}
                sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060", mt: 1 }}
                onClick={handleOpenOlevel}
              >
                Update Olevel results
              </Button>
            </>
          )}

          {alevelResults && alevelResults.length > 0 ? (
            renderLevelContainer(
              "A Level",
              alevelResults,
              application?.alevel_school || "Not specified",
              application?.alevel_year || "Not specified",
              "UACE",
              handleOpenAlevel
            )
          ) : (
            <>
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                No A Level results where Added by this student
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SwapHorizIcon />}
                sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060", mt: 1 }}
                onClick={handleOpenAlevel}
              >
                Update Alevel results
              </Button>
            </>
          )}

          {/* additional qualifications */}
          <Divider sx={{ my: 1 }} />
          {renderAdditionalQualifications()}
        </Box>
      </CardContent>

      {/* ==================== O-LEVEL MODAL ==================== */}
      <Dialog open={openOlevelModal} onClose={() => setOpenOlevelModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update O Level Results</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {currentOlevel.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },   // ← Mobile Fix
                gap: 2,
                mb: 2,
                alignItems: { xs: "stretch", sm: "center" },
                p: 2,
                border: olevelDuplicates.has(index) ? "2px solid #d32f2f" : "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: olevelDuplicates.has(index) ? "#fff2f2" : "transparent"
              }}
            >
              <Autocomplete
                fullWidth
                options={olevelSubjects}
                getOptionLabel={(opt: any) => opt?.name || ""}
                value={olevelSubjects.find(s => s.id === item.subject?.id) || null}
                onChange={(_, newValue) => updateField(index, "subject", newValue, "olevel")}
                renderInput={(params) => <TextField {...params} label="Subject" />}
              />

              <FormControl sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={item.grade || ""}
                  label="Grade"
                  onChange={e => updateField(index, "grade", e.target.value, "olevel")}
                >
                  {GRADE_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>

              <IconButton color="error" onClick={() => removeItem(index, "olevel")} sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} onClick={() => addSubject("olevel")} variant="outlined">
            Add Subject
          </Button>

          {olevelDuplicates.size > 0 && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
              ⚠️ Duplicate subjects detected (highlighted in red)
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOlevelModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleSave("olevel")} disabled={isSaving || olevelDuplicates.size > 0}>
            {savingLevel === "olevel" && isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== A-LEVEL MODAL ==================== */}
      <Dialog open={openAlevelModal} onClose={() => setOpenAlevelModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update A Level Results</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {currentAlevel.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },   // ← Mobile Fix
                gap: 2,
                mb: 2,
                alignItems: { xs: "stretch", sm: "center" },
                p: 2,
                border: alevelDuplicates.has(index) ? "2px solid #d32f2f" : "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: alevelDuplicates.has(index) ? "#fff2f2" : "transparent"
              }}
            >
              <Autocomplete
                fullWidth
                options={alevelSubjects}
                getOptionLabel={(opt: any) => opt?.name || ""}
                value={alevelSubjects.find(s => s.id === item.subject?.id) || null}
                onChange={(_, newValue) => updateField(index, "subject", newValue, "alevel")}
                renderInput={(params) => <TextField {...params} label="Subject" />}
              />

              <FormControl sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={item.grade || ""}
                  label="Grade"
                  onChange={e => updateField(index, "grade", e.target.value, "alevel")}
                >
                  {GRADE_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>

              <IconButton color="error" onClick={() => removeItem(index, "alevel")} sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} onClick={() => addSubject("alevel")} variant="outlined">
            Add Subject
          </Button>

          {alevelDuplicates.size > 0 && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
              ⚠️ Duplicate subjects detected (highlighted in red)
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAlevelModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleSave("alevel")} disabled={isSaving || alevelDuplicates.size > 0}>
            {savingLevel === "alevel" && isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Additional Qualifications Modal - Unchanged */}
      <Dialog open={openAdditionalModal} onClose={() => setOpenAdditionalModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Additional Qualifications</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {currentAdditional.map((qual, index) => (
            <Paper key={index} sx={{ p: 3, mb: 3, border: "1px solid #e0e7f0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1">Qualification {index + 1}</Typography>
                <IconButton color="error" onClick={() => removeItem(index, "additional")}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Institution"
                    value={qual.additional_qualification_institution || ""}
                    onChange={(e) => updateField(index, "additional_qualification_institution", e.target.value, "additional")}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={qual.additional_qualification_type || ""}
                      label="Type"
                      onChange={(e) => updateField(index, "additional_qualification_type", e.target.value, "additional")}
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      {QUALIFICATION_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Award Year"
                    type="number"
                    value={qual.additional_qualification_year || ""}
                    onChange={(e) => updateField(index, "additional_qualification_year", e.target.value, "additional")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Class of Award"
                    value={qual.class_of_award || ""}
                    onChange={(e) => updateField(index, "class_of_award", e.target.value, "additional")}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Button startIcon={<AddIcon />} onClick={addQualification} variant="outlined" fullWidth>
            Add Another Qualification
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdditionalModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleSave("additional")} disabled={isSaving}>
            {savingLevel === "additional" && isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
