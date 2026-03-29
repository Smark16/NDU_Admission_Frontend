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

    // get active batch
     const fetchBatch = async ()=>{
       try{
         setIsBatchLoading(true)
         const response = await AxiosInstance.get('/api/admissions/active_batch')
         setBatch(response.data)
       }catch(err){
         console.log(err)
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
         console.log(err)
       }finally{
         setIsAdmissionLoading(false)
       }
     }
   
     useEffect(()=>{
     fetchBatch()
     fetchActiveAdmissionBatch()
     }, [])
   
  return {
    batch, isBatchLoading, admissionBatch, isAdmissionLoading
  }
}

export default useHook
