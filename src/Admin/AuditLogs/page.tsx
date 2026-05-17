// "use client"

// import type React from "react"
// import { useContext, useEffect, useState } from "react"
// import {
//   Box,
//   Container,
//   Paper,
//   Tabs,
//   Tab,
//   Button,
//   Typography,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
// } from "@mui/material"
// import Crud from "./crud"
// import AuthEvents from "./authEvents"

// import useAxios from "../../AxiosInstance/UseAxios"
// import { AuthContext } from "../../Context/AuthContext"

// interface TabPanelProps {
//   children?: React.ReactNode
//   index: number
//   value: number
// }

// interface Crud {
//     id:number;
//     user:string;
//     action: "Create" | "Update" | "Delete"
//     target:string;
//     details:string | null;
//     timestamp:string;
// }

// interface AuthLog {
//   id: number
//   user: string
//   action: "login" | "register"
//   description?: string
//   user_agent?: string
//   timestamp: string
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index } = props
//   return (
//     <div hidden={value !== index} style={{ width: "100%" }}>
//       {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
//     </div>
//   )
// }

// export default function AuditLogs() {
//   const AxiosInstance = useAxios()
//   const {showErrorAlert = ()=>{}, showSuccessAlert= ()=>{}} = useContext(AuthContext) || {}
//   const [tabValue, setTabValue] = useState(0)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [startDate, setStartDate] = useState("")
//   const [endDate, setEndDate] = useState("")
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
//   const [selectedLog, setSelectedLog] = useState<number | null>(null)
//   const [crudPage, setCrudPage] = useState(1)
//   const [authPage, setAuthPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(5)
//   const [crudLogs, setCrudLogs] = useState<Crud[]>([])
//   const [authLogs, setAuthLogs] = useState<AuthLog[]>([])
//   const [isLoading, setIsLoading] = useState(false)

// const [deleteType, setDeleteType] = useState<'crud' | 'auth'>('crud')

//   const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
//     setTabValue(newValue)
//     setSearchTerm("")
//     setStartDate("")
//     setEndDate("")
//     setCrudPage(1)
//     setAuthPage(1)
//   }

// // fetch crud logs
// const FetchCrudLogs = async()=>{
//     try{
//       setIsLoading(true)
//       const response = await AxiosInstance.get('/api/audit/crud_logs')
//       setCrudLogs(response.data)
//       setIsLoading(false)
//     }catch(err){
//         console.log(err)
//     }
// }

// //fetch auth logs
// const FetchLogs = async()=>{
//     try{
//       const response = await AxiosInstance.get('/api/audit/auth_logs/')
//       setAuthLogs(response.data)
//     }catch(err){
//         console.log(err)
//     }
// } 

// useEffect(()=>{
//  FetchCrudLogs()
//  FetchLogs()
// }, [])

//   // DELETE SINGLE LOG 
//   const handleDeleteLog = (logId: number, type: 'crud' | 'auth') => {
//     setSelectedLog(logId)
//     setDeleteType(type)  
//     setDeleteDialogOpen(true)
//   }

//   // CONFIRM DELETE 
//   const confirmDelete = async () => {
//     if (!selectedLog) return
//       setIsLoading(true)
//     try {
//       if (deleteType === 'crud') {
//         await AxiosInstance.delete(`/api/audit/remove_crud_log/${selectedLog}`)
//         setIsLoading(false)
//         setCrudLogs(prev => prev.filter(log => log.id !== selectedLog))
//       } else {
//         await AxiosInstance.delete(`/api/audit/delete_auth_log/${selectedLog}`)
//         setIsLoading(false)
//         setAuthLogs(prev => prev.filter(log => log.id !== selectedLog))
//       }
//       showSuccessAlert(`Deleted ${deleteType} log:, ${selectedLog}`)
//     } catch (err:any) {
//         if(err.response?.data.detail){
//             showErrorAlert(`${err.response?.data.detail}`)
//         }else{
//             showErrorAlert('Delete failed')
//         }
//         setIsLoading(false)
//     } finally {
//       setDeleteDialogOpen(false)
//       setSelectedLog(null)
//     }
//   }

