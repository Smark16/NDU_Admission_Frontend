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
  TextField,
  // LinearProgress,
} from "@mui/material";
import FileIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

interface DocumentsSectionProps {
  documents: any[];
  onUpdate?: () => void;
}

const DOCUMENT_TYPES = [
  "OLevel", "ALevel", "Passport", "National ID", "Birth Certificate",
  "Recommendation Letter", "Transcript", "Other"
];

export default function DocumentsSection({
  documents,
  onUpdate,
}: DocumentsSectionProps) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newDocumentType, setNewDocumentType] = useState("");
  const [newName, setNewName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  console.log('documents', documents)
  const handleOpenUpdate = (doc: any) => {
    setSelectedDoc(doc);
    setNewDocumentType(doc.document_type);
    setNewName(doc.name || "");
    setNewFile(null);
    setOpenUpdateModal(true);
  };

  const handleUpdateDocument = async () => {
    if (!selectedDoc || !newFile) {
      alert("Please select a new file to replace the current one.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", newFile);
    if (newDocumentType) formData.append("document_type", newDocumentType);
    if (newName) formData.append("name", newName);

    try {
      const res = await fetch(`/api/admissions/document/${selectedDoc.id}/update/`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        setOpenUpdateModal(false);
        onUpdate?.();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.detail || "Failed to update document");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Delete this document permanently?")) return;

    try {
      const res = await fetch(`/api/admissions/document/${docId}/`, {
        method: "DELETE",
      });

      if (res.ok) onUpdate?.();
      else alert("Failed to delete document");
    } catch (err) {
      alert("Network error");
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
      <CardHeader
        avatar={<FileIcon sx={{ color: "primary.main" }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Documents</Typography>}
      />
      <CardContent>
        {documents.length > 0 ? (
          <Stack spacing={2}>
            {documents.map((doc: any) => (
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
                    <Chip label={doc.document_type} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <IconButton color="primary" onClick={() => openInNewTab(doc.file_url || doc.file)}>
                      <OpenInNewIcon />
                    </IconButton>
                    <IconButton color="info" onClick={() => handleOpenUpdate(doc)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
            No documents uploaded yet
          </Typography>
        )}
      </CardContent>

      {/* Update / Replace Document Modal */}
      <Dialog open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Replace Document</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedDoc && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2">Current Document:</Typography>
              <Typography>{selectedDoc.name || selectedDoc.document_type}</Typography>
            </Box>
          )}

          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={newDocumentType}
                label="Document Type"
                onChange={(e) => setNewDocumentType(e.target.value)}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Document Name (Optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<FileIcon />}
            >
              {newFile ? newFile.name : "Choose New File"}
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateModal(false)} disabled={isUploading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateDocument}
            disabled={!newFile || isUploading}
          >
            {isUploading ? "Replacing..." : "Replace Document"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
