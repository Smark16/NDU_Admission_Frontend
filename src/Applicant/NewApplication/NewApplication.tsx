"use client"

import type React from "react"
import { useContext, useEffect, useState } from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Alert,
  Typography,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
} from "@mui/material"
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Book as BookIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import PersonalInfo from "./personaInfo"
import Programs from "./Programs"
import AcademicResults from "./AcademicResults"
import Documents from "./Documents"

import { AuthContext } from "../../Context/AuthContext"
import type { SelectChangeEvent } from '@mui/material/Select';
import useAxios from "../../AxiosInstance/UseAxios"
import useHook from "../../Hooks/useHook"

const steps = [
  { label: "Personal Details", icon: PersonIcon },
  { label: "Programs", icon: SchoolIcon },
  { label: "Academic Results", icon: BookIcon },
  { label: "Documents", icon: CloudUploadIcon },
  { label: "Review", icon: CheckCircleIcon },
]

interface SubjectResult {
  id: string
  subject: string
  grade: string
}

interface Campus {
  id:number;
  name:string;
}

interface FormData {
  applicant: number | undefined;
  batch: number | undefined
  firstName: string
  lastName: string
  middleName: string
  dateOfBirth: string
  gender: string
  nationality: string
  phone: number
  email: string
  address: string
  nextOfKinName: string
  nextOfKinContact: string
  nextOfKinRelationship: string
  campus: string
  programs: number[]
  academic_level:string
  oLevelYear: string
  oLevelIndexNumber: string
  oLevelSchool: string
  oLevelSubjects: SubjectResult[]
  aLevelYear: string
  aLevelIndexNumber: string
  aLevelSchool: string
  aLevelSubjects: SubjectResult[]
  study_mode:string
  alevel_combination:string
  additionalQualificationInstitution: string
  additionalQualificationType: string
  additionalQualificationYear: string
  class_of_award: string
  passportPhoto: File | null
  oLevelDocuments: File | null
  aLevelDocuments: File | null
  otherInstitutionDocuments: File | null
  status:string
}

export default function NewApplicationForm() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()
  const [submitLoader, setSubmitLoader] = useState(false)
  const {batch} = useHook()
  const { loggeduser } = useContext(AuthContext) || {}
  const [activeStep, setActiveStep] = useState(0)
  const [campus, setCampus] = useState<Campus[]>([])
  const [formData, setFormData] = useState<FormData>({
    applicant: loggeduser?.user_id ? Number(loggeduser?.user_id) : undefined,
    batch: batch?.id ? Number(batch.id) : undefined,
    firstName: loggeduser?.first_name ?? '',
    lastName: loggeduser?.last_name ?? '',
    middleName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    phone: loggeduser?.phone ?? 0,
    email: loggeduser?.email ?? '',
    address: "",
    nextOfKinName: "",
    class_of_award: "",
    study_mode:'',
    nextOfKinContact: "",
    nextOfKinRelationship: "",
    campus: "",
    programs: [],
    academic_level: '',
    oLevelYear: "",
    oLevelIndexNumber: "",
    oLevelSchool: "",
    oLevelSubjects: [
      { id: "1", subject: "", grade: "" },
      { id: "2", subject: "", grade: "" },
    ],
    aLevelYear: "",
    aLevelIndexNumber: "",
    aLevelSchool: "",
    aLevelSubjects: [{ id: "1", subject: "", grade: "" }],
    alevel_combination:"",
    additionalQualificationInstitution: "",
    additionalQualificationType: "",
    additionalQualificationYear: "",
    passportPhoto: null,
    oLevelDocuments: null,
    aLevelDocuments: null,
    otherInstitutionDocuments: null,
    status:"submitted"
  })

  console.log('form data', formData)
  const [openSummary, setOpenSummary] = useState(false)

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  // fetch campus
const fetchCampus = async () => {
  try {
    const response = await AxiosInstance.get('/api/accounts/list_campus');
    setCampus(response.data); // store all campuses
  } catch (err) {
    console.error('Error fetching campuses:', err);
  }
};

const selectedCampus = formData.campus && campus.find(c => String(c.id) === String(formData.campus));

// programs
const programs = formData.programs?.map((programId: number) => {
  return batch?.programs.find((p: any) => p.id === programId);
}).filter(Boolean); // remove undefined if any

