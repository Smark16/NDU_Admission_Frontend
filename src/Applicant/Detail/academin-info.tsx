"use client";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import ProgramChoiceAutocomplete from "../../ReUsables/ProgramChoiceAutocomplete";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Card, CardContent, CardHeader, Grid, Box, Chip } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import useAxios from "../../AxiosInstance/UseAxios";

interface AcademicInfoSectionProps {
  application: any;
  program_choices: any
}

export default function AcademicInfoSection({ application, program_choices }: AcademicInfoSectionProps) {
  const [openChangeProgramme, setOpenChangeProgramme] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  const [selectedCampus, setSelectedCampus] = useState<number | "">("")
  const [campusOptions, setCampusOptions] = useState<Array<{ id: number; name: string }>>([])
  const [programOptions, setProgramOptions] = useState<Array<{ id: number; name: string; code?: string; campus_ids: number[] }>>([])
  const [changeNote, setChangeNote] = useState("")
  const [changingProgramme, setChangingProgramme] = useState(false)
  const location = useLocation()
  const AxiosInstance = useAxios()
  // const returnTo = (location.state as any)?.returnTo || "/admin/application_list"
  const locationWarning = (location.state as any)?.warning || null

  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(
    locationWarning && (application?.status || "").toLowerCase() !== "accepted"
      ? { message: locationWarning, type: "error" }
      : null
  )

  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const InfoField = ({ label, value }: { label: string; value: any }) => (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
        {value || "Not Provided"}
      </Typography>
    </Box>
  );

  const hasOLevel = application?.has_olevel || false;
  const hasALevel = application?.has_alevel || false;

  const handleChangeProgramme = async () => {
    if (selectedPrograms.length === 0) return
    setChangingProgramme(true)
    try {
      const res = await AxiosInstance.patch(`/api/admissions/applicant_change_programme/${application.id}`, {
        program_ids: selectedPrograms,
        campus_id: selectedCampus || undefined,
        note: changeNote,
      })
      showNotification(res.data.detail, "success")
      setOpenChangeProgramme(false)
      setTimeout(() => window.location.reload(), 800)
    } catch (err: any) {
      showNotification(err?.response?.data?.detail || "Failed to change programme", "error")
    } finally {
      setChangingProgramme(false)
    }
  }

  useEffect(() => {
    if (!openChangeProgramme) return
    const loadOptions = async () => {
      try {
        const [campusRes, programRes] = await Promise.all([
          AxiosInstance.get("/api/accounts/list_campus"),
          AxiosInstance.get("/api/program/list_programs"),
        ])
        setCampusOptions(Array.isArray(campusRes.data) ? campusRes.data : [])

        const normalizedPrograms = (Array.isArray(programRes.data) ? programRes.data : []).map((p: any) => ({
          id: Number(p.id),
          name: p.name,
          code: p.code,
          campus_ids: Array.isArray(p.campuses)
            ? p.campuses.map((c: any) => Number(typeof c === "object" ? c.id : c)).filter((x: number) => Number.isFinite(x))
            : [],
        }))
        setProgramOptions(normalizedPrograms)
      } catch {
        showNotification("Failed to load campus/program options.", "error")
      }
    }
    loadOptions()
  }, [openChangeProgramme])

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 3 }}
        >
          {notification.message}
        </Alert>
      )}

      <CardHeader
        avatar={<SchoolIcon sx={{ color: "primary.main" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Academic Information
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={{ xs: 2, md: 3 }}>

          {/* Program Choices */}
          {program_choices && program_choices.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
                Program Choice(s)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {program_choices.map((p: any) => (
                  <Chip
                    key={p.id}
                    label={`${p.choice_order}. ${p.program_name}`}
                    size="small"
                    sx={{ backgroundColor: "#0D0060", color: "#fff", fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Grid>
          )}

         {application?.status !== 'Admitted' && (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<SwapHorizIcon />}
            onClick={() => {
              setSelectedPrograms(application.programs?.map((p: any) => p.id) || [])
              setSelectedCampus(application.campus_id || application?.campus?.id || "")
              setChangeNote("")
              setOpenChangeProgramme(true)
            }}
            sx={{ textTransform: "none", borderColor: "#0D0060", color: "#0D0060" }}
          >
            Change Programme
          </Button>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Batch" value={application?.batch?.name || application?.batch || "To be assigned"} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoField label="Campus" value={application?.campus?.name || application?.campus || "To be assigned"} />
          </Grid>

          {/* O-Level Information */}
          {hasOLevel && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="O-Level School" value={application?.olevel_school} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="O-Level Year" value={application?.olevel_year} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="O-Level Index Number" value={application?.olevel_index_number} />
              </Grid>
            </>
          )}

          {/* A-Level Information */}
          {hasALevel && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="A-Level School" value={application?.alevel_school} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="A-Level Year" value={application?.alevel_year} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="A-Level Index Number" value={application?.alevel_index_number} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="A-Level Combination" value={application?.alevel_combination} />
              </Grid>
            </>
          )}

          {/* Additional Qualifications */}
          {application?.additionals && application.additionals.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
                Additional Qualifications
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {application.additionals.map((qual: any, index: number) => (
                  <Box key={index} sx={{ pl: 2, borderLeft: "3px solid #3e397b" }}>
                    <Typography variant="body2">
                      <strong>{qual.additional_qualification_institution}</strong> — {qual.additional_qualification_type}
                      {qual.additional_qualification_year && ` (${qual.additional_qualification_year})`}
                    </Typography>
                    {qual.class_of_award && (
                      <Typography variant="caption" color="text.secondary">
                        Class: {qual.class_of_award}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>
          )}

          {/* Fallback if no academic info */}
          {!hasOLevel && !hasALevel && (!application?.additionals || application.additionals.length === 0) && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No academic qualification details provided.
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>

      {/* === CHANGE PROGRAMME DIALOG === */}
      <Dialog open={openChangeProgramme} onClose={() => setOpenChangeProgramme(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "#0D0060", color: "#fff" }}>
          Change Programme — {application?.first_name} {application?.last_name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Change campus and/or programme(s). Current values are pre-filled.
          </Typography>

          {/* Campus selector */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Campus</InputLabel>
            <Select
              value={selectedCampus}
              label="Campus"
              onChange={(e) => {
                setSelectedCampus(e.target.value as number)
                setSelectedPrograms([])
              }}
            >
              {campusOptions.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block" }}>
            Search and select up to 3 programmes at the selected campus:
          </Typography>
          <ProgramChoiceAutocomplete
            options={programOptions}
            selectedCampus={selectedCampus}
            valueIds={selectedPrograms}
            onChange={setSelectedPrograms}
            maxSelections={3}
            disabled={changingProgramme}
          />

          <TextField
            fullWidth
            size="small"
            label="Reason / Note (optional)"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangeProgramme(false)} disabled={changingProgramme}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleChangeProgramme}
            disabled={changingProgramme || selectedPrograms.length === 0}
            sx={{ bgcolor: "#0D0060" }}
          >
            {changingProgramme ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
