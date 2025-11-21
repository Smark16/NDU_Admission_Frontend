// PersonalInfo.tsx
import React, { useMemo } from "react"
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
} from "@mui/material"
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material"
import type { SelectChangeEvent } from "@mui/material/Select"
import ReactSelect from "react-select" 
import countryList from "react-select-country-list"

interface PersonalInfoProps {
  formData: {
    firstName: string
    lastName: string
    middleName: string
    dateOfBirth: string
    gender: string
    nationality: string
    phone: number | string
    email: string
    address: string
    nextOfKinName: string
    nextOfKinContact: string
    nextOfKinRelationship: string
  }
  setFormData: React.Dispatch<React.SetStateAction<any>> // ← Correct type
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleChange: (event: SelectChangeEvent<string>) => void
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  formData,
  setFormData,
  handleInputChange,
  handleChange,
}) => {
  const options = useMemo(() => countryList().getData(), [])

  // Fix: react-select expects { value, label }
  const changeHandler = (selectedOption: any) => {
    setFormData((prev: any) => ({
      ...prev,
      nationality: selectedOption ? selectedOption.label : "",
    }))
  }

  const selectedValue = options.find(option => option.label === formData.nationality) || null

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
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required>
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
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth required>
              {/* <InputLabel>Nationality</InputLabel> */}
              <ReactSelect
                options={options}
                value={selectedValue}
                onChange={changeHandler}
                placeholder="Search nationality..."
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    height: 56,
                    minHeight: 56,
                  }),
                }}
              />
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
          required
          multiline
          rows={3}
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
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Next of Kin Contact"
              name="nextOfKinContact"
              value={formData.nextOfKinContact}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
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
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default PersonalInfo