import {useState, useEffect} from 'react'
import useAxios from "../AxiosInstance/UseAxios";

interface Batch {
  id:number;
  name:string;
  is_active:boolean;
  programs:[]
  academic_year:string
}

function useHook() {
  const AxiosInstance = useAxios()
   const [batch, setBatch] = useState<Batch | null>(null)

    // get active batch
     const fetchBatch = async ()=>{
       try{
         const response = await AxiosInstance.get('/api/admissions/active_batch')
         setBatch(response.data)
       }catch(err){
         console.log(err)
       }
     }
   
     useEffect(()=>{
     fetchBatch()
     }, [])
   
  return {
    batch
  }
}

export default useHook
