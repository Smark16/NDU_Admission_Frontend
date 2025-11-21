"use client"

import ApplicationReview from "./application-review"
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../../../AxiosInstance/UseAxios";

interface Reviewer {
  id:number;
  first_name:string;
  last_name:string;
  username:string
}

interface Application {
  id: number;
  first_name: string;
  last_name:String;
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
  passport_photo: File | null;
}

interface Subject {
  id:number;
  name:string;
}

interface Result {
  id: number;
  grade: string;
  subject: Subject | number;   // API can return object **or** id
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg text-gray-600 p-6 bg-white shadow-lg rounded-lg">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching application details...
        </div>
      </div>
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