//   // DELETE ALL
//   const handleDeleteAll = async (type: 'crud' | 'auth') => {
//     if (!window.confirm(`Are you sure you want to delete ALL ${type.toUpperCase()} logs? This cannot be undone.`)) {
//       return
//     }
//     setIsLoading(true)
//     try {
//       if (type === 'crud') {
//         await AxiosInstance.delete('/api/audit/delete_all_crud_logs')
//         setIsLoading(false)
//         setCrudLogs([])
//       } else {
//         await AxiosInstance.delete('/api/audit/delete_all_auth_logs')
//         setIsLoading(false)
//         setAuthLogs([])
//       }
//       showSuccessAlert(`Deleted all ${type} logs`)
//       console.log(`Deleted all ${type} logs`)
//     } catch (err:any) {
//       if(err.response?.data.detail){
//         showErrorAlert(`${err.response?.data.detail}`)
//       }else{
//         showErrorAlert('Bulk delete failed:')
//       }
//       console.error("Bulk delete failed:", err)
//       setIsLoading(false)
//     }
//   }

//   const CrudEventsTable = () => (
//      <Crud
//     logs={crudLogs} 
//     isLoading={isLoading}
//     searchTerm={searchTerm}
//     setSearchTerm={setSearchTerm}
//     startDate={startDate}
//     setStartDate={setStartDate}
//     endDate={endDate}
//     setEndDate={setEndDate}
//     page={crudPage}
//     setPage={setCrudPage}
//     itemsPerPage={itemsPerPage}
//     setItemsPerPage={setItemsPerPage}
//     onDeleteLog={(id) => handleDeleteLog(id, 'crud')}    
//     onDeleteAll={() => handleDeleteAll('crud')} 
//   />
//   )

//   const AuthEventsTable = () => (
//      <AuthEvents
//     logs={authLogs}
//     isLoading={isLoading}
//     searchTerm={searchTerm}
//     setSearchTerm={setSearchTerm}
//     startDate={startDate}
//     setStartDate={setStartDate}
//     endDate={endDate}
//     setEndDate={setEndDate}
//     page={authPage}
//     setPage={setAuthPage}
//     itemsPerPage={itemsPerPage}
//     setItemsPerPage={setItemsPerPage}
//     onDeleteLog={(id) => handleDeleteLog(id, 'auth')}   
//     onDeleteAll={() => handleDeleteAll('auth')}   
//   />
//   )

//   return (
//     <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 4 }}>
//       <Container maxWidth="lg">
//         {/* Header */}
//         <Box sx={{ mb: 4 }}>
//           <Typography
//             variant="h4"
//             sx={{
//               fontWeight: 700,
//               color: "#111827",
//               mb: 1,
//             }}
//           >
//             Audit Logs
//           </Typography>
//           <Typography variant="body2" sx={{ color: "#6b7280" }}>
//             Track all system events, user actions, and authentication activities
//           </Typography>
//         </Box>

//         {/* Tabs */}
//         <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
//           <Tabs
//             value={tabValue}
//             onChange={handleTabChange}
//             sx={{
//               borderBottom: "1px solid #e5e7eb",
//               backgroundColor: "#f9fafb",
//               "& .MuiTab-root": {
//                 textTransform: "none",
//                 fontWeight: 500,
//                 color: "#6b7280",
//                 fontSize: "0.95rem",
//                 py: 2,
//                 "&.Mui-selected": {
//                   color: "#111827",
//                   fontWeight: 600,
//                 },
//               },
//               "& .MuiTabs-indicator": {
//                 backgroundColor: "#3b82f6",
//                 height: 3,
//               },
//             }}
//           >
//             <Tab label="CRUD Events" />
//             <Tab label="Authentication Events" />
//           </Tabs>

//           {/* Tab Panels */}
//           <Box sx={{ p: 3 }}>
//             <TabPanel value={tabValue} index={0}>
//               <CrudEventsTable />
//             </TabPanel>
//             <TabPanel value={tabValue} index={1}>
//               <AuthEventsTable />
//             </TabPanel>
//           </Box>
//         </Paper>

//         {/* Delete Confirmation Dialog */}
//         <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
//           <DialogTitle sx={{ fontWeight: 600, color: "#111827" }}>Delete Log Entry</DialogTitle>
//           <DialogContent>
//             <Typography sx={{ color: "#6b7280", mt: 1 }}>
//               Are you sure you want to delete this log entry? This action cannot be undone.
//             </Typography>
//           </DialogContent>
//           <DialogActions sx={{ p: 2 }}>
//             <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "#6b7280" }}>
//               Cancel
//             </Button>
//             <Button
//               onClick={confirmDelete}
//               variant="contained"
//               color="error"
//               sx={{
//                 backgroundColor: "#ef4444",
//                 "&:hover": { backgroundColor: "#dc2626" },
//               }}
//             >
//                 {isLoading ? <CircularProgress size={20}/> : 'Delete'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </Box>
//   )
// }

