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
import CustomButton from "../../ReUsables/custombutton"
import PaymentModal from "../Dashboard/PaymentModal"

const steps = [
  { label: "Personal Details", icon: PersonIcon },
  { label: "Programs", icon: SchoolIcon },
  { label: "Academic Results", icon: BookIcon },
  { label: "Documents", icon: CloudUploadIcon },
  { label: "Review", icon: CheckCircleIcon },
]

interface AcademicLevel {
  id: number,
  name: string
}

interface Fee {
  id: string;
  fee_type: string;
  admission_period: string,
  admission_id: number,
  academic_year: string,
  nationality_type: string;
  amount: number;
  currency: string;
  academic_level: AcademicLevel[];
  is_active: boolean;
}

interface SubjectResult {
  id: string
  subject: string
  grade: string
}

interface Campus {
  id: number;
  name: string;
}

interface FormData {
  applicant: number | undefined;
  batch: number | undefined
  firstName: string
  lastName: string
  application_fee_paid: boolean
  externalReference?: string;
  middleName: string
  dateOfBirth: string
  gender: string
  nationality: string
  nin?: string
  passportNumber?: string
  phone: number
  email: string
  address: string
  nextOfKinName: string
  nextOfKinContact: string
  nextOfKinRelationship: string
  campus: string
  programs: number[]
  academic_level: string
  oLevelYear: string
  oLevelIndexNumber: string
  oLevelSchool: string
  disabled?: string
  oLevelSubjects: SubjectResult[]
  aLevelYear: string
  aLevelIndexNumber: string
  aLevelSchool: string
  aLevelSubjects: SubjectResult[]
  // study_mode: string
  alevel_combination: string
  additionalQualifications: Array<{
    institution: string;
    type: string;
    year: string;
    class_of_award: string;
  }>;
  passportPhoto: File | null
  oLevelDocuments: File | null
  aLevelDocuments: File | null
  otherInstitutionDocuments: File | null
  status: string
}

export default function NewApplicationForm() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()
  const [submitLoader, setSubmitLoader] = useState(false)
  const { batch } = useHook()
  const { loggeduser, showErrorAlert, showSuccessAlert } = useContext(AuthContext) || {}
  const [activeStep, setActiveStep] = useState(0)
  const [fees, setFees] = useState<Fee[]>([]);
  const [campus, setCampus] = useState<Campus[]>([])
  const [formData, setFormData] = useState<FormData>({
    applicant: loggeduser?.user_id ? Number(loggeduser?.user_id) : undefined,
    batch: batch?.id ? Number(batch.id) : undefined,
    firstName: loggeduser?.first_name ?? '',
    lastName: loggeduser?.last_name ?? '',
    middleName: "",
    application_fee_paid: false,
    dateOfBirth: "",
    gender: "",
    nationality: "",
    disabled: "",
    phone: loggeduser?.phone ?? 0,
    email: loggeduser?.email ?? '',
    address: "",
    nextOfKinName: "",
    // class_of_award: "",
    // study_mode: '',
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
    alevel_combination: "",
    additionalQualifications: [],
    passportPhoto: null,
    oLevelDocuments: null,
    aLevelDocuments: null,
    otherInstitutionDocuments: null,
    externalReference: "",
    status: "submitted"
  })
  const [openSummary, setOpenSummary] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // auto save
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // payment modal handlers
  const handleOpenPaymentModal = () => {
    if (!selectedFee?.amount) {
      return;
    }
    setPaymentModalOpen(true);
  };

  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 6000)
  }

  // Fetch fee plans
  const fetchFeePlans = async () => {
    try {
      const { data } = await AxiosInstance.get('/api/payments/list_fee_plan');
      setFees(data);
    } catch (err) {
      console.error('Error fetching fees:', err);
    }
  };

  // Uganda NIN validation function (14 alphanumeric chars, starts with CM or CF)
  const isValidUgandaNIN = (nin: string): boolean => {
    const regex = /^[C][MF][A-Z0-9]{12}$/;
    return regex.test(nin.toUpperCase());
  };

  // Validate forms
  const validateStep = (step: number): boolean => {
    const LOCAL_COUNTRIES = ["Uganda", "Kenya", "Tanzania"];
    const isLocal = LOCAL_COUNTRIES.includes(formData.nationality);
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Info
        if (!formData.firstName.trim()) errors.firstName = "First name is required";
        if (!formData.lastName.trim()) errors.lastName = "Last name is required";
        if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
        if (!formData.disabled) errors.disabled = "Please select if you are disabled or not";
        if (!formData.gender) errors.gender = "Please select gender";
        if (!formData.nationality.trim()) errors.nationality = "Nationality is required";
        if (!formData.phone || String(formData.phone).length < 9) errors.phone = "Valid phone required";
        if (!formData.email.includes("@")) errors.email = "Valid email required";
        if (!formData.nextOfKinName.trim()) errors.nextOfKinName = "next of kin name is required"
        if (!formData.nextOfKinContact.trim()) errors.nextOfKinContact = "next of kin contact is required"
        if (!formData.nextOfKinRelationship.trim()) errors.nextOfKinRelationship = "next of kin relationship is required"

        // Require nin or passportNumber based on nationality
        if (isLocal && !formData.nin?.trim()) {
          errors.nin = "NIN is required for local applicants";
        }
        if (!isLocal && !formData.passportNumber?.trim()) {
          errors.passportNumber = "Passport number is required for international applicants";
        }

        // Validate Uganda NIN format if applicable
        if (formData.nationality === "Uganda" && formData.nin?.trim()) {
          if (!isValidUgandaNIN(formData.nin)) {
            errors.nin = "Invalid Uganda NIN format (e.g., CM1234567890AB or CF1234567890AB)";
          }
        }
        break;

      case 1: // Programs
        if (formData.programs.length === 0) {
          errors.programs = "Please select at least one program";
        }
        if (!formData.campus) errors.campus = "Please select a campus";
        if (!formData.academic_level) errors.academic_level = "Academic level is required";
        // if (!formData.study_mode) errors.study_mode = "Study mode is required";
        break;

      case 2: // Academic Results
        if (!formData.oLevelYear) errors.oLevelYear = "O-Level year is required";
        if (!formData.oLevelIndexNumber.trim()) errors.oLevelIndexNumber = "O-Level index number required";
        if (!formData.oLevelSchool.trim()) errors.oLevelSchool = "O-Level school required";

        // Check at least one valid O-Level subject
        const validOLevel = formData.oLevelSubjects.some(s => s.subject && s.grade);
        if (!validOLevel) errors.oLevelSubjects = "Add an O-Level result";

        // if(formData.oLevelSubjects.length < 8){
        //   errors.oLevelSubjects ='Add atleast 8 Olevel Results'
        // }

        // Only validate A-Level if applicant has A-Level

        if (!formData.aLevelYear) errors.aLevelYear = "A-Level year required";
        if (!formData.aLevelIndexNumber.trim()) errors.aLevelIndexNumber = "A-Level index required";
        if (!formData.aLevelSchool.trim()) errors.aLevelSchool = "A-Level school required";
        if (!formData.alevel_combination.trim()) errors.alevel_combination = "combination required"

        // if(formData.aLevelSubjects.length < 5){
        //   errors.aLevelSubjects = "Add atleast 5 Alevel results"
        // }

        break;

      case 3: // Documents
        if (!formData.passportPhoto) errors.passportPhoto = "Passport photo is required";
        if (!formData.oLevelDocuments) errors.oLevelDocuments = "O-Level certificate is required";
        // Only require A-Level doc if they have A-Level
        if (!formData.aLevelDocuments) {
          errors.aLevelDocuments = "A-Level certificate is required";
        }
        if (formData.additionalQualifications.length > 0 && !formData.otherInstitutionDocuments) errors.otherInstitutionDocuments = "Other documents are required"
        break;

      case 4:
        return true;
    }

    setFormErrors(errors);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setFormErrors({});

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  // fetch campus
  const fetchCampus = async () => {
    try {
      const response = await AxiosInstance.get('/api/accounts/list_campus');
      setCampus(response.data);
    } catch (err) {
      console.error('Error fetching campuses:', err);
    }
  };

  const selectedCampus = formData.campus && campus.find(c => String(c.id) === String(formData.campus));

  // programs
  const programs = formData.programs?.map((programId: number) => {
    return batch?.programs.find((p: any) => p.id === programId);
  }).filter(Boolean);

  useEffect(() => {
    fetchCampus()
    fetchFeePlans()
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

  // selected application amount
  const LOCAL_COUNTRIES = ["Uganda", "Kenya", "Tanzania"];
  const applicantType = LOCAL_COUNTRIES.includes(formData.nationality)
    ? "Local" : "International";

  const selectedFee = batch
    ? fees.find(
      fee =>
        fee.admission_id === batch.id &&
        fee.academic_year === batch.academic_year &&
        fee.nationality_type === applicantType &&
        fee.academic_level.some(
          (level) => level.id === Number(formData.academic_level)
        )

    )
    : undefined;

  console.log('applicant Data', formData)

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
      formDataToSend.append("disabled", formData?.disabled || "no");
      formDataToSend.append("address", formData.address || "");
      formDataToSend.append("next_of_kin_name", formData.nextOfKinName || "");
      formDataToSend.append("next_of_kin_contact", formData.nextOfKinContact || "");
      formDataToSend.append("next_of_kin_relationship", formData.nextOfKinRelationship || "");
      formDataToSend.append("campus", formData.campus);
      formDataToSend.append("academic_level", formData.academic_level);
      
      formDataToSend.append("status", "submitted");

      // Append nin or passportNumber if present (add these lines)
      if (formData.nin) formDataToSend.append("nin", formData.nin);
      if (formData.passportNumber) formDataToSend.append("passport_number", formData.passportNumber);

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

      // additional Qualifications
      formDataToSend.append(
        "additional_qualifications",
        JSON.stringify(formData.additionalQualifications.filter(q => q.institution || q.type))
      );

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

      if (formData.externalReference) {
        formDataToSend.append("external_reference", formData.externalReference);
      }

      // ONE SINGLE REQUEST – FAST & RELIABLE
      await AxiosInstance.post("/api/admissions/create_applications", formDataToSend);

      setSubmitLoader(false);
      setOpenSummary(true);

      setTimeout(() => {
        navigate("/applicant/dashboard");
      }, 2000);

    } catch (err: any) {
      if (err.response?.data.detail) {
        showNotification(`${err.response?.data.detail}`, "error")
      } else {
        showNotification("Submission failed. Please check your connection and try again.", "error")
      }
      console.error("Submission failed:", err);
      setSubmitLoader(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  // HANDLE SAVE DRAFT
 const saveDraft = async (showMessage = false) => {
  try {
    const draftData = {
      ...formData,
      applicant: loggeduser?.user_id,
      batch: batch?.id,
      status: "draft",
    };

    const response = await AxiosInstance.post("/api/drafts/save_draft/", draftData);

    setLastSaved(new Date());

    if (showMessage) {
      showSuccessAlert(`${response?.data?.message}`)
    }
  } catch (err) {
    console.error("Failed to save draft", err);
    if (showMessage) {
      showNotification("Failed to save draft", "error");
    }
  }
};

const loadDraft = async () => {
  try {
    const { data } = await AxiosInstance.get("/api/drafts/get_draft_info/");

    if (data?.draft_exists && data?.data) {
      setFormData(prev => ({
        ...prev,
        ...data.data,
        // Ensure arrays are not overwritten with undefined
        oLevelSubjects: data.data.oLevelSubjects || prev.oLevelSubjects,
        aLevelSubjects: data.data.aLevelSubjects || prev.aLevelSubjects,
        additionalQualifications: data.data.additionalQualifications || [],
        programs: data.data.programs || [],
      }));

      // Show loading message only once
      showSuccessAlert("Previous draft loaded successfully")
    }
  } catch (err) {
    console.log("No draft found or error loading draft");
    showErrorAlert("No draft found or error loading draft")
  } 
};

// Main useEffect - Runs once on mount + when activeStep changes
useEffect(() => {
  loadDraft();

  // Auto-save every 8 seconds (silent by default)
  const interval = setInterval(() => {
    if (activeStep < 4) {
      saveDraft(false);        // silent save - no notification
    }
  }, 8000);

  return () => clearInterval(interval);
}, [activeStep]);   // Only depend on activeStep, NOT formData

  // personal details
  const renderPersonalDetails = () => (
    <>
    {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 3 }}
        >
          {notification.message}
        </Alert>
      )}
      <PersonalInfo
        formData={formData}
        handleInputChange={handleInputChange}
        handleChange={handleChange}
        setFormData={setFormData}
        formErrors={formErrors}
      />
    </>
  )

  // programs
  const renderPrograms = () => (
    <>
    <Programs
      formData={formData}
      handleChange={handleChange}
      setFormData={setFormData}
      formErrors={formErrors}
    />
    </>
  )

  // academic results
  const renderAcademicResults = () => (
    <>
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
      setFormData={setFormData}
      formErrors={formErrors}
    />
    </>
  )

  // documents
  const renderDocuments = () => (
    <>
    <Documents
      formData={formData}
      handleFileChange={handleFileChange}
      setFormData={setFormData}
      formErrors={formErrors}
    />
    </>
  )

  const renderReview = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 3 }}
        >
          {notification.message}
        </Alert>
      )}

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
            programs.map((program: any) => (
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

      <Alert>
        <Typography>
          Note: Your Required to pay a unrefundable application fee of {" "}
          <strong>UGX {selectedFee?.amount}</strong> before application submission
        </Typography>
      </Alert>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <CardHeader
          title="New Application"
          subheader="Complete all steps to submit your application"
          sx={{
            background: "linear-gradient(135deg, #3e397b 0%, #3e397b 100%)",
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
                            bgcolor: index <= activeStep ? "#3e397b" : "#e0e0e0",
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
            <CustomButton variant="outlined" onClick={handleBack} icon={<NavigateBeforeIcon />} disabled={activeStep === 0} text='Previous' />
            {activeStep === steps.length - 1 ? (
              !formData.application_fee_paid ? (
                <CustomButton
                  icon={<CheckCircleIcon />}
                  text="Pay Application Fee"
                  onClick={handleOpenPaymentModal}
                />
              ) : (
                <CustomButton
                  onClick={handleSubmit}
                  endIcon={<CheckCircleIcon />}
                  text={
                    submitLoader ? (
                      <CircularProgress size={24} sx={{ color: "#ffffff" }} />
                    ) : (
                      "Submit Application"
                    )
                  }
                />
              )
              // <CustomButton
              //     onClick={handleSubmit}
              //     endIcon={<CheckCircleIcon />}
              //     text={
              //       submitLoader ? (
              //         <CircularProgress size={24} sx={{ color: "#ffffff" }} />
              //       ) : (
              //         "Submit Application"
              //       )
              //     }
              //   />
            ) : (
              <CustomButton
                onClick={handleNext}
                endIcon={<NavigateNextIcon />}
                text="Next"
              />
            )}

          </Box>
        </CardContent>
      </Card>

      <Dialog open={openSummary} onClose={() => setOpenSummary(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "linear-gradient(135deg, #3e397b 0%, #3e397b 100%)", color: "white" }}>
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
          <CustomButton onClick={() => setOpenSummary(false)} text='Close' />
        </DialogActions>
      </Dialog>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={(externalRef?: string) => {
          setFormData(prev => ({
            ...prev,
            application_fee_paid: true,
            externalReference: externalRef || ""
          }));

          showNotification(
            "Application fee paid successfully! You can now submit your application.",
            "success"
          );
        }}
        amountPaid={selectedFee?.amount ?? 0}
      />
    </Container>
  )
}
