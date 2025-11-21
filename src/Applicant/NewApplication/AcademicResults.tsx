import React, { useEffect, useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import {
  School as SchoolIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import type { SelectChangeEvent } from '@mui/material/Select';
import useAxios from '../../AxiosInstance/UseAxios';

interface oLevelSubjects {
  id:number;
  name:string;
}

interface aLevelSubjects{
 id:number;
 name:string;
}
 
interface SubjectResult {
  id: string
  subject: string
  grade: string
}

interface FormData {
  oLevelYear: string
  oLevelIndexNumber: string
  oLevelSchool: string
  oLevelSubjects: SubjectResult[]
  aLevelYear: string
  aLevelIndexNumber: string
  aLevelSchool: string
  aLevelSubjects: SubjectResult[]
  alevel_combination:string
  additionalQualificationInstitution: string
  additionalQualificationType: string
  additionalQualificationYear: string
  class_of_award: string
  passportPhoto: File | null
  oLevelDocuments: File | null
  aLevelDocuments: File | null
  otherInstitutionDocuments: File | null
}

interface AcademicResultsProps {
     formData: FormData;
     handleOLevelSubjectChange:(id: string, field: string, value: string) => void;
    addALevelSubject:()=>void;
     addOLevelSubject: ()=>void;
     removeOLevelSubject: (id: string) => void;
     handleALevelSubjectChange: (id: string, field: string, value: string) => void;
     removeALevelSubject: (id: string) => void
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChange: (event: SelectChangeEvent<string>)=>void;
}

const AcademicResults: React.FC<AcademicResultsProps> = ({
     formData,
     handleOLevelSubjectChange,
     addOLevelSubject,
     addALevelSubject,
      handleChange,
    handleInputChange,
     removeOLevelSubject,
     handleALevelSubjectChange,
     removeALevelSubject
}) => {
const AxiosInstance = useAxios()

const oLevelGrades = ["D1", "D2", "C3", "C4", "C5", "C6", "P7", "P8", "F9"]
const aLevelGrades = ["A", "B", "C", "D", "E", "O"]

const [olevelSubjectList, setOlevelSubjectList] = useState<oLevelSubjects[]>([])
const [alevelSubjectList, setAlevelSubjectList] = useState<aLevelSubjects[]>([])

// olevel subjects
const fetchOlevelSubjects = async ()=>{
  try{
   const response = await AxiosInstance.get('/api/admissions/list_olevel_subject')
   setOlevelSubjectList(response.data)
   console.log('olevel', response.data)
  }catch(err){
    console.log(err)
  }
}

// a level subjects
const fetchAlevelSubjects = async ()=>{
  try{
   const response = await AxiosInstance.get('/api/admissions/list_alevel_subject')
   setAlevelSubjectList(response.data)
   console.log('alevel', response.data)
  }catch(err){
    console.log(err)
  }
}

useEffect(()=>{
  const loadAll = async()=>{
    await Promise.all([fetchOlevelSubjects(), fetchAlevelSubjects()])
  }
  loadAll()
}, [])

  return (
   <>
   <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
         {/* O-Level Section */}
         <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
           <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
             <BookIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
             <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
               O-Level Details
             </Typography>
           </Box>
   
           <Grid container spacing={2} sx={{ mb: 3 }}>
             <Grid size={{xs:12, sm:6, md:4}}>
               <TextField
                 fullWidth
                 label="Year of Sitting"
                 name="oLevelYear"
                 type="number"
                 value={formData.oLevelYear}
                 onChange={handleInputChange}
                 required
                 variant="outlined"
                 inputProps={{ min: 1990, max: new Date().getFullYear() }}
               />
             </Grid>
             <Grid size={{xs:12, sm:6, md:4}}>
               <TextField
                 fullWidth
                 label="Index/Center Number"
                 name="oLevelIndexNumber"
                 value={formData.oLevelIndexNumber}
                 onChange={handleInputChange}
                 required
                 variant="outlined"
               />
             </Grid>
             <Grid size={{xs:12, sm:6, md:4}}>
               <TextField
                 fullWidth
                 label="School Name"
                 name="oLevelSchool"
                 value={formData.oLevelSchool}
                 onChange={handleInputChange}
                 required
                 variant="outlined"
               />
             </Grid>
           </Grid>
   
           <Divider sx={{ my: 2 }} />
   
           <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
             Subject Results (Minimum 6 subjects required, Maximum 10)
           </Typography>
   
           <TableContainer sx={{ mb: 2 }}>
             <Table size="small">
               <TableHead>
                 <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                   <TableCell sx={{ fontWeight: 600, color: "#1a3a52" }}>Subject</TableCell>
                   <TableCell sx={{ fontWeight: 600, color: "#1a3a52" }}>Grade</TableCell>
                   <TableCell align="center" sx={{ fontWeight: 600, color: "#1a3a52" }}>
                     Action
                   </TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {formData.oLevelSubjects.map((subject) => (
                   <TableRow key={subject.id} sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}>
                     <TableCell>
                       <FormControl fullWidth size="small">
                         <Select
                           value={subject.subject}
                           onChange={(e) => handleOLevelSubjectChange(subject.id, "subject", e.target.value as string)}
                           required
                         >
                           <MenuItem value="">Select Subject</MenuItem>
                           {olevelSubjectList.map((subj) => (
                             <MenuItem key={subj.id} value={subj.id}>
                               {subj.name}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                     </TableCell>
                     <TableCell>
                       <FormControl fullWidth size="small">
                         <Select
                           value={subject.grade}
                           onChange={(e) => handleOLevelSubjectChange(subject.id, "grade", e.target.value as string)}
                           required
                         >
                           <MenuItem value="">Select Grade</MenuItem>
                           {oLevelGrades.map((grade) => (
                             <MenuItem key={grade} value={grade}>
                               {grade}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                     </TableCell>
                     <TableCell align="center">
                       <IconButton
                         size="small"
                         onClick={() => removeOLevelSubject(subject.id)}
                         disabled={formData.oLevelSubjects.length <= 1}
                         color="error"
                       >
                         <DeleteIcon fontSize="small" />
                       </IconButton>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
   
           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <Button
               startIcon={<AddIcon />}
               onClick={addOLevelSubject}
               disabled={formData.oLevelSubjects.length >= 10}
               variant="outlined"
               size="small"
               sx={{ color: "#5ba3f5", borderColor: "#5ba3f5" }}
             >
               Add Subject
             </Button>
             <Typography variant="caption" sx={{ color: "#666" }}>
               {formData.oLevelSubjects.length}/10 subjects added
             </Typography>
           </Box>
         </Paper>
   
         {/* A-Level Section */}
         <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
           <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
             <SchoolIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
             <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
               A-Level Details
             </Typography>
           </Box>
   
           <Grid container spacing={2} sx={{ mb: 3 }}>
             <Grid size={{xs:12, sm:6, md:2 }}>
               <TextField
                 fullWidth
                 label="Year of Sitting"
                 name="aLevelYear"
                 type="number"
                 value={formData.aLevelYear}
                 onChange={handleInputChange}
                 variant="outlined"
                 inputProps={{ min: 1990, max: new Date().getFullYear() }}
               />
             </Grid>
             <Grid size={{xs:12, sm:6, md:4 }}>
               <TextField
                 fullWidth
                 label="Index/Center Number"
                 name="aLevelIndexNumber"
                 value={formData.aLevelIndexNumber}
                 onChange={handleInputChange}
                 variant="outlined"
               />
             </Grid>
             <Grid size={{xs:12, sm:6, md:4 }}>
               <TextField
                 fullWidth
                 label="School Name"
                 name="aLevelSchool"
                 value={formData.aLevelSchool}
                 onChange={handleInputChange}
                 variant="outlined"
               />
             </Grid>

               <Grid size={{xs:12, sm:6, md:2 }}>
               <TextField
                 fullWidth
                 label="Alevel Combination"
                 name="alevel_combination"
                 placeholder='e.g PCM, HEG'
                 value={formData.alevel_combination}
                 onChange={handleInputChange}
                 variant="outlined"
               />
             </Grid>
           </Grid>
   
           <Divider sx={{ my: 2 }} />
   
           <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
             Subject Results (Minimum 2 subjects, Maximum 5)
           </Typography>
   
           <TableContainer sx={{ mb: 2 }}>
             <Table size="small">
               <TableHead>
                 <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                   <TableCell sx={{ fontWeight: 600, color: "#1a3a52" }}>Subject</TableCell>
                   <TableCell sx={{ fontWeight: 600, color: "#1a3a52" }}>Grade</TableCell>
                   <TableCell align="center" sx={{ fontWeight: 600, color: "#1a3a52" }}>
                     Action
                   </TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {formData.aLevelSubjects.map((subject) => (
                   <TableRow key={subject.id} sx={{ "&:hover": { bgcolor: "#f5f5f5" } }}>
                     <TableCell>
                       <FormControl fullWidth size="small">
                         <Select
                           value={subject.subject}
                           onChange={(e) => handleALevelSubjectChange(subject.id, "subject", e.target.value as string)}
                         >
                           <MenuItem value="">Select Subject</MenuItem>
                           {alevelSubjectList.map((subj) => (
                             <MenuItem key={subj.id} value={subj.id}>
                               {subj.name}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                     </TableCell>
                     <TableCell>
                       <FormControl fullWidth size="small">
                         <Select
                           value={subject.grade}
                           onChange={(e) => handleALevelSubjectChange(subject.id, "grade", e.target.value as string)}
                         >
                           <MenuItem value="">Select Grade</MenuItem>
                           {aLevelGrades.map((grade) => (
                             <MenuItem key={grade} value={grade}>
                               {grade}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                     </TableCell>
                     <TableCell align="center">
                       <IconButton
                         size="small"
                         onClick={() => removeALevelSubject(subject.id)}
                         disabled={formData.aLevelSubjects.length <= 1}
                         color="error"
                       >
                         <DeleteIcon fontSize="small" />
                       </IconButton>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
   
           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <Button
               startIcon={<AddIcon />}
               onClick={addALevelSubject}
               disabled={formData.aLevelSubjects.length >= 5}
               variant="outlined"
               size="small"
               sx={{ color: "#5ba3f5", borderColor: "#5ba3f5" }}
             >
               Add Subject
             </Button>
             <Typography variant="caption" sx={{ color: "#666" }}>
               {formData.aLevelSubjects.length}/5 subjects added
             </Typography>
           </Box>
         </Paper>
   
         {/* Additional Qualifications Section */}
         <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
           <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
             <CheckCircleIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
             <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
               Additional Qualifications
             </Typography>
           </Box>
   
           <Grid container spacing={2} sx={{ mb: 3 }}>
             <Grid size={{xs:12, sm:6}}>
               <TextField
                 fullWidth
                 label="Institution Name"
                 name="additionalQualificationInstitution"
                 value={formData.additionalQualificationInstitution}
                 onChange={handleInputChange}
                 variant="outlined"
                 placeholder="e.g., Oxford University"
               />
             </Grid>
             <Grid size={{xs:12, sm:6}}>
               <FormControl fullWidth>
                 <InputLabel>Qualification Type</InputLabel>
                 <Select
                   name="additionalQualificationType"
                   value={formData.additionalQualificationType}
                   onChange={handleChange}
                   label="Qualification Type"
                 >
                   <MenuItem value="">Select Type</MenuItem>
                   <MenuItem value="diploma">Diploma</MenuItem>
                   <MenuItem value="certificate">Certificate</MenuItem>
                   <MenuItem value="degree">Degree</MenuItem>
                   <MenuItem value="masters">Masters</MenuItem>
                   <MenuItem value="phd">PhD</MenuItem>
                   <MenuItem value="other">Other</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid size={{xs:12, sm:6}}>
               <TextField
                 fullWidth
                 label="Award Year"
                 name="additionalQualificationYear"
                 type="number"
                 value={formData.additionalQualificationYear}
                 onChange={handleInputChange}
                 variant="outlined"
                 inputProps={{ min: 1990, max: new Date().getFullYear() }}
               />
             </Grid>
              <Grid size={{xs:12, sm:6}}>
               <TextField
                 fullWidth
                 label="Class of award"
                 name="class_of_award"
                 type="text"
                 value={formData.class_of_award}
                 onChange={handleInputChange}
                 variant="outlined"
                 placeholder='e.g first class, second'
               />
             </Grid>
           </Grid>
   
         </Paper>
       </Box>
   </>
  )
}

export default AcademicResults
