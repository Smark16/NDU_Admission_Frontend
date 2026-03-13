'use client'

import React, { useRef } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip,
//   PrintIcon as PrintIconMUI,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'

interface AdmissionData {
  applicationId: string
  batch: string
  personalInfo: {
    fullName: string
    dateOfBirth: string
    gender: string
    nationality: string
    email: string
    phone: string
    passportNumber: string
    disabilityStatus: string
    address: string
  }
  academicInfo: {
    oLevelSchool: string
    oLevelYear: string
    aLevelSchool: string
    aLevelYear: string
    oLevelSubjects: { subject: string; grade: string }[]
    aLevelSubjects: { subject: string; grade: string }[]
  }
  documents: { name: string; uploadDate: string; type: string }[]
  status: {
    currentStatus: string
    applicationFeeStatus: string
    applicationDate: string
    reviewedBy: string
    reviewDate: string
  }
}

const AdmissionDocument: React.FC<{ data?: AdmissionData }> = ({
  data = {
    applicationId: '#44',
    batch: 'AUGUST INTAKE',
    personalInfo: {
      fullName: 'ODEKE PATRICK',
      dateOfBirth: '03/12/2025',
      gender: 'Male',
      nationality: 'Uganda',
      email: 'odeke@gmail.com',
      phone: '0758699554',
      passportNumber: 'UG-2025-123456',
      disabilityStatus: 'None',
      address: 'hjhhhjhhjhhjhjhjh',
    },
    academicInfo: {
      oLevelSchool: 'SEETA',
      oLevelYear: '2018',
      aLevelSchool: 'LUBIRI SS',
      aLevelYear: '2021',
      oLevelSubjects: [
        { subject: 'Chemistry', grade: 'C3' },
        { subject: 'English', grade: 'C6' },
      ],
      aLevelSubjects: [{ subject: 'Chemistry', grade: 'B' }],
    },
    documents: [
      { name: 'Nyakate_Agnes_Tagaya_Information_Manager_CV-1', uploadDate: '11/12/2025', type: 'A Level' },
      { name: 'momo_api_integration_report', uploadDate: '11/12/2025', type: 'O Level' },
      { name: 'Passport Photo', uploadDate: '11/12/2025', type: 'Photo' },
    ],
    status: {
      currentStatus: 'Admitted',
      applicationFeeStatus: 'Not Paid',
      applicationDate: '11/12/2025',
      reviewedBy: 'admin',
      reviewDate: '12/03/2026',
    },
  },
}) => {
  const documentRef = useRef<HTMLDivElement>(null)

  return (
    <Box sx={{ py: 4, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Action Buttons */}

        {/* Document */}
        <Paper
          ref={documentRef}
          sx={{
            p: { xs: 3, md: 6 },
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4, pb: 3, borderBottom: '3px solid #667eea' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              OFFICIAL ADMISSION DOCUMENT
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: '#666', fontWeight: 500, letterSpacing: 1 }}
            >
              Application ID: {data.applicationId} • {data.batch}
            </Typography>
          </Box>

          {/* Personal Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#667eea',
                mb: 2,
                pb: 1,
                borderBottom: '2px solid #e0e0e0',
                textTransform: 'uppercase',
                fontSize: '0.95rem',
                letterSpacing: 0.5,
              }}
            >
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
                    FULL NAME
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                    {data.personalInfo.fullName}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
                    DATE OF BIRTH
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                    {data.personalInfo.dateOfBirth}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
                    GENDER
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                    {data.personalInfo.gender}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
                    NATIONALITY
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                    {data.personalInfo.nationality}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
                    EMAIL
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: '#667eea', fontWeight: 500 }}>
                    {data.personalInfo.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
                    PHONE
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                    {data.personalInfo.phone}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
                    ADDRESS
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: '#555' }}>
                    {data.personalInfo.address}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Academic Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#667eea',
                mb: 2,
                pb: 1,
                borderBottom: '2px solid #e0e0e0',
                textTransform: 'uppercase',
                fontSize: '0.95rem',
                letterSpacing: 0.5,
              }}
            >
              Educational Background
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography sx={{ fontSize: '0.85rem', color: '#999', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>
                      O-Level
                    </Typography>
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 600, color: '#333', mb: 0.5 }}>
                      {data.academicInfo.oLevelSchool} ({data.academicInfo.oLevelYear})
                    </Typography>
                    <Table size="small" sx={{ mt: 2 }}>
                      <TableBody>
                        {data.academicInfo.oLevelSubjects.map((subj, idx) => (
                          <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ p: '6px 0', fontWeight: 500, color: '#555' }}>
                              {subj.subject}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                p: '6px 0',
                                fontWeight: 700,
                                color: '#667eea',
                              }}
                            >
                              {subj.grade}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography sx={{ fontSize: '0.85rem', color: '#999', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>
                      A-Level
                    </Typography>
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 600, color: '#333', mb: 0.5 }}>
                      {data.academicInfo.aLevelSchool} ({data.academicInfo.aLevelYear})
                    </Typography>
                    <Table size="small" sx={{ mt: 2 }}>
                      <TableBody>
                        {data.academicInfo.aLevelSubjects.map((subj, idx) => (
                          <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ p: '6px 0', fontWeight: 500, color: '#555' }}>
                              {subj.subject}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                p: '6px 0',
                                fontWeight: 700,
                                color: '#667eea',
                              }}
                            >
                              {subj.grade}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Application Status Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#667eea',
                mb: 2,
                pb: 1,
                borderBottom: '2px solid #e0e0e0',
                textTransform: 'uppercase',
                fontSize: '0.95rem',
                letterSpacing: 0.5,
              }}
            >
              Application Status & Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#f0f4ff',
                    borderRadius: 1,
                    border: '1px solid #667eea',
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', color: '#667eea', fontWeight: 700, mb: 0.5, textTransform: 'uppercase' }}>
                    Current Status
                  </Typography>
                  <Chip
                    label={data.status.currentStatus}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{xs:12, sm:6, md:3}}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#fef3e0',
                    borderRadius: 1,
                    border: '1px solid #ffb74d',
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', color: '#ff9800', fontWeight: 700, mb: 0.5, textTransform: 'uppercase' }}>
                    Application Fee
                  </Typography>
                  <Chip
                    icon={data.status.applicationFeeStatus === 'Paid' ? <CheckCircleIcon /> : <CancelIcon />}
                    label={data.status.applicationFeeStatus}
                    sx={{
                      backgroundColor: data.status.applicationFeeStatus === 'Paid' ? '#4caf50' : '#f44336',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{xs:12, sm:6, md:3}}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#e3f2fd',
                    borderRadius: 1,
                    border: '1px solid #2196f3',
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', color: '#2196f3', fontWeight: 700, mb: 0.5, textTransform: 'uppercase' }}>
                    Application Date
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
                    {data.status.applicationDate}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{xs:12, sm:6, md:3}}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#f3e5f5',
                    borderRadius: 1,
                    border: '1px solid #9c27b0',
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', color: '#9c27b0', fontWeight: 700, mb: 0.5, textTransform: 'uppercase' }}>
                    Review Date
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
                    {data.status.reviewDate}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 4 }} />

          {/* Signature Section */}
          <Box sx={{ pt: 2 }}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: '#999',
                fontWeight: 700,
                mb: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Applicant Acknowledgment & Signature
            </Typography>
            <Grid container spacing={6}>
              <Grid size={{xs:12, md:6}}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#555', mb: 3, lineHeight: 1.6 }}>
                    I hereby acknowledge that all the information provided in this admission document is accurate and complete to the best of my knowledge.
                  </Typography>
                  <Box sx={{ borderTop: '2px solid #333', pt: 1 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                      Applicant Signature & Date
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs:12, md:6}}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#555', mb: 3, lineHeight: 1.6 }}>
                    This document has been verified and approved by the admission committee on the date specified above.
                  </Typography>
                  <Box sx={{ borderTop: '2px solid #333', pt: 1 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                      Reviewed By: {data.status.reviewedBy}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 6,
              pt: 3,
              borderTop: '1px solid #e0e0e0',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
              This is an official admission document. Please keep it safe for future reference.
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#ccc', mt: 1 }}>
              Document Generated on {new Date().toLocaleDateString()} • Application ID: {data.applicationId}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdmissionDocument
