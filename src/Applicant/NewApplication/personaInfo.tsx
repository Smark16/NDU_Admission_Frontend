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
} from "@mui/material"
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material"
import type { SelectChangeEvent } from "@mui/material/Select"
import ReactSelect from "react-select"
import countryList from "react-select-country-list"
import DateDropdownPicker from "../../ReUsables/DateDropdownPicker"

interface PersonalInfoProps {
  formData: {
    firstName: string
    lastName: string
    middleName: string
    dateOfBirth: string
    gender: string
    nationality: string
    nin?: string
    passportNumber?: string
    disabled?: string
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
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  formData,
  setFormData,
  handleInputChange,
  handleChange,
  formErrors
}) => {
  const options = useMemo(() => countryList().getData(), [])
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

  const selectedValue = options.find(option => option.label === formData.nationality) || null
  const LOCAL_COUNTRIES = ["Uganda"];

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
              label="First Name"
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
            <DateDropdownPicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(val) => handleInputChange({ target: { name: "dateOfBirth", value: val } } as any)}
              required
              error={!!formErrors.dateOfBirth}
              helperText={formErrors.dateOfBirth}
              maxYear={new Date().getFullYear() - 15}
              minYear={1940}
            />
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
            <FormControl fullWidth required error={!!formErrors.nationality}>
              <ReactSelect
                options={options}
                value={selectedValue}
                onChange={changeHandler}
                placeholder="Search country..."
                isClearable
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

          {selectedValue ? (LOCAL_COUNTRIES.includes(selectedValue?.label || "")
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Next of Kin Contact"
              name="nextOfKinContact"
              value={formData.nextOfKinContact}
              onChange={handleInputChange}
              error={!!formErrors.nextOfKinContact}
              helperText={formErrors.nextOfKinContact}
            />
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