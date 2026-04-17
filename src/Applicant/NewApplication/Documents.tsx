import React from 'react';
import {
  Box,
  Alert,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Book as BookIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

interface SubjectResult {
  id: string;
  subject: string;
  grade: string;
}

interface FormData {
  applicant: number | undefined;
  batch: number | undefined;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phone: number;
  email: string;
  address: string;
  nextOfKinName: string;
  nextOfKinContact: string;
  nextOfKinRelationship: string;
  campus: string;
  programs: number[];
  academic_level: string;
  oLevelYear: string;
  oLevelIndexNumber: string;
  oLevelSchool: string;
  oLevelSubjects: SubjectResult[];
  aLevelYear: string;
  aLevelIndexNumber: string;
  aLevelSchool: string;
  aLevelSubjects: SubjectResult[];
  alevel_combination: string;
  additionalQualifications: Array<{
    institution: string;
    type: string;
    year: string;
    class_of_award: string;
  }>;
  passportPhoto: File | null;
  oLevelDocuments: File | null;
  aLevelDocuments: File | null;
  otherInstitutionDocuments: File | null;
  status: string;
  application_fee_paid: boolean;
}

interface DocumentProps {
  formData: FormData;
  formErrors: Record<string, string>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PASSPORT_SIZE = 2 * 1024 * 1024; // 2MB

const Documents: React.FC<DocumentProps> = ({
  formData,
  formErrors,
  handleFileChange,
  setFormData,
}) => {

  // Custom file handler with size validation
  const handleFileWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Different size limits
    let maxSize = MAX_FILE_SIZE;
    let fileType = "";

    if (name === "passportPhoto") {
      maxSize = MAX_PASSPORT_SIZE;
      fileType = "Passport Photo";
    } else if (name === "oLevelDocuments") {
      fileType = "O-Level Documents";
    } else if (name === "aLevelDocuments") {
      fileType = "A-Level Documents";
    } else if (name === "otherInstitutionDocuments") {
      fileType = "Additional Documents";
    }

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      alert(`❌ ${fileType} is too large!\n\nMaximum allowed size is ${sizeMB}MB.`);
      
      // Reset input
      e.target.value = "";
      return;
    }

    // If file is valid, call original handler
    handleFileChange(e);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Alert severity="info" icon={<InfoIcon />}>
          <strong>Note:</strong> All academic documents (O-Level, A-Level, Others) must not exceed <strong>50MB</strong>.
        </Alert>

        {/* Passport Photo - 2MB */}
        <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PersonIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Passport Photo
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
            Recent passport-sized photo (JPG/PNG only)
          </Typography>

          <Paper sx={{ p: 3, textAlign: "center", border: "2px dashed #5ba3f5", borderRadius: 2 }}>
            <input
              type="file"
              name="passportPhoto"
              onChange={handleFileWithValidation}
              accept="image/jpeg,image/png,image/jpg"
              style={{ display: "none" }}
              id="passport-photo"
            />
            <label htmlFor="passport-photo" style={{ cursor: "pointer", display: "block" }}>
              <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
              <Typography variant="subtitle2">Upload Passport Photo</Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Max 2MB • JPG or PNG
              </Typography>
              {formData.passportPhoto && (
                <Chip label={formData.passportPhoto.name} onDelete={() => setFormData(prev => ({ ...prev, passportPhoto: null }))} sx={{ mt: 2 }} color="primary" />
              )}
            </label>
          </Paper>
          {formErrors.passportPhoto && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{formErrors.passportPhoto}</Typography>}
        </Paper>

        {/* O-Level Documents - 50MB */}
        <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <BookIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>O-Level Documents</Typography>
          </Box>
          <Paper sx={{ p: 3, textAlign: "center", border: "2px dashed #5ba3f5", borderRadius: 2 }}>
            <input
              type="file"
              name="oLevelDocuments"
              onChange={handleFileWithValidation}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              id="olevel-docs"
            />
            <label htmlFor="olevel-docs">
              <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
              <Typography variant="subtitle2">Upload O-Level Results</Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>Max 50MB</Typography>
              {formData.oLevelDocuments && <Chip label={formData.oLevelDocuments.name} onDelete={() => setFormData(p => ({...p, oLevelDocuments: null}))} sx={{ mt: 2 }} color="primary" />}
            </label>
          </Paper>
          {formErrors.oLevelDocuments && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{formErrors.oLevelDocuments}</Typography>}
        </Paper>

        {/* A-Level Documents - 50MB */}
        <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <SchoolIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>A-Level Documents</Typography>
          </Box>
          <Paper sx={{ p: 3, textAlign: "center", border: "2px dashed #5ba3f5", borderRadius: 2 }}>
            <input
              type="file"
              name="aLevelDocuments"
              onChange={handleFileWithValidation}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              id="alevel-docs"
            />
            <label htmlFor="alevel-docs">
              <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
              <Typography variant="subtitle2">Upload A-Level Results</Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>Max 50MB</Typography>
              {formData.aLevelDocuments && <Chip label={formData.aLevelDocuments.name} onDelete={() => setFormData(p => ({...p, aLevelDocuments: null}))} sx={{ mt: 2 }} color="primary" />}
            </label>
          </Paper>
          {formErrors.aLevelDocuments && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{formErrors.aLevelDocuments}</Typography>}
        </Paper>

        {/* Other Documents - 50MB */}
        {formData.additionalQualifications.length > 0 && (
          <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CheckCircleIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Other Academic Documents</Typography>
            </Box>
            <Paper sx={{ p: 3, textAlign: "center", border: "2px dashed #5ba3f5", borderRadius: 2 }}>
              <input
                type="file"
                name="otherInstitutionDocuments"
                onChange={handleFileWithValidation}
                accept=".pdf,.jpg,.jpeg,.png,.zip"
                style={{ display: "none" }}
                id="other-docs"
              />
              <label htmlFor="other-docs">
                <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
                <Typography variant="subtitle2">Upload Additional Documents</Typography>
                <Typography variant="caption" sx={{ color: "#666" }}>Max 50MB (Optional)</Typography>
                {formData.otherInstitutionDocuments && <Chip label={formData.otherInstitutionDocuments.name} onDelete={() => setFormData(p => ({...p, otherInstitutionDocuments: null}))} sx={{ mt: 2 }} color="primary" />}
              </label>
            </Paper>
            {formErrors.otherInstitutionDocuments && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{formErrors.otherInstitutionDocuments}</Typography>}
          </Paper>
        )}

        <Alert severity="warning" icon={<WarningIcon />}>
          Files larger than 50MB will be rejected automatically.
        </Alert>
      </Box>
    </>
  );
};

export default Documents;