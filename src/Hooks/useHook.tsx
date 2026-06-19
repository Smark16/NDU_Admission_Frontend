import {useState, useEffect} from 'react'
import useAxios from "../AxiosInstance/UseAxios";


interface Faculty {
  id: number
  name: string
  code: string | number
}

interface Program {
  id: number
  name: string
  code: string
  faculty: Faculty | string
  academic_level: number;
  campuses: { id: number }[];
}

interface Batch {
  id:number;
  name:string;
  is_active:boolean;
  programs:Program[]
  academic_year:string
}

function useHook() {
  const AxiosInstance = useAxios()
   const [batch, setBatch] = useState<Batch | null>(null)
   const [admissionBatch, setAdmissionBatch] = useState<Batch | null>(null)
   const [isBatchLoading, setIsBatchLoading] = useState(true)
   const [isAdmissionLoading, setIsAdmissionLoading] = useState(true)
   const [batchError, setBatchError] = useState<string | null>(null)

    // get active batch
     const fetchBatch = async ()=>{
       try{
         setIsBatchLoading(true)
         setBatchError(null)
         const response = await AxiosInstance.get('/api/admissions/active_batch')
         setBatch(response.data)
       }catch(err: any){
         setBatch(null)
         const detail = err?.response?.data?.detail
         if (typeof detail === 'string' && detail.trim()) {
           setBatchError(detail)
         } else if (err?.response?.status === 404) {
           setBatchError('No active application intake is open right now.')
         } else {
           setBatchError('Could not load the current application intake.')
         }
       }finally{
         setIsBatchLoading(false)
       }
     }

    // get active admission batch
    const fetchActiveAdmissionBatch = async ()=>{
       try{
         setIsAdmissionLoading(true)
         const response = await AxiosInstance.get('/api/admissions/active_admission_batch')
         setAdmissionBatch(response.data)
       }catch(err){
         setAdmissionBatch(null)
       }finally{
         setIsAdmissionLoading(false)
       }
     }
   
     useEffect(()=>{
     fetchBatch()
     fetchActiveAdmissionBatch()
     }, [])
   
  return {
    batch, isBatchLoading, batchError, admissionBatch, isAdmissionLoading
  }
}

export default useHook
