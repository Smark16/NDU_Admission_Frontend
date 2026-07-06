// "use client"
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   Typography,
//   Grid,
//   Box,
//   Button,
//   Paper,
//   Stack,
//   useTheme,
//   useMediaQuery,
//   Chip,
// } from "@mui/material"
// import FileIcon from "@mui/icons-material/Description"
// // import DownloadIcon from "@mui/icons-material/Download"
// import OpenInNewIcon from "@mui/icons-material/OpenInNew"

// interface DocumentsSectionProps {
//   documents: any[]
// }

// export default function DocumentsSection({ documents }: DocumentsSectionProps) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

//   const openInNewTab = (url: string) => {
//     window.open(url, "_blank", "noopener,noreferrer")
//   }

//   return (
//     <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
//       <CardHeader
//         avatar={<FileIcon sx={{ color: "primary.main" }} />}
//         title={
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             Documents
//           </Typography>
//         }
//       />
//       <CardContent>
//         {documents.length > 0 ? (
//           <Grid container spacing={2}>
//             {documents.map((doc: any) => (
//               <Grid size={{xs:12, sm:6}} key={doc.id}>
//                 <Paper
//                   sx={{
//                     p: 2,
//                     border: "1px solid",
//                     borderColor: "divider",
//                     display: "flex",
//                     flexDirection: "column",
//                     height: "100%",
//                     "&:hover": {
//                       backgroundColor: "action.hover",
//                       borderColor: "primary.main",
//                     },
//                   }}
//                 >
//                   <Box sx={{ mb: 2, flex: 1 }}>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 1,
//                         mb: 1,
//                       }}
//                     >
//                       <FileIcon sx={{ color: "primary.main", fontSize: 20 }} />
//                       <Typography
//                         variant="subtitle2"
//                         sx={{
//                           fontWeight: 600,
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         {doc.name}
//                       </Typography>
//                     </Box>
//                     <Typography variant="caption" sx={{ color: "text.secondary" }}>
//                       {new Date(doc.uploaded_at).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "short",
//                         day: "numeric",
//                       })}
//                     </Typography>

//                     <Typography variant="h6">
//                       <Chip label={doc.document_type} size="small" />
//                     </Typography>
//                   </Box>

//                   <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ gap: 1 }}>
//                     <Button
//                       size="small"
//                       variant="contained"
//                       color="primary"
//                       startIcon={<OpenInNewIcon />}
//                       onClick={() => openInNewTab(`${import.meta.env.VITE_API_BASE_URL}${doc.file}`)}
//                       fullWidth={isMobile}
//                       sx={{ flex: 1 }}
//                     >
//                       View File
//                     </Button>
//                   </Stack>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         ) : (
//           <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
//             No documents uploaded yet
//           </Typography>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// "use client";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   Typography,
//   Box,
//   Button,
//   Paper,
//   Stack,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   TextField,
//   // LinearProgress,
// } from "@mui/material";
// import FileIcon from "@mui/icons-material/Description";
// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { useState } from "react";
// import useAxios from "../../AxiosInstance/UseAxios";

// interface DocumentsSectionProps {
//   documents: any[];
//   onUpdate?: () => void;
// }

// const DOCUMENT_TYPES = [
//   "OLevel", "ALevel", "Other Qualifications"
// ];

// export default function DocumentsSection({
//   documents,
//   onUpdate,
// }: DocumentsSectionProps) {
//   const AxiosInstance = useAxios()
//   const [openUpdateModal, setOpenUpdateModal] = useState(false);
//   const [selectedDoc, setSelectedDoc] = useState<any>(null);
//   const [newFile, setNewFile] = useState<File | null>(null);
//   const [newDocumentType, setNewDocumentType] = useState("");
//   const [newName, setNewName] = useState("");
//   const [isUploading, setIsUploading] = useState(false);

//   const handleOpenUpdate = (doc: any) => {
//     setSelectedDoc(doc);
//     setNewDocumentType(doc.document_type);
//     setNewName(doc.name || "");
//     setNewFile(null);
//     setOpenUpdateModal(true);
//   };

//   const handleUpdateDocument = async () => {
//     if (!selectedDoc || !newFile) {
//       alert("Please select a new file to replace the current one.");
//       return;
//     }

//     setIsUploading(true);

//     const formData = new FormData();
//     formData.append("file", newFile);
//     if (newDocumentType) formData.append("document_type", newDocumentType);
//     if (newName) formData.append("name", newFile.name);

//     try {
//       const res = await AxiosInstance.patch(`/api/admissions/document/${selectedDoc.id}/update/`, {formData});
//       setOpenUpdateModal(false);
//       onUpdate?.();

//     } catch (err) {
//       alert("Network error. Please try again.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleDelete = async (docId: number) => {
//     if (!confirm("Delete this document permanently?")) return;

//     try {
//       const res = await AxiosInstance.delete(`/api/admissions/document/${docId}/`);

//       if (res.ok) onUpdate?.();
//       else alert("Failed to delete document");
//     } catch (err) {
//       alert("Network error");
//     }
//   };

//   const openInNewTab = (url: string) => {
//     window.open(url, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
//       <CardHeader
//         avatar={<FileIcon sx={{ color: "primary.main" }} />}
//         title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Documents</Typography>}
//       />
//       <CardContent>
//         {documents.length > 0 ? (
//           <Stack spacing={2}>
//             {documents.map((doc: any) => (
//               <Paper
//                 key={doc.id}
//                 sx={{
//                   p: 2.5,
//                   border: "1px solid",
//                   borderColor: "divider",
//                   "&:hover": { borderColor: "primary.main", backgroundColor: "action.hover" },
//                 }}
//               >
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                   <FileIcon sx={{ color: "primary.main", fontSize: 32 }} />

//                   <Box sx={{ flexGrow: 1 }}>
//                     <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//                       {doc.name || "Untitled Document"}
//                     </Typography>
//                     <Chip label={doc.document_type} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
//                     <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
//                       Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
//                     </Typography>
//                   </Box>

//                   <Stack direction="row" spacing={1}>
//                     <IconButton color="primary" onClick={() => openInNewTab(`${import.meta.env.VITE_API_BASE_URL}${doc.file_url}`|| `${import.meta.env.VITE_API_BASE_URL}${doc.file}`)}>
//                       <OpenInNewIcon />
//                     </IconButton>
//                     <IconButton color="info" onClick={() => handleOpenUpdate(doc)}>
//                       <EditIcon />
//                     </IconButton>
//                     <IconButton color="error" onClick={() => handleDelete(doc.id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Stack>
//                 </Box>
//               </Paper>
//             ))}
//           </Stack>
//         ) : (
//           <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
//             No documents uploaded yet
//           </Typography>
//         )}
//       </CardContent>

//       {/* Update / Replace Document Modal */}
//       <Dialog open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Replace Document</DialogTitle>
//         <DialogContent sx={{ mt: 2 }}>
//           {selectedDoc && (
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle2">Current Document:</Typography>
//               <Typography>{selectedDoc.name || selectedDoc.document_type}</Typography>
//             </Box>
//           )}

//           <Stack spacing={3}>
//             <FormControl fullWidth>
//               <InputLabel>Document Type</InputLabel>
//               <Select
//                 value={newDocumentType}
//                 label="Document Type"
//                 onChange={(e) => setNewDocumentType(e.target.value)}
//               >
//                 {DOCUMENT_TYPES.map((type) => (
//                   <MenuItem key={type} value={type}>{type}</MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             <TextField
//               fullWidth
//               label="Document Name (Optional)"
//               value={newName}
//               onChange={(e) => setNewName(e.target.value)}
//             />

//             <Button
//               variant="outlined"
//               component="label"
//               fullWidth
//               startIcon={<FileIcon />}
//             >
//               {newFile ? newFile.name : "Choose New File"}
//               <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
//             </Button>
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenUpdateModal(false)} disabled={isUploading}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleUpdateDocument}
//             disabled={!newFile || isUploading}
//           >
//             {isUploading ? "Replacing..." : "Replace Document"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Card>
//   );
// }

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import FileIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState, useEffect } from "react";
import useAxios from "../../AxiosInstance/UseAxios";

interface DocumentsSectionProps {
  documents: DocumentItem[];
  application: ApplicationLike | null;
  onUpdate?: () => void | Promise<void>;
}

interface ApplicationLike {
  id?: number;
  status?: string;
}

interface DocumentItem {
  id: number;
  uploaded_at: string;
  file?: string | File | null;
  file_url?: string;
  name?: string;
  document_type?: string;
}

const DOCUMENT_TYPES = [
  "OLevel",
  "ALevel",
  "Other Qualifications",
];

