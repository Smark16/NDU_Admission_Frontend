import React, { useMemo, useState } from "react"
import {
  Box,
  TextField,
  Grid,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Divider,
  FormHelperText,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material"
import { CheckCircle as CheckCircleIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material"
import type { SelectChangeEvent } from "@mui/material/Select"
import ReactSelect from "react-select"
import countryList from "react-select-country-list"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import { isLocalCountryOption, isLocalNationality, type ApplicantCategory } from "../../constants/applicantCategory"

interface PersonalInfoProps {
  formData: {
    firstName: string
    lastName: string
    middleName: string
    dateOfBirth: string
    title: string;
    gender: string
    applicantCategory?: ApplicantCategory | ""
    nationality: string
    nin?: string
    passportNumber?: string
    disabled?: string
    isRefugee?: string
    refugeeStatusProof?: File | null
    refugeeStatusProofUrl?: string | null
    phone: number | string
    email: string
    address: string
    nextOfKinName: string
    nextOfKinContact: string
    nextOfKinRelationship: string
  }
  formErrors: Record<string, string>
  setFormData: React.Dispatch<React.SetStateAction<any>>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleChange: (event: SelectChangeEvent<string>) => void
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  isUploading?: boolean
  docType?: string | null
  compressingField?: string | null
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  formData,
  setFormData,
  handleInputChange,
  handleChange,
  formErrors,
  handleFileChange,
  isUploading = false,
  docType = null,
  compressingField = null,
}) => {
  const options = useMemo(() => countryList().getData(), [])
  const countryOptions = useMemo(() => {
    if (formData.applicantCategory === "local") {
      return options.filter(isLocalCountryOption)
    }
    return options
  }, [options, formData.applicantCategory])
  const [ninValidation, setNinValidation] = useState<{ message: string, color: 'success' | 'error' | undefined }>({ message: '', color: undefined });

  const isValidUgandaNIN = (nin: string): boolean => {
    const regex = /^[C][MF][A-Z0-9]{12}$/;
    return regex.test(nin.toUpperCase());
  };

  const changeHandler = (selectedOption: any) => {
    setFormData((prev: any) => ({
      ...prev,
      nationality: selectedOption ? selectedOption.label : "",
    }))
    setNinValidation({ message: '', color: undefined });
  }

  const handleApplicantCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as ApplicantCategory | ""
    setFormData((prev: any) => {
      const keepNationality =
        value === "local"
          ? isLocalNationality(prev.nationality)
          : value === "international"
            ? prev.nationality && !isLocalNationality(prev.nationality)
            : false
      return {
        ...prev,
        applicantCategory: value,
        nationality: keepNationality ? prev.nationality : "",
        nin: keepNationality ? prev.nin : "",
        passportNumber: keepNationality ? prev.passportNumber : "",
      }
    })
    setNinValidation({ message: '', color: undefined });
  }

  const selectedValue = countryOptions.find(option => option.label === formData.nationality) || null
  const UGANDA_ONLY = ["Uganda"];

  // Custom handler for NIN input to add real-time validation
  const handleNinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      nin: value,
    }));

    // Real-time validation only for Uganda
    if (formData.nationality === "Uganda" && value.trim()) {
      if (isValidUgandaNIN(value)) {
        setNinValidation({ message: 'Correct NIN', color: 'success' });
      } else {
        setNinValidation({ message: 'Invalid NIN (must be 14 characters starting with CM or CF)', color: 'error' });
      }
    } else {
      setNinValidation({ message: '', color: undefined });
    }
  };

  const handleRefugeeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    setFormData((prev: any) => ({
      ...prev,
      isRefugee: value,
      ...(value !== "yes"
        ? { refugeeStatusProof: null, refugeeStatusProofUrl: null }
        : {}),
    }))
  }

  const RefugeeProofChip = () => {
    if (formData.refugeeStatusProof) {
      return (
        <Chip
          label={formData.refugeeStatusProof.name}
          onDelete={() => setFormData((prev: any) => ({ ...prev, refugeeStatusProof: null }))}
          sx={{ mt: 2 }}
          color="primary"
        />
      )
    }
    if (formData.refugeeStatusProofUrl) {
      const filename = formData.refugeeStatusProofUrl.split("/").pop() || "document"
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label={`Saved: ${filename}`}
          onDelete={() => setFormData((prev: any) => ({ ...prev, refugeeStatusProofUrl: null }))}
          sx={{ mt: 2, bgcolor: "#e8f5e9", color: "#2e7d32", "& .MuiChip-deleteIcon": { color: "#2e7d32" } }}
        />
      )
    }
    return null
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Alert severity="success" icon={<CheckCircleIcon />}>
        <strong>Pre-filled from your account:</strong> First Name, Last Name, Email, and Phone are automatically filled
        from your profile.
      </Alert>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
          Basic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Surname Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              helperText="Pre-filled from profile"
              error={!!formErrors.firstName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              helperText="Pre-filled from profile"
              error={!!formErrors.lastName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
          Personal Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of Birth *"
                value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                onChange={(val) => handleInputChange({ target: { name: "dateOfBirth", value: val ? val.format("YYYY-MM-DD") : "" } } as any)}
                minDate={dayjs("1940-01-01")}
                maxDate={dayjs().subtract(15, "year")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.dateOfBirth,
                    helperText: formErrors.dateOfBirth,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required error={!!formErrors.title}>
              <InputLabel>Title</InputLabel>
              <Select
                name="title"
                value={formData.title}
                onChange={handleChange}
                label="Title"
              >
                <MenuItem value="Mr.">Mr</MenuItem>
                <MenuItem value="Ms.">Ms</MenuItem>
                <MenuItem value="Mrs.">Mrs</MenuItem>
              </Select>
              {formErrors.title && (
                <FormHelperText>{formErrors.title}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required error={!!formErrors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
              {formErrors.gender && (
                <FormHelperText>{formErrors.gender}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required error={!!formErrors.applicantCategory}>
              <InputLabel>Applicant type</InputLabel>
              <Select
                name="applicantCategory"
                value={formData.applicantCategory || ""}
                onChange={handleApplicantCategoryChange}
                label="Applicant type"
              >
                <MenuItem value="local">Local</MenuItem>
                <MenuItem value="international">International</MenuItem>
              </Select>
              <FormHelperText>
                Local: Uganda, Kenya, or Tanzania. International: all other countries.
              </FormHelperText>
              {formErrors.applicantCategory && (
                <FormHelperText error>{formErrors.applicantCategory}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required error={!!formErrors.nationality}>
              <InputLabel shrink sx={{ display: "none" }}>Country</InputLabel>
              <ReactSelect
                options={countryOptions}
                value={selectedValue}
                onChange={changeHandler}
                placeholder={formData.applicantCategory ? "Select country..." : "Select applicant type first"}
                isClearable
                isDisabled={!formData.applicantCategory}
                styles={{
                  control: (base) => ({
                    ...base,
                    height: 56,
                    minHeight: 56,
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              {formErrors.nationality && (
                <FormHelperText>{formErrors.nationality}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {selectedValue ? (UGANDA_ONLY.includes(selectedValue?.label || "")
            ? (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="NIN (National ID Number)"
                  name="nin"
                  value={formData.nin || ""}
                  onChange={handleNinChange}
                  error={!!formErrors.nin || ninValidation.color === 'error'}
                  helperText={formErrors.nin}
                />

                {/* Real-time validation message – separate component */}
                {formData.nationality === "Uganda" && ninValidation.message && (
                  <FormHelperText
                    sx={{
                      color: ninValidation.color === 'success' ? 'success.main' :
                        ninValidation.color === 'error' ? 'error.main' :
                          'text.secondary',
                      mt: 0.5,
                      fontSize: '0.875rem',
                    }}
                  >
                    {ninValidation.message}
                  </FormHelperText>
                )}
              </Grid>
            ) : (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="passport number"
                  name="passportNumber"
                  value={formData.passportNumber || ""}
                  onChange={handleInputChange}
                  error={!!formErrors.passportNumber}
                  helperText={formErrors.passportNumber}
                />
              </Grid>
            )) : null}

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required error={!!formErrors.disabled}>
              <InputLabel>Are you Disabled?</InputLabel>
              <Select
                name="disabled"
                value={formData.disabled || ""}
                onChange={handleChange}
                label="Disabled?"
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
              {formErrors.disabled && (
                <FormHelperText>{formErrors.disabled}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required error={!!formErrors.isRefugee}>
              <InputLabel>Are you a Refugee?</InputLabel>
              <Select
                name="isRefugee"
                value={formData.isRefugee || ""}
                onChange={handleRefugeeChange}
                label="Are you a Refugee?"
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
              {formErrors.isRefugee && (
                <FormHelperText>{formErrors.isRefugee}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {formData.isRefugee === "yes" && (
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#f8fbff",
                  border: formErrors.refugeeStatusProof ? "2px dashed #d32f2f" : "1px solid #e0eef7",
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#5ba3f5" }}>
                  Refugee Status Proof
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                  Upload official documentation confirming your refugee status (e.g. refugee ID, UNHCR letter, or equivalent). PDF or image formats accepted.
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    border: formErrors.refugeeStatusProof ? "2px dashed #d32f2f" : "2px dashed #5ba3f5",
                    borderRadius: 2,
                    cursor: handleFileChange ? "pointer" : "default",
                    transition: "all 0.3s",
                    "&:hover": handleFileChange ? { bgcolor: "#f0f7ff", borderColor: "#3b82f6" } : {},
                  }}
                >
                  <input
                    type="file"
                    name="refugeeStatusProof"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg,image/heic,application/pdf"
                    style={{ display: "none" }}
                    id="refugee-status-proof"
                    disabled={!handleFileChange || isUploading}
                  />
                  <label htmlFor="refugee-status-proof" style={{ cursor: handleFileChange ? "pointer" : "default", display: "block" }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Click to upload refugee status proof
                    </Typography>
                    {compressingField === "refugeeStatusProof" ? (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : docType === "refugeeStatusProof" && isUploading ? (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <RefugeeProofChip />
                    )}
                  </label>
                </Paper>
                {formErrors.refugeeStatusProof && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {formErrors.refugeeStatusProof}
                  </FormHelperText>
                )}
              </Paper>
            </Grid>
          )}

        </Grid>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
          Contact Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              helperText="Pre-filled from profile"
              error={!!formErrors.phone}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              helperText="Pre-filled from profile"
              error={!!formErrors.email}
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          multiline
          rows={3}
          error={!!formErrors.address}
          helperText={formErrors.address}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
          Next of Kin Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Next of Kin (Full Name)"
              name="nextOfKinName"
              value={formData.nextOfKinName}
              onChange={handleInputChange}
              error={!!formErrors.nextOfKinName}
              helperText={formErrors.nextOfKinName}
            />
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Next of Kin Contact"
              name="nextOfKinContact"
              value={formData.nextOfKinContact}
              onChange={handleInputChange}
              error={!!formErrors.nextOfKinContact}
              helperText={formErrors.nextOfKinContact}
            />
          </Grid> */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Next of Kin Contact"
              name="nextOfKinContact"
              value={formData.nextOfKinContact}
              onChange={handleInputChange}
              error={!!formErrors.nextOfKinContact}
              helperText={formErrors.nextOfKinContact}
              inputProps={{ maxLength: 25 }}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'right',
                mt: 0.5,
                color: formData.nextOfKinContact.length >= 25 ? 'error.main' : 'text.secondary'
              }}
            >
              {formData.nextOfKinContact.length}/25 characters
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required error={!!formErrors.nextOfKinRelationship}>
              <InputLabel>Relationship</InputLabel>
              <Select
                name="nextOfKinRelationship"
                value={formData.nextOfKinRelationship}
                onChange={handleChange}
                label="Relationship"
              >
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="sibling">Sibling</MenuItem>
                <MenuItem value="spouse">Spouse</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {formErrors.nextOfKinRelationship && (
                <FormHelperText>{formErrors.nextOfKinRelationship}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default PersonalInfo