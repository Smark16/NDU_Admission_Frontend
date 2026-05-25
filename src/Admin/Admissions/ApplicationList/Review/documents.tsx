// "use client";

// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   Typography,
//   Grid,
//   Paper,
//   Box,
//   Divider,
// } from "@mui/material";
// import { Description as DescriptionIcon } from "@mui/icons-material";
// import CustomButton from "../../../../ReUsables/custombutton";
// import { FileDownload as FileDownloadIcon, OpenInNew as OpenInNewIcon } from "@mui/icons-material";

// interface Document {
//   id?: number;
//   name: string;
//   document_type: string;
//   file: string;
//   uploaded_at: string;
// }

// interface DocumentsSectionProps {
//   documents: Document[];
//   onDownload: (url: string, filename: string, docId: number) => void;
//   docLoading: boolean;
//   selectedID: number | null;
// }

// const DocumentsSection: React.FC<DocumentsSectionProps> = ({
//   documents,
//   onDownload,
//   docLoading,
//   selectedID,
// }) => {
//   return (
//     <Card sx={{ mb: 3 }}>
//       <CardHeader
//         avatar={<DescriptionIcon />}
//         title="Documents"
//         titleTypographyProps={{ variant: "h6" }}
//       />
//       <Divider />
//       <CardContent>
//         {documents && documents.length > 0 ? (
//           <Grid container spacing={2}>
//             {documents.map((doc, index) => (
//               <Grid size={{ xs: 12, sm: 6 }} key={doc.id || index}>
//                 <Paper
//                   sx={{
//                     p: 2,
//                     border: "1px solid #e0e0e0",
//                     cursor: "pointer",
//                     "&:hover": { boxShadow: 2 },
//                   }}
//                 >
//                   <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
//                     <Box sx={{ flex: 1 }}>
//                       <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//                         {doc.name}
//                       </Typography>
//                       <Typography variant="caption" color="textSecondary">
//                         {new Date(doc.uploaded_at).toLocaleDateString()}
//                       </Typography>
//                       <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5 }}>
//                         {doc.document_type}
//                       </Typography>
//                     </Box>
//                   </Box>

//                   <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
//                     {/* View Document */}
//                     <a
//                       href={`${import.meta.env.VITE_API_BASE_URL}${doc.file}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style={{ textDecoration: "none" }}
//                     >
//                       <CustomButton
//                         variant="outlined"
//                         icon={<OpenInNewIcon />}
//                         text="View"
//                         sx={{
//                           borderColor: "#7c1519",
//                           color: "#7c1519",
//                         }}
//                       />
//                     </a>

//                     {/* Download Document */}
//                     <CustomButton
//                       variant="outlined"
//                       icon={<FileDownloadIcon />}
//                       onClick={() =>
//                         onDownload(
//                           `${import.meta.env.VITE_API_BASE_URL}${doc.file}`,
//                           doc.name,
//                           doc?.id || 0
//                         )
//                       }
//                       text={
//                         selectedID === doc?.id && docLoading
//                           ? "Downloading..."
//                           : "Download"
//                       }
//                       sx={{
//                         borderColor: "#7c1519",
//                         color: "#7c1519",
//                       }}
//                     />
//                   </Box>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         ) : (
//           <Typography color="textSecondary" align="center" py={4}>
//             No documents uploaded
//           </Typography>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default DocumentsSection;

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Paper,
  Stack,
  Chip,
  IconButton,
  Button,
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
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import useAxios from "../../../../AxiosInstance/UseAxios";

interface DocumentsSectionProps {
  documents: any[];
  application: any;
  onUpdate?: () => void;
}

const DOCUMENT_TYPES = ["OLevel", "ALevel", "Other Qualifications"];

export default function DocumentsSection({
  documents: initialDocuments,
  application,
  onUpdate,
}: DocumentsSectionProps) {
  const AxiosInstance = useAxios();

  const [documents, setDocuments] = useState<any[]>(initialDocuments || []);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openReplaceModal, setOpenReplaceModal] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceType, setReplaceType] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Sync documents
  useEffect(() => {
    setDocuments(initialDocuments || []);
  }, [initialDocuments]);

  const showToast = (message: string, severity: "success" | "error" = "success") => {
    setToast({ open: true, message, severity });
  };

  const openInNewTab = (url: string) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadDocument = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload New Document
  const handleUploadNew = async () => {
    if (!uploadFile || !uploadType) {
      showToast("Please select a file and document type", "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("document_type", uploadType);

    try {
      const res = await AxiosInstance.post(
        `/api/admissions/upload_document/${application.id}/`,
        formData
      );
      setDocuments((prev) => [res.data, ...prev]);
      setOpenUploadModal(false);
      showToast("Document uploaded successfully!", "success");
      onUpdate?.();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to upload document", "error");
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
      await AxiosInstance.patch(
        `/api/admissions/document/${selectedDoc.id}/update/`,
        formData
      );

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id
            ? { ...doc, name: replaceFile.name, document_type: replaceType || doc.document_type }
            : doc
        )
      );

      setOpenReplaceModal(false);
      showToast("Document replaced successfully!", "success");
      onUpdate?.();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to replace document", "error");
    } finally {
      setIsReplacing(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await AxiosInstance.delete(`/api/admissions/document/${docId}/`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      showToast("Document deleted successfully", "success");
      onUpdate?.();
    } catch (err) {
      showToast("Failed to delete document", "error");
    }
  };

  const handleOpenReplace = (doc: any) => {
    setSelectedDoc(doc);
    setReplaceType(doc.document_type || "");
    setReplaceFile(null);
    setOpenReplaceModal(true);
  };

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<FileIcon sx={{ color: "primary.main" }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Documents</Typography>}
        action={
          application?.status?.toLowerCase() !== "admitted" && (
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => setOpenUploadModal(true)}
              size="small"
            >
              Upload New
            </Button>
          )
        }
      />

      <CardContent>
        {documents.length > 0 ? (
          <Grid container spacing={2.5}>
            {documents.map((doc: any) => (
              <Grid size={{ xs: 12, sm: 6 }} key={doc.id}>
                <Paper
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    },
                    mt:1
                  }}
                >
                  <Box sx={{ display: "block", alignItems: "flex-start", gap: 2.5 }}>
                    {/* Left Icon */}
                    <Box sx={{ pt: 0.5 }}>
                      <FileIcon sx={{ color: "primary.main", fontSize: 42 }} />
                    </Box>

                    {/* Middle Content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
                        {doc.name || "Untitled Document"}
                      </Typography>

                      <Chip
                        label={doc.document_type}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />

                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Right Action Buttons */}
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() =>
                          openInNewTab(`${import.meta.env.VITE_API_BASE_URL}${doc.file || doc.file_url}`)
                        }
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() =>
                          downloadDocument(
                            `${import.meta.env.VITE_API_BASE_URL}${doc.file || doc.file_url}`,
                            doc.name || "document.pdf"
                          )
                        }
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>

                      {application?.status?.toLowerCase() !== "admitted" && (
                        <>
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleOpenReplace(doc)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center", py: 8 }}
          >
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
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadModal(false)} disabled={isUploading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadNew}
            disabled={!uploadFile || !uploadType || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
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
                {DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
              {replaceFile ? replaceFile.name : "Choose New File"}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
              />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplaceModal(false)} disabled={isReplacing}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReplaceDocument}
            disabled={!replaceFile || isReplacing}
          >
            {isReplacing ? "Replacing..." : "Replace Document"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}