useEffect(() =>{
 fetchCampus()
}, [])

  // For text fields and textareas
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // For MUI Select (dropdowns)
  const handleChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (!name) return;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOLevelSubjectChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      oLevelSubjects: prev.oLevelSubjects.map((subject) =>
        subject.id === id ? { ...subject, [field]: value } : subject,
      ),
    }))
  }

  const addOLevelSubject = () => {
    if (formData.oLevelSubjects.length < 10) {
      setFormData((prev) => ({
        ...prev,
        oLevelSubjects: [...prev.oLevelSubjects, { id: Date.now().toString(), subject: "", grade: "" }],
      }))
    }
  }

  const removeOLevelSubject = (id: string) => {
    if (formData.oLevelSubjects.length > 1) {
      setFormData((prev) => ({
        ...prev,
        oLevelSubjects: prev.oLevelSubjects.filter((subject) => subject.id !== id),
      }))
    }
  }

  const handleALevelSubjectChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      aLevelSubjects: prev.aLevelSubjects.map((subject) =>
        subject.id === id ? { ...subject, [field]: value } : subject,
      ),
    }))
  }

  const addALevelSubject = () => {
    if (formData.aLevelSubjects.length < 5) {
      setFormData((prev) => ({
        ...prev,
        aLevelSubjects: [...prev.aLevelSubjects, { id: Date.now().toString(), subject: "", grade: "" }],
      }))
    }
  }

  const removeALevelSubject = (id: string) => {
    if (formData.aLevelSubjects.length > 1) {
      setFormData((prev) => ({
        ...prev,
        aLevelSubjects: prev.aLevelSubjects.filter((subject) => subject.id !== id),
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files?.[0],
      }))
    }
  }

  console.log('formdata', formData)

