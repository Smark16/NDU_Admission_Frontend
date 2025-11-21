"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  Typography,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import VisibilityIcon from "@mui/icons-material/Visibility"
import SchoolIcon from "@mui/icons-material/School"
import useAxios from "../../../AxiosInstance/UseAxios"

interface Admitted {
  id:number;
  batch:string;
  campus:String;
  program:string
  name:string;
  student_id:string;
  reg_no:string,
  faculty:string,
  admission_date:string;
  status:string;
}

export default function AdmittedStudents() {
  const theme = useTheme()
  const AxiosInstance = useAxios()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [searchTerm, setSearchTerm] = useState("")
  const [registrationFilter, setRegistrationFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [admittedStudents, setAdmittedStudents] = useState<Admitted[]>([])

  // fetch admissions
  const fetchAdmissions = async ()=>{
    try{
     const {data} = await AxiosInstance.get('/api/admissions/list_admitted_students')
     setAdmittedStudents(data)
    }catch(err){
     console.log(err)
    }
  }

  useEffect(()=>{
    fetchAdmissions()
  }, [])

  console.log('admitted_student', admittedStudents)

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    return admittedStudents.filter((student) => {
      const matchesSearch =
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        registrationFilter === "all" ||
        (registrationFilter === "registered" && student.status) ||
        (registrationFilter === "not-registered" && !student.status)

      return matchesSearch && matchesFilter
    })
  }, [admittedStudents, searchTerm, registrationFilter])

  console.log('filtered', filteredStudents)

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (event:any, newPage:number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event:any) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // const handleViewDetails = (student) => {
  //   setSelectedStudent(student)
  //   setOpenDialog(true)
  // }

  // const handleCloseDialog = () => {
  //   setOpenDialog(false)
  //   setSelectedStudent(null)
  // }

  const formatDate = (dateString:string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Admitted Students
          </Typography>
        </Stack>

        {/* Search and Filter Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              placeholder="Search by Student ID, Name, or Program..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <FormControl fullWidth size="small">
              <InputLabel>Registration Status</InputLabel>
              <Select
                value={registrationFilter}
                label="Registration Status"
                onChange={(e) => {
                  setRegistrationFilter(e.target.value)
                  setPage(0)
                }}
                startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="registered">Registered Only</MenuItem>
                <MenuItem value="not-registered">Not Registered</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Table Section */}
      <Card sx={{ boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}>
        {filteredStudents.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "primary.main",
                      "& th": {
                        color: "white",
                        fontWeight: 700,
                        fontSize: isMobile ? "0.85rem" : "0.95rem",
                      },
                    }}
                  >
                    <TableCell>Student ID</TableCell>
                    <TableCell>Reg No</TableCell>
                    <TableCell>Name</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>Program</TableCell>
                        <TableCell>Faculty</TableCell>
                      </>
                    )}
                    {!isMobile && <TableCell>Campus</TableCell>}
                    {!isMobile && <TableCell>Batch</TableCell>}
                    {!isMobile && <TableCell>Admission Date</TableCell>}
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        backgroundColor: index % 2 === 0 ? "transparent" : "action.hover",
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{student.student_id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{student.reg_no}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      {!isMobile && <TableCell>{student.program}</TableCell>}
                      {!isMobile && <TableCell>{student.faculty}</TableCell>}
                      {!isMobile && <TableCell>{student.campus}</TableCell>}
                      {!isMobile && <TableCell>{student.batch}</TableCell>}
                      {!isMobile && <TableCell>{formatDate(student.admission_date)}</TableCell>}
                      <TableCell>
                        <Chip
                          label={student.status ? "Registered" : "Not Registered"}
                          color={student.status ? "success" : "warning"}
                          variant="filled"
                          size="small"
                        />
                      </TableCell>
                      {/* <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(student)}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: "1px solid", borderTopColor: "divider" }}
            />
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <SchoolIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              No Admitted Students Yet
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Students will appear here after admission.
            </Typography>
          </Box>
        )}
      </Card>

      {/* Student Details Dialog */}
      {/* <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem" }}>Student Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedStudent && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Student ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedStudent.student_id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedStudent.fullName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Program
                </Typography>
                <Typography variant="body1">{selectedStudent.program}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Faculty
                </Typography>
                <Typography variant="body1">{selectedStudent.faculty}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Campus
                </Typography>
                <Typography variant="body1">{selectedStudent.campus}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Batch
                </Typography>
                <Typography variant="body1">{selectedStudent.batch}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Admission Date
                </Typography>
                <Typography variant="body1">{formatDate(selectedStudent.)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                  Registration Status
                </Typography>
                <Chip
                  label={selectedStudent.isRegistered ? "Registered" : "Not Registered"}
                  color={selectedStudent.isRegistered ? "success" : "warning"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="contained" href={`/application/${selectedStudent?.applicationId}`} target="_blank">
            View Full Application
          </Button>
        </DialogActions>
      </Dialog> */}
    </Container>
  )
}