"use client"

import React, { useContext, useEffect, useState } from "react"
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"

import Crud from "./crud"
import AuthEvents from "./authEvents"

import useAxios from "../../AxiosInstance/UseAxios"
import { AuthContext } from "../../Context/AuthContext"

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index} style={{ width: "100%" }}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AuditLogs() {
  const AxiosInstance = useAxios()
  const { showErrorAlert = () => {}, showSuccessAlert = () => {} } = useContext(AuthContext) || {}

  const [tabValue, setTabValue] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Shared filters
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Pagination
  const [crudPage, setCrudPage] = useState(1)
  const [authPage, setAuthPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)

  // Data
  const [crudLogs, setCrudLogs] = useState<any[]>([])
  const [authLogs, setAuthLogs] = useState<any[]>([])
  const [crudTotal, setCrudTotal] = useState(0)
  const [authTotal, setAuthTotal] = useState(0)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<number | null>(null)
  const [deleteType, setDeleteType] = useState<'crud' | 'auth'>('crud')

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Fetch CRUD Logs
  const fetchCrudLogs = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(crudPage),
        page_size: String(itemsPerPage),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const res = await AxiosInstance.get(`/api/audit/crud_logs/?${params.toString()}`)
      
      setCrudLogs(res.data.results || res.data)
      setCrudTotal(res.data.count || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch Auth Logs
  const fetchAuthLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: String(authPage),
        page_size: String(itemsPerPage),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const res = await AxiosInstance.get(`/api/audit/auth_logs/?${params.toString()}`)
      
      setAuthLogs(res.data.results || res.data)
      setAuthTotal(res.data.count || 0)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCrudLogs()
  }, [crudPage, itemsPerPage, searchTerm, startDate, endDate])

  useEffect(() => {
    fetchAuthLogs()
  }, [authPage, itemsPerPage, searchTerm, startDate, endDate])

  // Delete handlers remain the same
  const handleDeleteLog = (logId: number, type: 'crud' | 'auth') => {
    setSelectedLog(logId)
    setDeleteType(type)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedLog) return
    try {
      if (deleteType === 'crud') {
        await AxiosInstance.delete(`/api/audit/remove_crud_log/${selectedLog}`)
        setCrudLogs(prev => prev.filter(log => log.id !== selectedLog))
      } else {
        await AxiosInstance.delete(`/api/audit/delete_auth_log/${selectedLog}`)
        setAuthLogs(prev => prev.filter(log => log.id !== selectedLog))
      }
      showSuccessAlert(`Log deleted successfully`)
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.detail || "Delete failed")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedLog(null)
    }
  }

  const handleDeleteAll = async (type: 'crud' | 'auth') => {
    if (!window.confirm(`Delete ALL ${type.toUpperCase()} logs? This action cannot be undone.`)) return

    try {
      if (type === 'crud') {
        await AxiosInstance.delete('/api/audit/delete_all_crud_logs')
        setCrudLogs([])
        setCrudTotal(0)
      } else {
        await AxiosInstance.delete('/api/audit/delete_all_auth_logs')
        setAuthLogs([])
        setAuthTotal(0)
      }
      showSuccessAlert(`All ${type} logs deleted`)
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.detail || "Bulk delete failed")
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827", mb: 1 }}>
            Audit Logs
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Track all system events, user actions, and authentication activities
          </Typography>
        </Box>

        <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
            }}
          >
            <Tab label="CRUD Events" />
            <Tab label="Authentication Events" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <Crud
                logs={crudLogs}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                page={crudPage}
                setPage={setCrudPage}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                totalCount={crudTotal}
                onDeleteLog={(id) => handleDeleteLog(id, 'crud')}
                onDeleteAll={() => handleDeleteAll('crud')}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <AuthEvents
                logs={authLogs}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                page={authPage}
                setPage={setAuthPage}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                totalCount={authTotal}
                onDeleteLog={(id) => handleDeleteLog(id, 'auth')}
                onDeleteAll={() => handleDeleteAll('auth')}
              />
            </TabPanel>
          </Box>
        </Paper>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Log Entry</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this log? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
