"use client";

import { useEffect, useState } from "react";
import ApplicationDetail from "./ApplicationDetail";
import useAxios from "../../AxiosInstance/UseAxios";
import { useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

interface Reviewer {
  id: number;
  first_name: string;
  last_name: string;
  username: string
}


interface Application {
  id: number;
  first_name: string;
  last_name: String;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  phone: string;
  email: string;
  is_left_handed: boolean;
  next_of_kin_name: string;
  next_of_kin_contact: string;
  next_of_kin_relationship: string;

  program: { name: string; code: string };
  batch: { name: string };
  campus: { name: string };

  olevel_school: string;
  olevel_year: number;
  alevel_school: string;
  alevel_year: number;

  address: string;
  status: string;
  application_fee_amount: string;
  created_at: string;
  reviewed_by: Reviewer | number;
  reviewed_at: string | null;
  review_notes: string | null;
  passport_photo: File | null;
}

interface Subject {
  id: number;
  name: string;
}

interface Result {
  id: number;
  grade: string;
  subject: Subject | number;
}

interface Document {
  id: number;
  uploaded_at: string;
  file: File | null;
  name: string;
  file_url: string;
}
// --- End Interface Definitions ---

export default function Home() {
  const AxiosInstance = useAxios();
  const { id } = useParams();

  const [application, setApplication] = useState<Application | null>(null);
  const [olevelresults, setOlevelResults] = useState<Result[]>([]);
  const [alevelresults, setAlevelResults] = useState<Result[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = async () => {
    // Check if ID is available before fetching
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true)
    try {
      const response = await AxiosInstance.get(`/api/admissions/application_detail/${id}`)

      const norm = (r: any): Result => ({
        id: r.id,
        grade: r.grade,
        subject: typeof r.subject === "object" ? r.subject : { id: r.subject, name: "???" },
      });


      setApplication(response.data.application);
      setOlevelResults((response.data.olevel_results ?? []).map(norm));
      setAlevelResults((response.data.alevel_results ?? []).map(norm));
      setDocuments(response.data.documents);
      setIsLoading(false)
    } catch (err) {
      console.error("Failed to fetch application details:", err);
      setIsLoading(false)
      // Handle the error state in your UI if needed
    } finally {
      setIsLoading(false);
    }
  };

  // console.log('alevel', alevelresults)
  useEffect(() => {
    fetchDetail();
  }, [id]);

  // 1. Show loading state while data is being fetched
  {
    isLoading && !application && (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // 3. Render the detail component once the data is ready
  return (
    <main className="p-4 md:p-8">
      <ApplicationDetail
        application={application}
        olevelresults={olevelresults}
        alevelresults={alevelresults}
        documents={documents}
      />
    </main>
  );
}
