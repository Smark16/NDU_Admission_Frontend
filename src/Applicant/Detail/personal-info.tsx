// "use client"
// import type React from "react"
// import { Card, CardContent, CardHeader, Typography, Grid, Box } from "@mui/material"
// import PersonIcon from "@mui/icons-material/Person"
// import PhoneIcon from "@mui/icons-material/Phone"
// import EmailIcon from "@mui/icons-material/Email"
// // import { useTheme, useMediaQuery } from "@mui/material"

// interface PersonalInfoSectionProps {
//   application: any
// }

// export default function PersonalInfoSection({ application }: PersonalInfoSectionProps) {
// //   const theme = useTheme()
// //   const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

//   const InfoField = ({
//     label,
//     value,
//     icon,
//   }: {
//     label: string
//     value: string
//     icon?: React.ReactNode
//   }) => (
//     <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
//       {icon && (
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             color: "primary.main",
//             mt: 0.5,
//           }}
//         >
//           {icon}
//         </Box>
//       )}
//       <Box>
//         <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
//           {label}
//         </Typography>
//         <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
//           {value}
//         </Typography>
//       </Box>
//     </Box>
//   )

//   return (
//     <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
//       <CardHeader
//         avatar={<PersonIcon sx={{ color: "primary.main" }} />}
//         title={
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             Personal Information
//           </Typography>
//         }
//       />
//       <CardContent>
//         <Grid container spacing={{ xs: 2, md: 3 }}>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="Full Name" value={`${application?.first_name} ${application?.last_name}`} />
//           </Grid>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField
//               label="Date of Birth"
//               value={new Date(application?.date_of_birth).toLocaleDateString("en-US", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//               })}
//             />
//           </Grid>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="Gender" value={application?.gender} />
//           </Grid>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="Nationality" value={application?.nationality} />
//           </Grid>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="Phone" value={application?.phone} icon={<PhoneIcon sx={{ fontSize: 18 }} />} />
//           </Grid>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="Email" value={application?.email} icon={<EmailIcon sx={{ fontSize: 18 }} />} />
//           </Grid>
//           <Grid size={{xs:12}}>
//             <InfoField label="Address" value={application?.address} />
//           </Grid>
//         </Grid>
//       </CardContent>
//     </Card>
//   )
// }

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  // FormControl,
  // InputLabel,
  // Select,
  // MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import useAxios from "../../AxiosInstance/UseAxios";

interface PersonalInfoSectionProps {
  application: any;
  onUpdate?: () => void;
}

export default function PersonalInfoSection({ application, onUpdate }: PersonalInfoSectionProps) {
  const AxiosInstance = useAxios();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    title: "",
    last_name: "",
    middle_name: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    phone: "",
    email: "",
    address: "",
    nin: "",
    passport_number: "",
    disabled: "",
    next_of_kin_name: "",
    next_of_kin_contact: "",
    next_of_kin_relationship: "",
    has_olevel: false,
    olevel_school: "",
    olevel_year: "",
    olevel_index_number: "",
    has_alevel: false,
    alevel_school: "",
    alevel_year: "",
    alevel_index_number: "",
    alevel_combination: "",
  });

  // Sync application data into form
  useEffect(() => {
    if (application) {
      setFormData({
        first_name: application.first_name || "",
        title: application.title || "",
        last_name: application.last_name || "",
        middle_name: application.middle_name || "",
        date_of_birth: application.date_of_birth ? application.date_of_birth : "",
        gender: application.gender || "",
        nationality: application.nationality || "",
        phone: application.phone || "",
        email: application.email || "",
        address: application.address || "",
        nin: application.nin || "",
        passport_number: application.passport_number || "",
        disabled: application.disabled || "",
        next_of_kin_name: application.next_of_kin_name || "",
        next_of_kin_contact: application.next_of_kin_contact || "",
        next_of_kin_relationship: application.next_of_kin_relationship || "",
        has_olevel: application.has_olevel || false,
        olevel_school: application.olevel_school || "",
        olevel_year: application.olevel_year || "",
        olevel_index_number: application.olevel_index_number || "",
        has_alevel: application.has_alevel || false,
        alevel_school: application.alevel_school || "",
        alevel_year: application.alevel_year || "",
        alevel_index_number: application.alevel_index_number || "",
        alevel_combination: application.alevel_combination || "",
      });
    }
  }, [application]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await AxiosInstance.patch(`/api/admissions/personal-info/${application.id}/`, formData);
      setOpenEditModal(false);
      onUpdate?.();
      setTimeout(() => window.location.reload(), 200)
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to update information");
    } finally {
      setIsSaving(false);
    }
  };

  const InfoField = ({ label, value }: { label: string; value: any }) => (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<PersonIcon sx={{ color: "primary.main" }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>}
         action={
          application?.status?.toLowerCase() !== "admitted" && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditModal(true)}
              size="small"
            >
              Edit Information
            </Button>
          )
        }
      />
      <CardContent>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Full Name" value={`${application?.first_name} ${application?.middle_name} ${application?.last_name}`.trim()} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Date of Birth" value={application?.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Gender" value={application?.gender} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Nationality" value={application?.nationality} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Phone" value={application?.phone} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Email" value={application?.email} />
          </Grid>
          <Grid size={12}>
            <InfoField label="Address" value={application?.address} />
          </Grid>
        </Grid>
      </CardContent>

      {/* ====================== EDIT MODAL ====================== */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Personal Information</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Personal Bio */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="First Name" value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Middle Name" value={formData.middle_name} onChange={(e) => handleChange("middle_name", e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Last Name" value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
            </Grid>

            <Grid size={12}>
              <TextField fullWidth label="Address" multiline rows={2} value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
            </Grid>

            {/* Next of Kin */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>Next of Kin Information</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Next of Kin Name" value={formData.next_of_kin_name} onChange={(e) => handleChange("next_of_kin_name", e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Next of Kin Contact" value={formData.next_of_kin_contact} onChange={(e) => handleChange("next_of_kin_contact", e.target.value)} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Relationship" value={formData.next_of_kin_relationship} onChange={(e) => handleChange("next_of_kin_relationship", e.target.value)} />
            </Grid>

            {/* O-Level Section */}
            <Grid size={12}>
              <FormControlLabel
                control={<Checkbox checked={formData.has_olevel} onChange={(e) => handleChange("has_olevel", e.target.checked)} />}
                label="Has O-Level Results"
              />
            </Grid>
            {formData.has_olevel && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="O-Level School" value={formData.olevel_school} onChange={(e) => handleChange("olevel_school", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="O-Level Year" type="number" value={formData.olevel_year} onChange={(e) => handleChange("olevel_year", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="O-Level Index Number" value={formData.olevel_index_number} onChange={(e) => handleChange("olevel_index_number", e.target.value)} />
                </Grid>
              </>
            )}

            {/* A-Level Section */}
            <Grid size={12}>
              <FormControlLabel
                control={<Checkbox checked={formData.has_alevel} onChange={(e) => handleChange("has_alevel", e.target.checked)} />}
                label="Has A-Level Results"
              />
            </Grid>
            {formData.has_alevel && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="A-Level School" value={formData.alevel_school} onChange={(e) => handleChange("alevel_school", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="A-Level Year" type="number" value={formData.alevel_year} onChange={(e) => handleChange("alevel_year", e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="A-Level Index Number" value={formData.alevel_index_number} onChange={(e) => handleChange("alevel_index_number", e.target.value)} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="A-Level Combination" value={formData.alevel_combination} onChange={(e) => handleChange("alevel_combination", e.target.value)} />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)} disabled={isSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}