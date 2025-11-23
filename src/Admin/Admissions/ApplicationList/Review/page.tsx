"use client"

import ApplicationReview from "./application-review"
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../../../AxiosInstance/UseAxios";
import { Box, CircularProgress } from "@mui/material";

interface Application {
  id: number;
  first_name: string;
  last_name:String;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  phone: string;
  email: string;
  
 // next_of_kin_name: string;
  // next_of_kin_contact: string;
  // next_of_kin_relationship: string;
//  program: { name: string; code: string };
  batch: string;
  // campus: { name: string };

  olevel_school: string;
  olevel_year: number;
  alevel_school: string;
  alevel_year: number;

  address: string;
  status: string;
  application_fee_amount: string;
  created_at: string;
  reviewed_by: string;
  reviewed_at: string | null;
  passport_photo: File | null;
}

interface Subject {
  id:number;
  name:string;
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
  name:string;
  file_url:string;
}

export default function ReviewPage() {
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
          console.error("Application ID is missing.");
          setIsLoading(false);
          return;
      }
  
      try {
        const response = await AxiosInstance.get(`/api/admissions/review_application/${id}`);
        console.log("detail RESPONSE:", response.data);
  
        const norm = (r: any): Result => ({
          id: r.id,
          grade: r.grade,
          subject: typeof r.subject === "object" ? r.subject : { id: r.subject, name: "???" },
        });
  
  
        setApplication(response.data.application);
        setOlevelResults((response.data.olevel_results ?? []).map(norm));
        setAlevelResults((response.data.alevel_results ?? []).map(norm));
        setDocuments(response.data.documents);
      } catch (err) {
        console.error("Failed to fetch application details:", err);
       
      } finally {
        setIsLoading(false); 
      }
    };

    console.log('app', application)
  
    useEffect(() => {
      fetchDetail();
    }, [id]); 

    // 1. Show loading state while data is being fetched
  if (isLoading) {
    return (
       <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. Show error/not-found state if fetch is complete but application is still null
  if (!application) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl text-red-600 p-6 bg-white shadow-lg rounded-lg">
          Error: Application not found or failed to load.
        </div>
      </div>
    );
  }


  return (
    <ApplicationReview
        application={application}
        olevelresults={olevelresults}
        alevelresults={alevelresults}
        documents={documents}
    />
  )
}
