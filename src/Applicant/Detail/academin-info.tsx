// "use client"
// import { Card, CardContent, CardHeader, Typography, Grid, Box, Chip } from "@mui/material"
// import SchoolIcon from "@mui/icons-material/School"

// interface AcademicInfoSectionProps {
//   application: any
// }

// export default function AcademicInfoSection({ application }: AcademicInfoSectionProps) {
//   const InfoField = ({ label, value }: { label: string; value: string }) => (
//     <Box>
//       <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}>
//         {label}
//       </Typography>
//       <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
//         {value}
//       </Typography>
//     </Box>
//   )

//   return (
//     <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
//       <CardHeader
//         avatar={<SchoolIcon sx={{ color: "primary.main" }} />}
//         title={
//           <Typography variant="h6" sx={{ fontWeight: 700 }}>
//             Academic Information
//           </Typography>
//         }
//       />
//       <CardContent>
//         <Grid container spacing={{ xs: 2, md: 3 }}>

//           {/* Program Choices */}
//           {application?.programs?.length > 0 && (
//             <Grid size={{xs:12}}>
//               <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
//                 Program Choice(s)
//               </Typography>
//               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                 {application.programs.map((p: any, i: number) => (
//                   <Chip
//                     key={p.id}
//                     label={`${i + 1}. ${p.name}`}
//                     size="small"
//                     sx={{ backgroundColor: "#0D0060", color: "#fff", fontWeight: 600 }}
//                   />
//                 ))}
//               </Box>
//             </Grid>
//           )}

//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="Batch" value={application?.batch?.name || "To be assigned"} />
//           </Grid>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="O-Level School" value={application?.olevel_school} />
//           </Grid>
//           <Grid size={{xs:12, sm:6}}>
//             <InfoField label="O-Level Year" value={application?.olevel_year.toString()} />
//           </Grid>
//           {application?.alevel_school && (
//             <>
//               <Grid size={{xs:12, sm:6}}>
//                 <InfoField label="A-Level School" value={application?.alevel_school} />
//               </Grid>
//               <Grid size={{xs:12, sm:6}}>
//                 <InfoField label="A-Level Year" value={application?.alevel_year.toString()} />
//               </Grid>
//             </>
//           )}
//         </Grid>
//       </CardContent>
//     </Card>
//   )
// }

"use client";

import { Card, CardContent, CardHeader, Typography, Grid, Box, Chip } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

interface AcademicInfoSectionProps {
  application: any;
}

export default function AcademicInfoSection({ application }: AcademicInfoSectionProps) {
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

  return (
    <Card sx={{ boxShadow: 1, "&:hover": { boxShadow: 3 } }}>
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
          {application?.programs?.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
                Program Choice(s)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {application.programs.map((p: any, i: number) => (
                  <Chip
                    key={p.id || i}
                    label={`${i + 1}. ${p.name}`}
                    size="small"
                    sx={{ backgroundColor: "#0D0060", color: "#fff", fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Grid>
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
    </Card>
  );
}
