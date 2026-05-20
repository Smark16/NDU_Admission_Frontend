"use client";

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
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Autocomplete,
  TextField,
} from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import { CheckCircleIcon } from "lucide-react";
import { Grid } from "@mui/system";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";
import useAxios from "../../AxiosInstance/UseAxios";

interface EducationalBackgroundSectionProps {
  alevelresults: any[];
  olevelresults: any[];
  additionalQualifications?: any[];
  application: any;
  onUpdate?: () => void;
}

const GRADE_OPTIONS = ["A", "B", "C", "D", "E", "F", "O", "D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const QUALIFICATION_TYPES = [
  "Diploma",
  "Certificate",
  "Degree",
  "Masters",
  "PhD",
  "Other"
];

export default function EducationalBackgroundSection({
  alevelresults: initialAlevel,
  olevelresults: initialOlevel,
  additionalQualifications: initialAdditional = [],
  application,
  onUpdate,
}: EducationalBackgroundSectionProps) {
  const AxiosInstance = useAxios()
  const [olevelresults, setOlevelResults] = useState<any[]>([]);
  const [alevelresults, setAlevelResults] = useState<any[]>([]);
  const [additionalQuals, setAdditionalQuals] = useState<any[]>([]);

  const [openOlevelModal, setOpenOlevelModal] = useState(false);
  const [openAlevelModal, setOpenAlevelModal] = useState(false);
  const [openAdditionalModal, setOpenAdditionalModal] = useState(false);

  const [currentOlevel, setCurrentOlevel] = useState<any[]>([]);
  const [currentAlevel, setCurrentAlevel] = useState<any[]>([]);
  const [currentAdditional, setCurrentAdditional] = useState<any[]>([]);

  const [olevelSubjects, setOlevelSubjects] = useState<any[]>([]);
  const [alevelSubjects, setAlevelSubjects] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [savingLevel, setSavingLevel] = useState<string>("");

  // Sync props
  useEffect(() => setOlevelResults(initialOlevel || []), [initialOlevel]);
  useEffect(() => setAlevelResults(initialAlevel || []), [initialAlevel]);
  useEffect(() => setAdditionalQuals(initialAdditional || []), [initialAdditional]);

  // Fetch subjects
  // useEffect(() => {
  //   const fetchSubjects = async () => {
  //     try {
  //       const [oRes, aRes] = await Promise.all([
  //         fetch("/api/admissions/list_olevel_subject"),
  //         fetch("/api/admissions/list_alevel_subject"),
  //       ]);
  //       if (oRes.ok) setOlevelSubjects(await oRes.json());
  //       if (aRes.ok) setAlevelSubjects(await aRes.json());
  //     } catch (err) {
  //       console.error("Failed to load subjects", err);
  //     }
  //   };
  //   fetchSubjects();
  // }, []);
  // Fetch subjects - FIXED & IMPROVED
useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const [oRes, aRes] = await Promise.all([
        AxiosInstance.get("/api/admissions/list_olevel_subject"),
        AxiosInstance.get("/api/admissions/list_alevel_subject"),
      ]);

      // Safely set the data
      setOlevelSubjects(Array.isArray(oRes.data) ? oRes.data : []);
      setAlevelSubjects(Array.isArray(aRes.data) ? aRes.data : []);

    } catch (err: any) {
      console.error("Failed to load subjects", err);

      // Optional: Log more details in production to debug
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received - possible network/CORS issue");
      }
    }
  };

  fetchSubjects();
}, [AxiosInstance]);  

  // Open Modals
  const handleOpenOlevel = () => {
    setCurrentOlevel([...olevelresults]);
    setOpenOlevelModal(true);
  };

  const handleOpenAlevel = () => {
    setCurrentAlevel([...alevelresults]);
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

  // Check for duplicate subjects
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

  // const handleSave = async (type: "olevel" | "alevel" | "additional") => {
  //   setIsSaving(true);
  //   setSavingLevel(type);

  //   let endpoint = "";
  //   let payloadKey = "";
  //   let payloadData: any = [];

  //   if (type === "olevel") {
  //     endpoint = `/api/admissions/update_olevel_results/${application?.id}/`;
  //     payloadKey = "results";
  //     payloadData = currentOlevel
  //       .filter(item => item.subject?.id && item.grade)
  //       .map(item => ({ subject_id: item.subject.id, grade: item.grade }));
  //   } else if (type === "alevel") {
  //     endpoint = `/api/admissions/update_alevel_results/${application?.id}/`;
  //     payloadKey = "results";
  //     payloadData = currentAlevel
  //       .filter(item => item.subject?.id && item.grade)
  //       .map(item => ({ subject_id: item.subject.id, grade: item.grade }));
  //   } else {
  //     endpoint = `/api/admissions/update_additional_qualifications/${application?.id}/`;
  //     payloadKey = "qualifications";
  //     payloadData = currentAdditional.filter(q => 
  //       q.additional_qualification_institution?.trim() && 
  //       q.additional_qualification_type?.trim()
  //     );
  //   }

  //   try {
  //     const res = await AxiosInstance.post(endpoint, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ [payloadKey]: payloadData }),
  //     });

  //     if (res.ok) {
  //       if (type === "olevel") setOlevelResults(currentOlevel);
  //       else if (type === "alevel") setAlevelResults(currentAlevel);
  //       else setAdditionalQuals(currentAdditional);

  //       setOpenOlevelModal(false);
  //       setOpenAlevelModal(false);
  //       setOpenAdditionalModal(false);
  //       onUpdate?.();
  //     } else {
  //       const error = await res.json().catch(() => ({}));
  //       alert(error.detail || "Failed to update");
  //     }
  //   } catch (err) {
  //     alert("Network error. Please try again.");
  //   } finally {
  //     setIsSaving(false);
  //     setSavingLevel("");
  //   }
  // };
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
    const res = await AxiosInstance.post(endpoint, {
      [payloadKey]: payloadData
    });

    // Success
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
  }
};

  const renderLevelContainer = (
    levelName: string,
    results: any[],
    school: string,
    year: any,
    examType: string,
    onClick: () => void
  ) => (
    <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", "&:hover": { backgroundColor: "action.hover" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "1rem" }}>
            {levelName}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {school || "Not specified"} • {year || "Not specified"}
          </Typography>
        </Box>
        <Chip label={examType} size="small" variant="outlined" />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableBody>
            {results.length > 0 ? (
              results.map((r, i) => (
                <TableRow key={i} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {r.subject?.name || "Unknown Subject"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    {r.grade && <Chip label={r.grade} size="small" color="primary" />}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2" sx={{ color: "text.secondary", py: 3 }}>
                    No results added yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {application?.status?.toLowerCase() !== 'admitted' && (
        <>
          {/* O-Level Update Button */}
          {levelName === 'O Level' && (
            application?.has_olevel ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SwapHorizIcon />}
                sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060", mt: 3 }}
                onClick={onClick}
              >
                Update {levelName} results
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                Enable "Has O-Level" in Personal Information to update results
              </Typography>
            )
          )}

          {/* A-Level Update Button */}
          {levelName === 'A Level' && (
            application?.has_alevel ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SwapHorizIcon />}
                sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060", mt: 3 }}
                onClick={onClick}
              >
                Update {levelName} results
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                Enable "Has A-Level" in Personal Information to update results
              </Typography>
            )
          )}
        </>
      )}
    </Paper>
  );

  const renderAdditionalQualifications = () => (
    <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon color="#5ba3f5" fontSize={20} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
            Additional Qualifications
          </Typography>
        </Box>

        {application?.status?.toLowerCase() !== 'admitted' && (
        <Button variant="outlined" size="small" startIcon={<SwapHorizIcon />} onClick={handleOpenAdditional}>
          Update
        </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {additionalQuals.length > 0 ? (
          additionalQuals.map((qual: any, index: number) => (
            <Paper key={index} elevation={1} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e7f0", "&:hover": { borderColor: "#5ba3f5" } }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.5 }}>
                INSTITUTION
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a3a52", mb: 2.5 }}>
                {qual.additional_qualification_institution || "Unnamed Institution"}
              </Typography>

              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>QUALIFICATION TYPE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
                    {qual.additional_qualification_type || "Not specified"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>AWARD YEAR</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{qual.additional_qualification_year || "Not specified"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>CLASS OF AWARD</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{qual.class_of_award || "Not specified"}</Typography>
                </Grid>
              </Grid>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
            No additional qualifications added yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );

  const olevelDuplicates = getDuplicateIndices(currentOlevel);
  const alevelDuplicates = getDuplicateIndices(currentAlevel);

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<BookIcon sx={{ color: "primary.main" }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Educational Background</Typography>}
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {renderLevelContainer("O Level", olevelresults, application?.olevel_school, application?.olevel_year, "UCE", handleOpenOlevel)}
          {renderLevelContainer("A Level", alevelresults, application?.alevel_school, application?.alevel_year, "UACE", handleOpenAlevel)}

          <Divider sx={{ my: 1 }} />
          {renderAdditionalQualifications()}
        </Box>
      </CardContent>

      {/* O-Level Modal */}
      <Dialog open={openOlevelModal} onClose={() => setOpenOlevelModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update O Level Results</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {currentOlevel.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: "flex", 
                gap: 2, 
                mb: 2, 
                alignItems: "center",
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
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Grade</InputLabel>
                <Select value={item.grade || ""} label="Grade" onChange={e => updateField(index, "grade", e.target.value, "olevel")}>
                  {GRADE_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
              <IconButton color="error" onClick={() => removeItem(index, "olevel")}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={() => addSubject("olevel")} variant="outlined">Add Subject</Button>
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

      {/* A-Level Modal */}
      <Dialog open={openAlevelModal} onClose={() => setOpenAlevelModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update A Level Results</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {currentAlevel.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: "flex", 
                gap: 2, 
                mb: 2, 
                alignItems: "center",
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
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Grade</InputLabel>
                <Select value={item.grade || ""} label="Grade" onChange={e => updateField(index, "grade", e.target.value, "alevel")}>
                  {GRADE_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
              <IconButton color="error" onClick={() => removeItem(index, "alevel")}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={() => addSubject("alevel")} variant="outlined">Add Subject</Button>
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

      {/* Additional Qualifications Modal */}
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
  );
}