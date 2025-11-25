"use client"

import React, { useEffect, useState, type ChangeEvent } from "react"
import {
    Box,
    Container,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Chip,
    IconButton,
    Stack,
    Alert,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Card,
    CardContent,
    Snackbar,
} from "@mui/material"
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Book,
} from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"
import FileUpload from "./file_upload"

interface Subject {
    id: number
    name: string
    code: string
}

interface Program {
    id: number
    name: string
    code: string
    short_form:string
}

interface Template {
    id: number
    name: string
    file: File | null
    file_url: string
    programs: Program[]
    status: "active" | "inactive"
}

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`subject-tabpanel-${index}`}
            aria-labelledby={`subject-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    )
}

export default function SetUpPage() {
    const theme = useTheme()
    const AxiosInstance = useAxios()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    // State management
    const [tabValue, setTabValue] = useState(0)
    const [openDialog, setOpenDialog] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [successMessage, setSuccessMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Separate form states for clarity
    const [subjectForm, setSubjectForm] = useState({ name: "", code: "" })
    const [templateForm, setTemplateForm] = useState<{
        file: File | null;
        status: "active" | "inactive";
        programs: number[];
    }>({
        file: null,
        status: "active",
        programs: [],
    });

    // Mock data
    const [oLevelSubjects, setOLevelSubjects] = useState<Subject[]>([])

    const [aLevelSubjects, setALevelSubjects] = useState<Subject[]>([])

    const [templates, setTemplates] = useState<Template[]>([])

    const [deletingId, setDeletingId] = useState<number | null>(null);

    // fetch Olevel
    const fetchOlevel = async () => {
        try {
            setIsLoading(true)
            const response = await AxiosInstance.get('/api/admissions/list_olevel_subject')
            setOLevelSubjects(response.data)
            setIsLoading(false)
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: 'Failed to load Olevel subjects',
                severity: "error",
            });
            setIsLoading(false)
        }
    }

    // fetch Alevel
    const fetchAlevel = async () => {
        try {
            setIsLoading(true)
            const { data } = await AxiosInstance.get('/api/admissions/list_alevel_subject')
            setALevelSubjects(data)
            setIsLoading(false)
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: 'Failed to load Alevel subjects',
                severity: "error",
            });
            setIsLoading(false)
        }
    }

    // fetch templates
    const fetchTemplates = async () => {
        try {
            setIsLoading(true)
            const response = await AxiosInstance.get('/api/offer_letter/list_templates')
            setTemplates(response.data)
            setIsLoading(false)
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: 'Failed to load Admission Templates',
                severity: "error",
            });
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOlevel()
        fetchAlevel()
        fetchTemplates()
    }, [])

    // File change handler
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setTemplateForm((prev) => ({ ...prev, file }))
        }
    }

    // Dialog handlers
    const handleOpenDialog = (item?: Subject | Template) => {
        if (item) {
            setEditingId(item.id)
            if ("code" in item) {
                // It's a subject
                setSubjectForm({ name: item.name, code: item.code })
                setTemplateForm({ file: null, status: "active", programs: [] })
            } else {
                // It's a template
                setTemplateForm({
                    file: item.file,
                    status: item.status,
                    programs: item.programs.map((p) => p.id)
                })
                setSubjectForm({ name: "", code: "" })
            }
        } else {
            setEditingId(null)
            setSubjectForm({ name: "", code: "" })
            setTemplateForm({ file: null, status: "active", programs: [] })
        }
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setEditingId(null)
        setSubjectForm({ name: "", code: "" })
        setTemplateForm({ file: null, status: "active", programs: [] })
    }

    const handleSave = async () => {
        if (tabValue === 2) {
            setIsLoading(true)
            // Template logic
            const formData = new FormData()
            if (templateForm.file) formData.append("file", templateForm.file)
            formData.append("status", templateForm.status)
            templateForm.programs.forEach((id) => {
                formData.append("programs", id.toString());
            });

            try {
                if (editingId) {
                    const response = await AxiosInstance.put(`/api/offer_letter/edit_template/${editingId}`, formData)
                    if (response.status === 200 || response.status === 201) {
                        setIsLoading(false)
                        // Update (mock)
                        setTemplates((prev) =>
                            prev.map((t) =>
                                t.id === editingId
                                    ? {
                                        ...t,
                                        name: response.data.name,
                                        file: response.data.file,
                                        status: response.data.status,
                                    }
                                    : t
                            )
                        )
                        setSuccessMessage("Template updated successfully!")
                    }

                } else {
                    // Create via API
                    const response = await AxiosInstance.post("/api/offer_letter/upload_template", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    })

                    if (response.status === 200 || response.status === 201) {
                        setIsLoading(false)
                        setTemplates((prev) => [...prev, response.data])
                        setSuccessMessage("Template added successfully!")
                    }
                }
            } catch (error: any) {
                if (error.response?.data.detail) {
                    setSnackbar({
                        open: true,
                        message: `${error.response?.data.detail}`,
                        severity: "error",
                    });
                }else{
                    setSnackbar({
                        open: true,
                        message: 'Failed to upload Template, check connection',
                        severity: "error",
                    });

                }

                setIsLoading(false)
            }
        } else {
            // Subject logic
            if (!subjectForm.name || !subjectForm.code) return

            try {
                setIsLoading(true)
                const newSubject = { name: subjectForm.name, code: subjectForm.code }

                if (editingId) {
                    if (tabValue === 0) {
                        const response = await AxiosInstance.put(`/api/admissions/edit_olevel_subjects/${editingId}`, newSubject)
                        setIsLoading(false)
                        setOLevelSubjects((prev) =>
                            prev.map((s) => (s.id === editingId ? { ...s, ...response.data } : s))
                        )
                        setSuccessMessage("subject added successfully")
                    } else {
                        const response = await AxiosInstance.put(`/api/admissions/edit_alevel_results/${editingId}`, newSubject)
                        setIsLoading(false)
                        setALevelSubjects((prev) =>
                            prev.map((s) => (s.id === editingId ? { ...s, ...response.data } : s))
                        )
                    }
                    setSuccessMessage("Subject updated successfully!")
                } else {
                    const newSubject = { name: subjectForm.name, code: subjectForm.code }

                    if (tabValue === 0) {
                        const response = await AxiosInstance.post('/api/admissions/create_olevel_subjects', newSubject)
                        setIsLoading(false)
                        setOLevelSubjects((prev) => [...prev, response.data])
                    } else {
                        const response = await AxiosInstance.post('/api/admissions/create_alevel_subjects', newSubject)
                        setIsLoading(false)
                        setALevelSubjects((prev) => [...prev, response.data])
                    }
                    setSuccessMessage("Subject added successfully!")
                }
            } catch (err: any) {
                if (err.response?.data.detail) {
                    setSnackbar({
                        open: true,
                        message: `${err.response?.data.detail}`,
                        severity: "error",
                    });
                }else{
                    setSnackbar({
                        open: true,
                        message: 'An error has occured, check connection',
                        severity: "error",
                    });
                }
                setIsLoading(false)
            }
        }
        setTimeout(() => setSuccessMessage(""), 3000)
        handleCloseDialog()
    }

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            setIsLoading(true)
            if (tabValue === 0) {
                await AxiosInstance.delete(`/api/admissions/delete_olevel_subjects/${id}`)
                setIsLoading(false)
                setOLevelSubjects((prev) => prev.filter((s) => s.id !== id))
            } else if (tabValue === 1) {
                await AxiosInstance.delete(`/api/admissions/delete_alevel_subject/${id}`)
                setIsLoading(false)
                setALevelSubjects((prev) => prev.filter((s) => s.id !== id))
            } else {
                await AxiosInstance.delete(`/api/offer_letter/delete_template/${id}`)
                setIsLoading(false)
                setTemplates((prev) => prev.filter((t) => t.id !== id))
            }
            setSuccessMessage("Deleted successfully!")
            setTimeout(() => setSuccessMessage(""), 3000)
        } catch (err: any) {
            setIsLoading(false)
            if (err.response?.data.detail) {
                setSnackbar({
                    open: true,
                    message: `${err.response?.data.detail}`,
                    severity: "error",
                });
            }else{
                setSnackbar({
                    open: true,
                    message: 'Failed to delete',
                    severity: "error",
                });

            }
        }

    }

    const SubjectTable = ({ data }: { data: Subject[] }) => (
        <TableContainer component={Paper} sx={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(25, 118, 210, 0.08)" }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Subject Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", textAlign: "right" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Card variant="outlined" sx={{ border: "none", backgroundColor: "transparent" }}>
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            py: 8,
                                            textAlign: "center",
                                        }}
                                    >
                                        <Book sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No Subjects added Yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Start adding subjects to manage the system.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((subject) => (
                            <TableRow key={subject.id} hover>
                                <TableCell>{subject.id}</TableCell>
                                <TableCell>{subject.name}</TableCell>
                                <TableCell>
                                    <Chip label={subject.code} variant="outlined" size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(subject)} sx={{ mr: 1 }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(subject.id)}
                                        // disabled={deletingId === subject.id}
                                    >
                                        {deletingId === subject.id && isLoading ? (
                                            <CircularProgress size={20} color="error" />
                                        ) : (
                                            <DeleteIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )

    const TemplateTable = ({ data }: { data: Template[] }) => (
        <TableContainer component={Paper} sx={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(25, 118, 210, 0.08)" }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Template Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Mapped to</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>File</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", textAlign: "right" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((template) => (
                        <TableRow key={template.id} hover>
                            <TableCell>{template.id}</TableCell>
                            <TableCell>{template.name}</TableCell>
                            <TableCell>
                                {template.programs?.map(p => (
                                    p.short_form
                                )).join(", ")}
                            </TableCell>
                            <TableCell>
                                {template.file_url ? (
                                    <Typography
                                        component="a"
                                        href={template.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: "primary.main", textDecoration: "none", fontSize: "0.875rem" }}
                                    >
                                        View File
                                    </Typography>
                                ) : (
                                    <Typography color="text.secondary" fontSize="0.875rem">
                                        No file
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={template.status}
                                    color={template.status === "active" ? "success" : "default"}
                                    size="small"
                                    icon={template.status === "active" ? <CheckIcon /> : <CloseIcon />}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <IconButton size="small" color="primary" onClick={() => handleOpenDialog(template)} sx={{ mr: 1 }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(template.id)}
                                    // disabled={deletingId === template.id}
                                >
                                    {deletingId === template.id && isLoading ? (
                                        <CircularProgress size={20} color="error" />
                                    ) : (
                                        <DeleteIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Subjects & Templates Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage O-Level subjects, A-Level subjects, and admission letter templates
                </Typography>
            </Box>

            {/* Success Message */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
                    {successMessage}
                </Alert>
            )}

            {/* Tab Navigation */}
            <Paper sx={{ mb: 3, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons={isMobile ? "auto" : false}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontSize: "1rem",
                            fontWeight: 500,
                        },
                    }}
                >
                    <Tab label="O-Level Subjects" />
                    <Tab label="A-Level Subjects" />
                    <Tab label="Admission Templates" />
                </Tabs>
            </Paper>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
                <Stack spacing={2}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: "flex-start" }}>
                        Add O-Level Subject
                    </Button>
                    {isLoading && oLevelSubjects.length === 0 ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <SubjectTable data={oLevelSubjects} />
                    )}
                </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Stack spacing={2}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: "flex-start" }}>
                        Add A-Level Subject
                    </Button>
                    {isLoading && aLevelSubjects.length === 0 ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <SubjectTable data={aLevelSubjects} />
                    )}
                </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Stack spacing={2}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: "flex-start" }}>
                        Add Template
                    </Button>
                    {isLoading && templates.length === 0 ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TemplateTable data={templates} />
                    )}
                </Stack>
            </TabPanel>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {editingId
                        ? `Edit ${tabValue === 2 ? "Template" : "Subject"}`
                        : `Add New ${tabValue === 2 ? "Template" : "Subject"}`}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3}>
                        {tabValue !== 2 && (
                            <>
                                <TextField
                                    label="subject Name"
                                    value={subjectForm.name}
                                    onChange={(e) => setSubjectForm((prev) => ({ ...prev, name: e.target.value }))}
                                    fullWidth
                                    placeholder="e.g., Mathematics"
                                />

                                <TextField
                                    label="Subject Code"
                                    value={subjectForm.code}
                                    onChange={(e) => setSubjectForm((prev) => ({ ...prev, code: e.target.value }))}
                                    fullWidth
                                    placeholder="e.g., MTH405"
                                />

                            </>
                        )}

                        {tabValue === 2 && (
                            <>
                                {/* File Upload */}
                                <FileUpload
                                    handleFileChange={handleFileChange}
                                    templateForm={templateForm}
                                    setTemplateForm={setTemplateForm}
                                />
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        {isLoading ? (editingId ? "Updating..." : "Saving....") :
                            (editingId ? "Update" : "Save")}

                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}