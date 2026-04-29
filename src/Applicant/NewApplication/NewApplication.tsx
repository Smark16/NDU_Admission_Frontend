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
import { LinearProgress } from "@mui/material";
import imageCompression from 'browser-image-compression';
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
  hasOLevel: boolean;
  hasALevel: boolean;
  status: string
}

export default function NewApplicationForm() {
  const AxiosInstance = useAxios()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate()
  const [submitLoader, setSubmitLoader] = useState(false)
  const { batch } = useHook()
  const { loggeduser } = useContext(AuthContext) || {}
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressingField, setCompressingField] = useState<string | null>(null);

  // drafts
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)
  const [hasDraft, setHasDraft] = useState<boolean | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

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
    hasOLevel: false,
    hasALevel: false,
    status: "submitted"
  })
  const [openSummary, setOpenSummary] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)
  // const [submissionMessage, setSubmissionMessage] = useState(
  //   "Your application has been submitted successfully. You will receive a confirmation email shortly."
  // )

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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
        break;

      case 2: // Academic Results
        const hasOLevel = !!formData.hasOLevel;
        const hasALevel = !!formData.hasALevel;

        if (hasOLevel) {
          if (!formData.oLevelYear) errors.oLevelYear = "O-Level year is required";
          if (!formData.oLevelIndexNumber?.trim()) errors.oLevelIndexNumber = "O-Level index number required";
          if (!formData.oLevelSchool?.trim()) errors.oLevelSchool = "O-Level school required";
          // if (formData.oLevelSubjects.length < 8) {
          //   errors.oLevelSubjects = "Add at least 8 O-Level results";
          // }
        }

        if (hasALevel) {
          if (!formData.aLevelYear) errors.aLevelYear = "A-Level year required";
          if (!formData.aLevelIndexNumber?.trim()) errors.aLevelIndexNumber = "A-Level index required";
          if (!formData.aLevelSchool?.trim()) errors.aLevelSchool = "A-Level school required";
          if (!formData.alevel_combination?.trim()) errors.alevel_combination = "A-Level combination required";
          // if (formData.aLevelSubjects.length < 5) {
          //   errors.aLevelSubjects = "Add at least 5 A-Level results";
          // }
        }

        // Allow proceeding if they have either O/A Level OR Additional Qualifications
        if (formData.additionalQualifications?.length > 0) {
          const hasIncompleteQual = formData.additionalQualifications.some((qual: any) =>
            !qual.institution?.trim() ||
            !qual.type?.trim() ||
            !qual.year ||
            !qual.class_of_award?.trim()
          );

          if (hasIncompleteQual) {
            errors.additionalQualifications =
              "Please completely fill all fields (Institution, Type, Year, and Class of Award) for every additional qualification you added.";
          }
        }

        // If user has NO O-Level and NO A-Level, they MUST provide at least one Additional Qualification
        if (!hasOLevel && !hasALevel) {
          if (!formData.additionalQualifications || formData.additionalQualifications.length === 0) {
            errors.additionalQualifications =
              "Since you have neither O-Level nor A-Level, you must add at least one additional qualification.";
          }
        }

        break;
      case 3: // Documents
        if (!formData.passportPhoto) errors.passportPhoto = "Passport photo is required";

        if (formData.hasOLevel) {
          if (!formData.oLevelDocuments) errors.oLevelDocuments = "O-Level certificate is required";
        }

        // Only require A-Level doc if they have A-Level
        if (formData.hasALevel) {
          if (!formData.aLevelDocuments) {
            errors.aLevelDocuments = "A-Level certificate is required";
          }
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

  // const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  const MAX_FILE_SIZE_AFTER_COMPRESSION = 5 * 1024 * 1024 // 5MB
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    let fileToSave = files[0];
    const originalName = fileToSave.name;
    const originalSize = (fileToSave.size / (1024 * 1024)).toFixed(1);

    if (fileToSave.type.startsWith('image/')) {
      try {
        setCompressingField(name);
        showNotification(`Compressing ${originalName}...`, "info");

        const options = {
          maxSizeMB: 1.5,           // Slightly increased for better quality
          maxWidthOrHeight: 2000,
          useWebWorker: true,
          preserveExif: false,
        };

        // Get compressed Blob
        const compressedBlob = await imageCompression(fileToSave, options);

        // Create proper File with original extension
        const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = `compressed_${Date.now()}.${fileExtension}`;

        fileToSave = new File([compressedBlob], newFileName, {
          type: compressedBlob.type || `image/${fileExtension}`,
          lastModified: Date.now(),
        });

        const compressedSize = (fileToSave.size / (1024 * 1024)).toFixed(1);
        console.log(`✓ Compressed ${originalName}: ${originalSize}MB → ${compressedSize}MB`);

        showNotification(`Compression complete: ${compressedSize} MB`, "success");
      } catch (error) {
        console.error("Compression failed:", error);
        showNotification("Compression failed. Using original image.", "error");
        // fileToSave remains the original file
      } finally {
        setCompressingField(null);
      }
    }
    else if (fileToSave.type === 'application/pdf') {
      showNotification(`PDF detected (${originalSize} MB). Large PDFs upload slower on mobile.`, "info");
    }
    else if (originalName.toLowerCase().endsWith('.zip')) {
      showNotification(`ZIP file detected (${originalSize} MB). Upload may take longer on mobile.`, "info");
    }

    // Final size validation
    if (fileToSave.size > MAX_FILE_SIZE_AFTER_COMPRESSION) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: `File is still too large (${(fileToSave.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 8 MB.`,
      }));
      e.target.value = "";
      return;
    }

    // Save the correctly named file
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: fileToSave }));
  };

  // const handleFileChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, files } = e.target

  //   if (files && files[0]) {
  //     let file = files[0];
  //     const originalName = file.name;
  //     const originalSize = (file.size / (1024 * 1024)).toFixed(1);

  //      // Compress only images
  //     if (file.type.startsWith('image/')) {
  //       try {
  //         setCompressingField(name); 
  //         showNotification(`Compressing ${file.name}...`, "info");

  //         const options = {
  //           maxSizeMB: 1,           // Target 1 MB max per image
  //           maxWidthOrHeight: 2000,
  //           useWebWorker: true,
  //           preserveExif: false,
  //         };

  //         const compressedFile = await imageCompression(file, options);

  //         // create new file with proper name
  //         const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  //         const newFileName = `compressed_${Date.now()}.${fileExtension}`;

  //         file = new File([compressedFile], newFileName, {
  //           type: compressedFile.type || 'image/jpeg',
  //         });

  //         const compressedSize = (compressedFile.size / (1024 * 1024)).toFixed(1);

  //         console.log(`Compressed ${file.name}: ${originalSize} MB → ${compressedSize} MB`);
  //         // file = compressedFile;

  //         showNotification(`Compression complete: ${compressedSize} MB`, "success");
  //       } catch (error) {
  //         console.error("Image compression failed:", error);
  //         showNotification("Compression failed. Using original image.", "error");
  //       }finally {
  //         setCompressingField(null);                    
  //       }
  //     } 
  //     // For PDFs - just warn user (can't compress easily)
  //     else if (file.type === 'application/pdf') {
  //       showNotification(`PDF detected (${originalSize} MB). Large PDFs may take longer to upload on mobile.`, "info");
  //     } 
  //     else {
  //       showNotification(`File type: ${file.type}. Large files may cause issues on mobile data.`, "info");
  //     }

  //     if (file.size > MAX_FILE_SIZE_AFTER_COMPRESSION) {
  //       setFormErrors((prev) => ({
  //         ...prev,
  //         [name]: `File is still too large (${(file.size / (1024*1024)).toFixed(1)} MB). Maximum allowed is 8 MB.`,
  //       }));
  //       e.target.value = "";
  //       return;
  //     }

  //      setFormErrors((prev) => ({ ...prev, [name]: "" }))
  //     setFormData((prev) => ({ ...prev, [name]: file }))
  //   }
  // }

  // HANDLE SAVE DRAFT
  const saveDraft = async (showMessage = false) => {
    try {
      // Create clean payload - REMOVE ALL FILES and non-serializable data
      const draftPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        nin: formData.nin,
        passportNumber: formData.passportNumber,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        disabled: formData.disabled,
        nextOfKinName: formData.nextOfKinName,
        nextOfKinContact: formData.nextOfKinContact,
        nextOfKinRelationship: formData.nextOfKinRelationship,
        campus: formData.campus,
        academic_level: formData.academic_level,
        programs: formData.programs,
        oLevelYear: formData.oLevelYear,
        oLevelIndexNumber: formData.oLevelIndexNumber,
        oLevelSchool: formData.oLevelSchool,
        oLevelSubjects: formData.oLevelSubjects,
        aLevelYear: formData.aLevelYear,
        aLevelIndexNumber: formData.aLevelIndexNumber,
        aLevelSchool: formData.aLevelSchool,
        aLevelSubjects: formData.aLevelSubjects,
        alevel_combination: formData.alevel_combination,
        additionalQualifications: formData.additionalQualifications,
        application_fee_paid: formData.application_fee_paid,
        externalReference: formData.externalReference,
        hasOlevel: formData.hasOLevel,
        hasAlevel: formData.hasALevel,
        status: "draft",
        applicant: loggeduser?.user_id,
        batch: batch?.id,
      };

      await AxiosInstance.post(
        "/api/drafts/save_draft/",
        draftPayload
      );

      if (showMessage) showNotification("Draft saved successfully", "success");

    } catch (err) {
      console.error("Failed to save draft", err);
      if (showMessage) {
        showNotification("Failed to save draft", "error");
      }
    }
  };

  // handle next
  const handleNext = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setFormErrors({});

    if (activeStep < steps.length - 1) {
      setIsSavingDraft(true);

      // Save draft ONLY when moving to next step
      await saveDraft(false);

      setActiveStep(activeStep + 1);
      setIsSavingDraft(false);
    }
  };

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

    // clear ref on payment failure
    const clearPaymentState = () => {
      setFormData((prev) => ({
        ...prev,
        externalReference: "",
        application_fee_paid: false,
      }));
    };

    console.log('formData', formData)

  const handleSubmit = async (paymentOverride?: { externalReference?: string; forcePaid?: boolean }) => {
    if (isSubmitting || submitLoader) return;

    const isPaid = paymentOverride?.forcePaid || formData.application_fee_paid;
    const resolvedExternalReference = paymentOverride?.externalReference || formData.externalReference;

    if (!isPaid) {
      showNotification("Please complete payment before submitting", "error");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setSubmitLoader(true);

    try {
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

      // Optional fields
      if (formData.nin) formDataToSend.append("nin", formData.nin);
      if (formData.passportNumber) formDataToSend.append("passport_number", formData.passportNumber);

      // Programs
      formData.programs.forEach(id => formDataToSend.append("programs", String(id)));

      // Academic Details
      formDataToSend.append("has_olevel", formData.hasOLevel ? "true" : "false");
      formDataToSend.append("has_alevel", formData.hasALevel ? "true" : "false");

      if (formData.hasOLevel || formData.hasALevel) {
        formDataToSend.append("olevel_year", formData.oLevelYear || "");
        formDataToSend.append("olevel_index_number", formData.oLevelIndexNumber || "");
        formDataToSend.append("olevel_school", formData.oLevelSchool || "");
        formDataToSend.append("alevel_year", formData.aLevelYear || "");
        formDataToSend.append("alevel_index_number", formData.aLevelIndexNumber || "");
        formDataToSend.append("alevel_school", formData.aLevelSchool || "");
        formDataToSend.append("alevel_combination", formData.alevel_combination || "");
      }

      // Additional Qualifications
      formDataToSend.append(
        "additional_qualifications",
        JSON.stringify(formData.additionalQualifications.filter(q => q.institution || q.type))
      );

      // Results as JSON strings
      if (formData.hasOLevel) {
        formDataToSend.append(
          "olevel_results",
          JSON.stringify(formData.oLevelSubjects.filter(s => s.subject && s.grade))
        );
      }

      if (formData.hasALevel) {
        formDataToSend.append(
          "alevel_results",
          JSON.stringify(formData.aLevelSubjects.filter(s => s.subject && s.grade))
        );
      }

      // Files
      if (formData.passportPhoto) {
        formDataToSend.append("passport_photo", formData.passportPhoto);
      }

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

      if (resolvedExternalReference) {
        formDataToSend.append("external_reference", resolvedExternalReference);
      }

      // Retry helper
      const postWithRetry = async (maxRetries = 5) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await AxiosInstance.post(
              "/api/admissions/create_applications",
              formDataToSend,
              {
                timeout: 300000,
                onUploadProgress: (progressEvent) => {
                  if (progressEvent.total) {
                    const percent = Math.round(
                      (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percent);
                  }
                },
              }
            );
          } catch (err: any) {
            const isNetworkOrServerError =
              !err.response || (err.response && err.response.status >= 500);

            if (attempt === maxRetries || !isNetworkOrServerError) {
              throw err;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            console.log(`Retry attempt ${attempt}...`);
          }
        }
      };

      await postWithRetry();

      // Success
      setSubmitLoader(false);
      setOpenSummary(true);

      setTimeout(() => {
        navigate("/applicant/dashboard");
      }, 2000);

    } catch (err: any) {
      if (err.response?.data?.detail) {
        showNotification(`${err.response.data.detail}`, "error");
      } else {
        showNotification(
          "Submission failed. Please check your connection and try again or Refresh and submit again.",
          "error"
        );
      }
      console.error("Submission failed:", err);
    } finally {
      setSubmitLoader(false);
      setIsSubmitting(false);
      setUploadProgress(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const loadDraft = async () => {
    try {
      setIsLoadingDraft(true)
      const { data } = await AxiosInstance.get("/api/drafts/get_draft_info/");

      if (data?.draft_exists && data?.data) {
        setHasDraft(true)
        const draft = data.data;

        setFormData(prev => ({
          ...prev,
          firstName: draft.first_name || prev.firstName,
          lastName: draft.last_name || prev.lastName,
          middleName: draft.middle_name || "",
          dateOfBirth: draft.dateOfBirth || "",
          gender: draft.gender || "",
          nationality: draft.nationality || "",
          nin: draft.nin || "",
          passportNumber: draft.passportNumber || "",
          phone: draft.phone || prev.phone,
          email: draft.email || prev.email,
          address: draft.address || "",
          disabled: draft.disabled || "",
          nextOfKinName: draft.nextOfKinName || "",
          nextOfKinContact: draft.nextOfKinContact || "",
          nextOfKinRelationship: draft.nextOfKinRelationship || "",

          // Programs section
          campus: draft.campus ? String(draft.campus) : "",
          academic_level: draft.academic_level ? String(draft.academic_level) : "",
          programs: Array.isArray(draft.programs) ? draft.programs : [],

          // JSON Fields
          oLevelYear: draft.oLevelYear || "",
          oLevelIndexNumber: draft.oLevelIndexNumber || "",
          oLevelSchool: draft.oLevelSchool || "",
          oLevelSubjects: draft.oLevelSubjects || prev.oLevelSubjects,

          aLevelYear: draft.aLevelYear || "",
          aLevelIndexNumber: draft.aLevelIndexNumber || "",
          aLevelSchool: draft.aLevelSchool || "",
          alevel_combination: draft.alevel_combination || "",
          aLevelSubjects: draft.aLevelSubjects || prev.aLevelSubjects,

          hasOLevel: draft.hasOlevel || false,
          hasALevel: draft.hasAlevel || false,

          additionalQualifications: draft.additionalQualifications || [],
          application_fee_paid: draft.application_fee_paid || false,
          externalReference: draft.externalReference || "",
        }));

      }
    } catch (err) {
      console.log("No previous draft found");
    } finally {
      setIsLoadingDraft(false)
    }
  };

  useEffect(() => {
    loadDraft();
  }, []);

  // ====================== LOADING OVERLAY ======================
  if (isLoadingDraft && hasDraft === null) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center'
        }}>
          <CircularProgress size={80} thickness={4} sx={{ color: '#3e397b', mb: 4 }} />

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1a3a52' }}>
            Loading your draft...
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', maxWidth: 400 }}>
            Please wait while we restore your previous application data
          </Typography>
        </Box>
      </Container>
    )
  }

  if (submitLoader) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          bgcolor: 'rgba(255,255,255,0.95)',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999
        }}>
          <CircularProgress size={90} thickness={5} sx={{ color: '#3e397b', mb: 3 }} />

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1a3a52' }}>
            Submitting Your Application...
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mb: 3 }}>
            Please wait — do not refresh
          </Typography>

          {/* Progress bar */}
          <Box sx={{ width: '70%', maxWidth: 400 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ height: 12, borderRadius: 2 }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              {uploadProgress}% uploaded
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 300, mb: 1, color: '#1a3a52' }}>
            Note: Upload times may vary based on your connection and file sizes.
          </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

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
        compressingField={compressingField}
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
          Note: Your Required to pay a nonrefundable application fee of {" "}
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
                  text="Pay and Submit Application"
                  onClick={handleOpenPaymentModal}
                />
              ) : (
                <CustomButton
                  onClick={handleSubmit}
                  disabled={isSubmitting || submitLoader}
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
                text={isSavingDraft ? "Saving Draft..." : "Next"}
                disabled={isSavingDraft}
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
            {/* <Typography variant="body2" sx={{ color: "#666" }}>
              {submissionMessage}
            </Typography> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={() => setOpenSummary(false)} text='Close' />
        </DialogActions>
      </Dialog>

      {/* <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amountPaid={selectedFee?.amount ?? 0}
        onPaymentSuccess={(externalRef?: string) => {
          // 1. Update form state
          setFormData((prev) => ({
            ...prev,
            application_fee_paid: true,
            externalReference: externalRef || "",
          }));

          // 2. Save draft again (now with paid = true)
          saveDraft(false);

          showNotification(
            "Payment successful! Submitting your application now...",
            "success"
          );

          // Close modal immediately
          setTimeout(() => {
            setPaymentModalOpen(false);
          }, 1000)

          // 3. Auto-submit after a tiny delay
          setTimeout(() => {
            handleSubmit({ externalReference: externalRef || "", forcePaid: true });
          }, 1800);

        }}
      /> */}

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amountPaid={selectedFee?.amount ?? 0}
        onPaymentSuccess={(externalRef?: string) => {
            setFormData((prev) => ({
              ...prev,
              application_fee_paid: true,
              externalReference: externalRef || "",        
            }));

          saveDraft(false);   // Save draft with successful reference

          showNotification("Payment successful! Submitting your application now...", "success");

          // Close modal immediately
          setTimeout(() => {
            setPaymentModalOpen(false);
          }, 3000)

          setTimeout(() => {
            handleSubmit({ externalReference: externalRef || "", forcePaid: true });
          }, 3000);
        }}
        onPaymentFailed={clearPaymentState}    
      />
    </Container>
  )
}