const handleSubmit = async () => {
  try {
    setSubmitLoader(true);

    const formDataToSend = new FormData();

    // Personal & Program Info
    formDataToSend.append("applicant", String(loggeduser?.user_id));
    formDataToSend.append("batch", String(batch?.id));
    formDataToSend.append("first_name", formData.firstName);
    formDataToSend.append("last_name", formData.lastName);
    formDataToSend.append("middle_name", formData.middleName || "");
    formDataToSend.append("date_of_birth", formData.dateOfBirth);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("nationality", formData.nationality);
    formDataToSend.append("phone", String(formData.phone));
    formDataToSend.append("email", formData.email);
    formDataToSend.append("address", formData.address || "");
    formDataToSend.append("next_of_kin_name", formData.nextOfKinName || "");
    formDataToSend.append("next_of_kin_contact", formData.nextOfKinContact || "");
    formDataToSend.append("next_of_kin_relationship", formData.nextOfKinRelationship || "");
    formDataToSend.append("campus", formData.campus);
    formDataToSend.append("academic_level", formData.academic_level);
    formDataToSend.append("study_mode", formData.study_mode);
    formDataToSend.append("status", "submitted");

    // Programs
    formData.programs.forEach(id => formDataToSend.append("programs", String(id)));

    // Academic Details
    formDataToSend.append("olevel_year", formData.oLevelYear || "");
    formDataToSend.append("olevel_index_number", formData.oLevelIndexNumber || "");
    formDataToSend.append("olevel_school", formData.oLevelSchool || "");
    formDataToSend.append("alevel_year", formData.aLevelYear || "");
    formDataToSend.append("alevel_index_number", formData.aLevelIndexNumber || "");
    formDataToSend.append("alevel_school", formData.aLevelSchool || "");
    formDataToSend.append("alevel_combination", formData.alevel_combination || "");
    formDataToSend.append("additional_qualification_institution", formData.additionalQualificationInstitution || "");
    formDataToSend.append("additional_qualification_type", formData.additionalQualificationType || "");
    formDataToSend.append("additional_qualification_year", formData.additionalQualificationYear || "");
    formDataToSend.append("class_of_award", formData.class_of_award || "");

    // Results as JSON strings
    formDataToSend.append("olevel_results", JSON.stringify(formData.oLevelSubjects.filter(s => s.subject && s.grade)));
    formDataToSend.append("alevel_results", JSON.stringify(formData.aLevelSubjects.filter(s => s.subject && s.grade)));

    // Passport Photo (optional)
    if (formData.passportPhoto) {
      formDataToSend.append("passport_photo", formData.passportPhoto);
    }

    // Documents — ONLY if file exists + send type
    if (formData.oLevelDocuments) {
      formDataToSend.append("documents", formData.oLevelDocuments);
      formDataToSend.append("document_types", "OLevel");
    }
    if (formData.aLevelDocuments) {
      formDataToSend.append("documents", formData.aLevelDocuments);
      formDataToSend.append("document_types", "ALevel");
    }
    if (formData.otherInstitutionDocuments) {
      formDataToSend.append("documents", formData.otherInstitutionDocuments);
      formDataToSend.append("document_types", "Others");
    }

    // ONE SINGLE REQUEST – FAST & RELIABLE
    await AxiosInstance.post("/api/admissions/create_applications", formDataToSend);

    setSubmitLoader(false);
    setOpenSummary(true);

    setTimeout(() => {
      navigate("/applicant/dashboard");
    }, 2000);

  } catch (err: any) {
    console.error("Submission failed:", err);
    alert("Submission failed. Please check your connection and try again.");
    setSubmitLoader(false);
  }
};

  // personal details
  const renderPersonalDetails = () => (
    <PersonalInfo
      formData={formData}
      handleInputChange={handleInputChange}
      handleChange={handleChange}
      setFormData={setFormData}
    />
  )

  // programs
  const renderPrograms = () => (
    <Programs
      formData={formData}
      handleChange={handleChange}
      setFormData={setFormData}
    />
  )

  // academic results
  const renderAcademicResults = () => (
    <AcademicResults
      formData={formData}
      handleOLevelSubjectChange={handleOLevelSubjectChange}
      addOLevelSubject={addOLevelSubject}
      removeOLevelSubject={removeOLevelSubject}
      handleALevelSubjectChange={handleALevelSubjectChange}
      addALevelSubject={addALevelSubject}
      removeALevelSubject={removeALevelSubject}
      handleInputChange={handleInputChange}
      handleChange={handleChange}

    />
  )

  // documents
  const renderDocuments = () => (
    <Documents
      formData={formData}
      handleFileChange={handleFileChange}
      setFormData={setFormData}
    />
  )

  const renderReview = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="info" icon={<InfoIcon />}>
        Please review all your information carefully before submitting. Once submitted, you cannot make changes.
      </Alert>

      <Paper sx={{ p: 2, bgcolor: "#f0f7ff", borderLeft: "4px solid #5ba3f5" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Personal Information
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>Name:</strong> {formData.firstName} {formData.lastName}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>Email:</strong> {formData.email}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>Phone:</strong> {formData.phone}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>Campus:</strong> {selectedCampus ? selectedCampus.name : "Not selected"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, bgcolor: "#f0f7ff", borderLeft: "4px solid #5ba3f5" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Selected Programs
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {programs && programs.length > 0 ? (
            programs.map((program:any) => (
              <Chip key={program.id} label={program.name} color="primary" variant="outlined" />
            ))
          ) : (
            <Typography variant="caption" sx={{ color: "#999" }}>
              No programs selected
            </Typography>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 2, bgcolor: "#f0f7ff", borderLeft: "4px solid #5ba3f5" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Uploaded Documents
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>Passport Photo:</strong> {formData.passportPhoto ? formData.passportPhoto.name : "Not uploaded"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>O-Level Documents:</strong>{" "}
              {formData.oLevelDocuments ? formData.oLevelDocuments.name : "Not uploaded"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>A-Level Documents:</strong>{" "}
              {formData.aLevelDocuments ? formData.aLevelDocuments.name : "Not uploaded"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              <strong>Other Institution Documents:</strong>{" "}
              {formData.otherInstitutionDocuments ? formData.otherInstitutionDocuments.name : "Not uploaded"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderPersonalDetails()
      case 1:
        return renderPrograms()
      case 2:
        return renderAcademicResults()
      case 3:
        return renderDocuments()
      case 4:
        return renderReview()
      default:
        return null
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <CardHeader
          title="New Application"
          subheader="Complete all steps to submit your application"
          sx={{
            background: "linear-gradient(135deg, #5ba3f5 0%, #3b82f6 100%)",
            color: "white",
            "& .MuiCardHeader-subheader": { color: "rgba(255,255,255,0.9)" },
          }}
        />

        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    StepIconComponent={() => {
                      const Icon = step.icon
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: index <= activeStep ? "#5ba3f5" : "#e0e0e0",
                            color: index <= activeStep ? "white" : "#999",
                            fontWeight: 600,
                          }}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                        </Box>
                      )
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ minHeight: 400, mb: 4 }}>{renderStepContent()}</Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<NavigateBeforeIcon />}
            >
              Previous
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  background: "linear-gradient(135deg, #5ba3f5 0%, #3b82f6 100%)",
                  color: "white",
                }}
                endIcon={<CheckCircleIcon />}
              >
                  {submitLoader? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Submit Application"}
              </Button>
      
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  background: "linear-gradient(135deg, #5ba3f5 0%, #3b82f6 100%)",
                  color: "white",
                }}
                endIcon={<NavigateNextIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openSummary} onClose={() => setOpenSummary(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "linear-gradient(135deg, #5ba3f5 0%, #3b82f6 100%)", color: "white" }}>
          Application Submitted Successfully
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: "#4caf50", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Thank you for your application!
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Your application has been submitted successfully. You will receive a confirmation email shortly.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenSummary(false)}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #5ba3f5 0%, #3b82f6 100%)" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
