import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
  InputAdornment,
  List,
  ListItem,
  Avatar,
  Divider,
  Card,
  CardContent,
  Stack,
  alpha,
} from "@mui/material"
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

interface Staff {
  id: number
  first_name?: string
  last_name?: string
  email: string
  phone: string | null
  role: string | null
  full_name?: string
  /** Present on lecturer objects from program API */
  name?: string
}

interface AssignLecturersDialogProps {
  open: boolean
  onClose: () => void
  courseUnitId: number
  courseUnitName: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const AssignLecturersDialog: React.FC<AssignLecturersDialogProps> = ({
  open,
  onClose,
  courseUnitId,
  courseUnitName,
  onSuccess,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [staff, setStaff] = useState<Staff[]>([])
  const [assignedLecturers, setAssignedLecturers] = useState<Staff[]>([])
  const [selectedLecturers, setSelectedLecturers] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch all staff
  useEffect(() => {
    if (open) {
      fetchStaff()
      fetchAssignedLecturers()
    }
  }, [open, courseUnitId])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get("/api/accounts/list_staff")
      const staffData = response.data.map((s: Staff) => ({
        ...s,
        full_name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
      }))
      setStaff(staffData)
    } catch (err: any) {
      console.error("Error fetching staff:", err)
      onError(err.response?.data?.detail || "Failed to load staff members")
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignedLecturers = async () => {
    try {
      const response = await AxiosInstance.get(
        `/api/program/course_unit/${courseUnitId}/lecturers`
      )
      const lecturers = response.data.lecturers.map((l: Staff) => ({
        ...l,
        full_name: l.name || `${l.first_name || ""} ${l.last_name || ""}`.trim() || l.email,
      }))
      setAssignedLecturers(lecturers)
      setSelectedLecturers(lecturers.map((l: Staff) => l.id))
    } catch (err: any) {
      console.error("Error fetching assigned lecturers:", err)
      // Not critical - just means no lecturers assigned yet
    }
  }

  const handleToggleLecturer = (lecturerId: number) => {
    setSelectedLecturers((prev) =>
      prev.includes(lecturerId)
        ? prev.filter((id) => id !== lecturerId)
        : [...prev, lecturerId]
    )
  }

  const handleRemoveLecturer = async (lecturerId: number) => {
    try {
      await AxiosInstance.post(
        `/api/program/course_unit/${courseUnitId}/remove_lecturer`,
        { lecturer_id: lecturerId }
      )
      setAssignedLecturers((prev) => prev.filter((l) => l.id !== lecturerId))
      setSelectedLecturers((prev) => prev.filter((id) => id !== lecturerId))
      onSuccess("Lecturer removed successfully")
    } catch (err: any) {
      onError(err.response?.data?.detail || "Failed to remove lecturer")
    }
  }

  const handleSave = async () => {
    if (selectedLecturers.length === 0) {
      onError("Please select at least one lecturer")
      return
    }

    setSaving(true)
    try {
      await AxiosInstance.post(
        `/api/program/course_unit/${courseUnitId}/assign_lecturers`,
        { lecturer_ids: selectedLecturers }
      )
      onSuccess(`Successfully assigned ${selectedLecturers.length} lecturer(s)`)
      fetchAssignedLecturers()
    } catch (err: any) {
      onError(err.response?.data?.detail || "Failed to assign lecturers")
    } finally {
      setSaving(false)
    }
  }

  // Filter staff based on search term
  const filteredStaff = staff.filter((s) => {
    const search = searchTerm.toLowerCase()
    return (
      s.full_name?.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.phone?.toLowerCase().includes(search) ||
      s.role?.toLowerCase().includes(search)
    )
  })

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
          color: "white",
          py: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SchoolIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Assign Lecturers
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
              {courseUnitName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, bgcolor: "#f8f9fa" }}>
        <Stack spacing={3}>
          {/* Assigned Lecturers Card */}
          {assignedLecturers.length > 0 && (
            <Card
              elevation={0}
              sx={{
                bgcolor: "white",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d2960" }}>
                    Currently Assigned ({assignedLecturers.length})
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {assignedLecturers.map((lecturer) => (
                    <Chip
                      key={lecturer.id}
                      label={lecturer.full_name || lecturer.email}
                      onDelete={() => handleRemoveLecturer(lecturer.id)}
                      deleteIcon={<CloseIcon />}
                      color="primary"
                      sx={{
                        bgcolor: alpha("#3e397b", 0.1),
                        color: "#3e397b",
                        fontWeight: 500,
                        "& .MuiChip-deleteIcon": {
                          color: "#3e397b",
                          "&:hover": { color: "#2d2960" },
                        },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Search Card */}
          <Card
            elevation={0}
            sx={{
              bgcolor: "white",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search staff by name, email, phone, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#3e397b" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#3e397b",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3e397b",
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Staff List Card */}
          <Card
            elevation={0}
            sx={{
              bgcolor: "white",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              maxHeight: 450,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 6 }}>
                <CircularProgress size={40} sx={{ color: "#3e397b" }} />
              </Box>
            ) : (
              <Box sx={{ overflow: "auto", maxHeight: 450 }}>
                {filteredStaff.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <PersonIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      No staff members found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {searchTerm ? "Try a different search term" : "No staff available"}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredStaff.map((member, index) => {
                      const isSelected = selectedLecturers.includes(member.id)
                      return (
                        <React.Fragment key={member.id}>
                          <ListItem
                            sx={{
                              py: 1.5,
                              px: 2,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              bgcolor: isSelected
                                ? alpha("#3e397b", 0.08)
                                : "transparent",
                              borderLeft: isSelected ? "3px solid #3e397b" : "3px solid transparent",
                              "&:hover": {
                                bgcolor: isSelected
                                  ? alpha("#3e397b", 0.12)
                                  : alpha("#3e397b", 0.04),
                              },
                            }}
                            onClick={() => handleToggleLecturer(member.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleLecturer(member.id)}
                              icon={<RadioButtonUncheckedIcon sx={{ color: "#999" }} />}
                              checkedIcon={<CheckCircleIcon sx={{ color: "#3e397b" }} />}
                              sx={{ mr: 1.5 }}
                            />
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: isSelected ? "#3e397b" : "#e0e0e0",
                                color: isSelected ? "white" : "#666",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                mr: 2,
                              }}
                            >
                              {(member.full_name || member.email)
                                .charAt(0)
                                .toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 600,
                                  color: isSelected ? "#3e397b" : "#2d2960",
                                  mb: 0.5,
                                }}
                              >
                                {member.full_name || member.email}
                              </Typography>
                              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                {member.email && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <EmailIcon sx={{ fontSize: 14, color: "#666" }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {member.email}
                                    </Typography>
                                  </Box>
                                )}
                                {member.phone && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <PhoneIcon sx={{ fontSize: 14, color: "#666" }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {member.phone}
                                    </Typography>
                                  </Box>
                                )}
                                {member.role && (
                                  <Chip
                                    label={member.role}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.7rem",
                                      bgcolor: alpha("#3e397b", 0.1),
                                      color: "#3e397b",
                                      fontWeight: 500,
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          </ListItem>
                          {index < filteredStaff.length - 1 && (
                            <Divider sx={{ mx: 2 }} />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </List>
                )}
              </Box>
            )}
          </Card>

          {/* Selection Summary */}
          {selectedLecturers.length > 0 && (
            <Alert
              severity="info"
              icon={<CheckCircleIcon />}
              sx={{
                borderRadius: 2,
                bgcolor: alpha("#2196f3", 0.1),
                color: "#1976d2",
                border: "1px solid",
                borderColor: alpha("#2196f3", 0.3),
                "& .MuiAlert-icon": {
                  color: "#1976d2",
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedLecturers.length} lecturer{selectedLecturers.length !== 1 ? "s" : ""} selected
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: "#f8f9fa",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#666",
            fontWeight: 500,
            "&:hover": {
              bgcolor: alpha("#666", 0.08),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || selectedLecturers.length === 0}
          startIcon={
            saving ? (
              <CircularProgress size={16} sx={{ color: "white" }} />
            ) : (
              <CheckCircleIcon />
            )
          }
          sx={{
            bgcolor: "#3e397b",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(62, 57, 123, 0.3)",
            "&:hover": {
              bgcolor: "#2d2960",
              boxShadow: "0 6px 16px rgba(62, 57, 123, 0.4)",
            },
            "&:disabled": {
              bgcolor: alpha("#3e397b", 0.5),
              color: "white",
            },
          }}
        >
          {saving ? "Assigning..." : `Assign ${selectedLecturers.length} Lecturer${selectedLecturers.length !== 1 ? "s" : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssignLecturersDialog

