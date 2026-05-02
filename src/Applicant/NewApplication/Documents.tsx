import React from 'react'
import {
  Box,
  Alert,
  Typography,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material"
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Book as BookIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material"

interface SubjectResult {
  id: string
  subject: string
  grade: string
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
  application_fee_paid:boolean
  nextOfKinRelationship: string
  campus: string
  programs: number[]
  academic_level: string
  oLevelYear: string
  oLevelIndexNumber: string
  oLevelSchool: string
  oLevelSubjects: SubjectResult[]
  aLevelYear: string
  aLevelIndexNumber: string
  aLevelSchool: string
  aLevelSubjects: SubjectResult[]
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
  passportPhotoUrl: string | null
  oLevelDocumentsUrl: string | null
  aLevelDocumentsUrl: string | null
  otherInstitutionDocumentsUrl: string | null
  hasOLevel: boolean;
  hasALevel: boolean;
  status: string
}

interface DocumentProps {
  formData: FormData;
  compressingField: string | null;    
  formErrors: Record<string, string>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const SavedFileChip = ({
  file,
  url,
  fieldName,
  setFormData,
}: {
  file: File | null;
  url: string | null;
  fieldName: string;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  if (file) {
    return (
      <Chip
        label={file.name}
        onDelete={() => setFormData((prev: any) => ({ ...prev, [fieldName]: null }))}
        sx={{ mt: 2 }}
        color="primary"
      />
    );
  }
  if (url) {
    const filename = url.split('/').pop() || 'document';
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={`Saved: ${filename}`}
        onDelete={() => setFormData((prev: any) => ({ ...prev, [`${fieldName}Url`]: null }))}
        sx={{ mt: 2, bgcolor: "#e8f5e9", color: "#2e7d32", "& .MuiChip-deleteIcon": { color: "#2e7d32" } }}
      />
    );
  }
  return null;
};

const Documents: React.FC<DocumentProps> = ({
  formData,
  formErrors,
  compressingField,
  handleFileChange,
  setFormData
}) => {

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Alert severity="info" icon={<InfoIcon />}>
          <strong>Note:</strong> Upload all required documents in PDF or image format. Maximum file size is 100MB per file. Ensure documents are clear and legible.
        </Alert>

        {/* Passport Photo Section */}
        <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <PersonIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
              Passport Photo
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
            Upload a recent passport-sized photo from a professional photo studio. Accepted formats: JPG, PNG (Max 100MB)
          </Typography>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              border: formErrors.passportPhoto ? "2px dashed #d32f2f" : "2px dashed #5ba3f5",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "#f0f7ff", borderColor: "#3b82f6" },
            }}
          >
            <input
              type="file"
              name="passportPhoto"
              onChange={handleFileChange}
              accept="image/jpeg,image/png, image/jpg, image/heic"
              style={{ display: "none" }}
              id="passport-photo"
              required
            />
            <label htmlFor="passport-photo" style={{ cursor: "pointer", display: "block" }}>
              <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                JPG or PNG, ≤ 100MB
              </Typography>
              {compressingField === "passportPhoto" ? (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#3e397b', mb: 3 }} />
                  <Typography variant="caption" sx={{ color: "#666" }}>Compressing image...</Typography>
                </Box>
              ) : (
                <SavedFileChip file={formData.passportPhoto} url={formData.passportPhotoUrl} fieldName="passportPhoto" setFormData={setFormData} />
              )}
            </label>
          </Paper>
          {formErrors.passportPhoto && (
            <Typography
              variant="caption"
              sx={{
                color: "#d32f2f",
                fontWeight: 500,
                display: "block",
                mt: 1,
                ml: 1,
              }}
            >
              {formErrors.passportPhoto}
            </Typography>
          )}
        </Paper>

        {/* O-Level Documents Section */}
        {formData.hasOLevel && (
            <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <BookIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
                  O-Level Documents
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                Upload your O-Level examination results/certificates. You can upload multiple documents as a single PDF
                file.
              </Typography>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  border: formErrors.oLevelDocuments ? "2px dashed #d32f2f" : "2px dashed #5ba3f5",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": { bgcolor: "#f0f7ff", borderColor: "#3b82f6" },
                }}
              >
                <input
                  type="file"
                  name="oLevelDocuments"
                  onChange={handleFileChange}
                  accept=".pdf, .jpg, .png, .jpeg"
                  style={{ display: "none" }}
                  id="olevel-docs"
                />
                <label htmlFor="olevel-docs" style={{ cursor: "pointer", display: "block" }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666" }}>
                    PDF (Max 100MB)
                  </Typography>
                  {compressingField === "oLevelDocuments" ? (
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                      <CircularProgress size={20} sx={{ color: '#3e397b', mb: 3 }} />
                      <Typography variant="caption" sx={{ color: "#666" }}>Compressing image...</Typography>
                    </Box>
                  ) : (
                    <SavedFileChip file={formData.oLevelDocuments} url={formData.oLevelDocumentsUrl} fieldName="oLevelDocuments" setFormData={setFormData} />
                  )}
                </label>
              </Paper>
              {formErrors.oLevelDocuments && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#d32f2f",
                    fontWeight: 500,
                    display: "block",
                    mt: 1,
                    ml: 1,
                  }}
                >
                  {formErrors.oLevelDocuments}
                </Typography>
              )}
            </Paper>
        )}

        {/* A-Level Documents Section */}
        {formData.hasALevel && (
        <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <SchoolIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
              A-Level Documents
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
            Upload your A-Level examination results/certificates. You can upload multiple documents as a single PDF
            file.
          </Typography>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              border: formErrors.aLevelDocuments ? "2px dashed #d32f2f" : "2px dashed #5ba3f5",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "#f0f7ff", borderColor: "#3b82f6" },
            }}
          >
            <input
              type="file"
              name="aLevelDocuments"
              onChange={handleFileChange}
              accept=".pdf, .jpg, .png, .jpeg"
              style={{ display: "none" }}
              id="alevel-docs"
            />
            <label htmlFor="alevel-docs" style={{ cursor: "pointer", display: "block" }}>
              <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                PDF (Max 100MB)
              </Typography>
              {compressingField === "aLevelDocuments" ? (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#3e397b', mb: 3 }} />
                  <Typography variant="caption" sx={{ color: "#666" }}>Compressing image...</Typography>
                </Box>
              ) : (
                <SavedFileChip file={formData.aLevelDocuments} url={formData.aLevelDocumentsUrl} fieldName="aLevelDocuments" setFormData={setFormData} />
              )}
            </label>
          </Paper>
            {formErrors.aLevelDocuments && (
            <Typography
              variant="caption"
              sx={{
                color: "#d32f2f",
                fontWeight: 500,
                display: "block",
                mt: 1,
                ml: 1,
              }}
            >
              {formErrors.aLevelDocuments}
            </Typography>
          )}
        </Paper>
        )}

        {/* Other Institution Academic Documents Section */}
        {formData.additionalQualifications.length > 0 && (
        <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <CheckCircleIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
              Other Institution Academic Documents
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
            If you have any additional academic qualifications from other institutions (diplomas, certificates, degrees,
            etc.), upload them here. Optional.
          </Typography>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              border: formErrors.otherInstitutionDocuments ? "2px dashed #d32f2f" : "2px dashed #5ba3f5",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "#f0f7ff", borderColor: "#3b82f6" },
            }}
          >
            <input
              type="file"
              name="otherInstitutionDocuments"
              onChange={handleFileChange}
              accept=".pdf,.zip,.jpg,.png,.jpeg"
              style={{ display: "none" }}
              id="other-docs"
            />
            <label htmlFor="other-docs" style={{ cursor: "pointer", display: "block" }}>
              <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                PDF, ZIP, IMAGE (Max 100MB) - Optional
              </Typography>
              {compressingField === "otherInstitutionDocuments" ? (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#3e397b', mb: 3 }} />
                  <Typography variant="caption" sx={{ color: "#666" }}>Compressing image...</Typography>
                </Box>
              ) : (
                <SavedFileChip file={formData.otherInstitutionDocuments} url={formData.otherInstitutionDocumentsUrl} fieldName="otherInstitutionDocuments" setFormData={setFormData} />
              )}
            </label>
          </Paper>
           {formErrors.otherInstitutionDocuments && (
            <Typography
              variant="caption"
              sx={{
                color: "#d32f2f",
                fontWeight: 500,
                display: "block",
                mt: 1,
                ml: 1,
              }}
            >
              {formErrors.otherInstitutionDocuments}
            </Typography>
          )}
        </Paper>
        )}

        <Alert severity="warning" icon={<InfoIcon />}>
          <strong>Important:</strong> Ensure all documents are clear, legible, and in the correct format. Blurry or
          incomplete documents may result in application rejection.
        </Alert>
      </Box>
    </>
  )
}

export default Documents