export default function DocumentsSection({
  documents: initialDocuments,
  application,
  onUpdate,
}: DocumentsSectionProps) {
  const AxiosInstance = useAxios();

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments || []);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openReplaceModal, setOpenReplaceModal] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceType, setReplaceType] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Sync external changes
  useEffect(() => {
    setDocuments(initialDocuments || []);
  }, [initialDocuments]);

  const showToast = (message: string, severity: "success" | "error" = "success") => {
    setToast({ open: true, message, severity });
  };

  const errorDetail = (err: unknown, fallback: string) => {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof err.response === "object" &&
      err.response !== null &&
      "data" in err.response &&
      typeof err.response.data === "object" &&
      err.response.data !== null &&
      "detail" in err.response.data &&
      typeof err.response.data.detail === "string"
    ) {
      return err.response.data.detail;
    }
    return fallback;
  };

  const documentUrl = (doc: DocumentItem) => {
    const raw = typeof doc.file_url === "string"
      ? doc.file_url
      : typeof doc.file === "string"
        ? doc.file
        : "";
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `${import.meta.env.VITE_API_BASE_URL}${raw}`;
  };

  const handleOpenUpload = () => {
    setUploadFile(null);
    setUploadType("");
    setOpenUploadModal(true);
  };

  const handleOpenReplace = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setReplaceType(doc.document_type || "");
    setReplaceFile(null);
    setOpenReplaceModal(true);
  };

  // Upload New Document
  const handleUploadNew = async () => {
    if (!application?.id) {
      showToast("Application details are still loading. Please try again.", "error");
      return;
    }
    if (!uploadFile || !uploadType) {
      showToast("Please select a file and document type", "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("document_type", uploadType);

    try {
      const res = await AxiosInstance.post(`/api/admissions/upload_document/${application.id}/`, formData);
      
      setDocuments(prev => [res.data, ...prev]);
      
      setOpenUploadModal(false);
      showToast("Document uploaded successfully!", "success");
      await onUpdate?.();
    } catch (err: unknown) {
      showToast(errorDetail(err, "Failed to upload document"), "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Replace Document
  const handleReplaceDocument = async () => {
    if (!selectedDoc || !replaceFile) {
      showToast("Please select a new file", "error");
      return;
    }

    setIsReplacing(true);
    const formData = new FormData();
    formData.append("file", replaceFile);
    if (replaceType) formData.append("document_type", replaceType);

    try {
      const res = await AxiosInstance.patch(`/api/admissions/document/${selectedDoc.id}/update/`, formData);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDoc.id 
          ? res.data
          : doc
      ));

      setOpenReplaceModal(false);
      showToast("Document replaced successfully!", "success");
      await onUpdate?.();
    } catch (err: unknown) {
      showToast(errorDetail(err, "Failed to replace document"), "error");
    } finally {
      setIsReplacing(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Delete this document permanently?")) return;

    try {
      await AxiosInstance.delete(`/api/admissions/document/${docId}/`);
      
      // Immediate UI Update
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      
      showToast("Document deleted successfully", "success");
      await onUpdate?.();
    } catch {
      showToast("Failed to delete document", "error");
    }
  };

  const openInNewTab = (url: string) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<FileIcon sx={{ color: "primary.main" }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Documents</Typography>}
        action={
          application?.status?.toLowerCase() !== 'admitted' && (
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={handleOpenUpload}
            size="small"
          >
            Upload New
          </Button>
          )
        }
      />

      <CardContent>
        {documents.length > 0 ? (
          <Stack spacing={2}>
            {documents.map((doc) => (
              <Paper
                key={doc.id}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { borderColor: "primary.main", backgroundColor: "action.hover" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FileIcon sx={{ color: "primary.main", fontSize: 32 }} />

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {doc.name || "Untitled Document"}
                    </Typography>
                    <Chip 
                      label={doc.document_type} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mt: 0.5 }} 
                    />
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <IconButton color="primary" onClick={() => openInNewTab(documentUrl(doc))}>
                      <OpenInNewIcon />
                    </IconButton>

                    {application?.status?.toLowerCase() !== 'admitted' && (
                      <>
                    <IconButton color="info" onClick={() => handleOpenReplace(doc)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                      <DeleteIcon />
                    </IconButton>
                      </>
                    )}
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 8 }}>
            No documents uploaded yet
          </Typography>
        )}
      </CardContent>

      {/* Upload New Modal */}
      <Dialog open={openUploadModal} onClose={() => setOpenUploadModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Document Type *</InputLabel>
              <Select value={uploadType} label="Document Type *" onChange={(e) => setUploadType(e.target.value)}>
                {DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
              {uploadFile ? uploadFile.name : "Choose File *"}
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadModal(false)} disabled={isUploading}>Cancel</Button>
          <Button variant="contained" onClick={handleUploadNew} disabled={!uploadFile || !uploadType || isUploading}>
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Replace Document Modal */}
      <Dialog open={openReplaceModal} onClose={() => setOpenReplaceModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Replace Document</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedDoc && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2">Current Document:</Typography>
              <Typography>{selectedDoc.name || selectedDoc.document_type}</Typography>
            </Box>
          )}

          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select value={replaceType} label="Document Type" onChange={(e) => setReplaceType(e.target.value)}>
                {DOCUMENT_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>

            <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
              {replaceFile ? replaceFile.name : "Choose New File"}
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setReplaceFile(e.target.files?.[0] || null)} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplaceModal(false)} disabled={isReplacing}>Cancel</Button>
          <Button variant="contained" onClick={handleReplaceDocument} disabled={!replaceFile || isReplacing}>
            {isReplacing ? "Replacing..." : "Replace Document"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}