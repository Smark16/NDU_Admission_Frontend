"use client"

import React, { useState, useMemo, useContext } from "react"
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  LayoutDashboard as Dashboard,
  Droplet as People,
  School,
  Settings,
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronDown as ExpandMore,
  BookOpen,
  FileText,
  Users,
  Building,
  GraduationCap,
  ClipboardList,
  LogOut,
  Banknote,
  FileBarChart,
  CheckCircle,
  Logs,
  BanknoteArrowDown,
} from "lucide-react"
import { useNavigate, useLocation } from 'react-router-dom'
import { School as SchoolIcon, Cancel as CancelIcon } from '@mui/icons-material';
import logo from '../../Images/Ndejje_University_Logo.jpg'

import { AuthContext } from "../../Context/AuthContext"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  children?: NavItem[]
  requiredPermission?: string   
}

const navigationItems: NavItem[] = [
  {
    id: "admissions",
    label: "Admissions",
    icon: <GraduationCap size={20} />,
    children: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Dashboard size={20} />,
        path: "/admin/admission_dashboard",
      },
      {
        id: "applications",
        label: "Applications",
        icon: <ClipboardList size={20} />,
        children: [
          {
            id: "all-applications",
            label: "All Applications",
            icon: <FileText size={20} />,
            path: "/admin/application_list",
            requiredPermission: "admissions.view_application",       
          },
          {
            id: "rejected",
            label: "Rejected Students",
            icon: <CancelIcon sx={{size:"20"}} />,
            path: "/admin/rejected_students",
            requiredPermission: "admissions.view_application",
          },
          {
            id: "admitted",
            label: "Admitted Students",
            icon: <CheckCircle size={20} />,
            path: "/admin/admited_students",
            requiredPermission: "admissions.view_admittedstudent",
          },
          {
            id: "direct-entry",
            label: "Direct Entry Applicants",
            icon: <FileText size={20} />,
            path: "/admin/direct_entry_list",
            requiredPermission: "admissions.view_application",
          },
        ],
      },
      {
        id: "Intakes",
        label: "Admission Intakes",
        icon: <BookOpen size={20} />,
        path: "/admin/intake",
        requiredPermission: "admissions.view_batch",
      },
    ],
  },

  {
    id: "academic",
    label: "Academic Setup",
    icon: <School size={20} />,
    children: [
      {
        id: "campuses",
        label: "Campuses",
        icon: <Building size={20} />,
        path: "/admin/campus_management",
        requiredPermission: "accounts.view_campus",
      },
      {
        id: "faculties",
        label: "Faculties",
        icon: <Building size={20} />,
        path: "/admin/faculty-management",
        requiredPermission: "admissions.view_faculty",
      },
      {
        id: "Academic Levels",
        label: "Academic Levels",
        icon: <SchoolIcon sx={{ color: '#0D0060', fontSize: 20 }} />,
        path: "/admin/academic-levels",
        requiredPermission: "admissions.view_academiclevel",
      },
      {
        id: "programs",
        label: "Programs",
        icon: <BookOpen size={20} />,
        path: "/admin/program_list",
        requiredPermission: "Programs.view_program",
      },
      {
        id: "subjets and Templates",
        label: "Subjects and Templates",
        icon: <BookOpen size={20} />,
        path: "/admin/set_up",
        requiredPermission: "AdmissionReports.view_setup",
      },
    ],
  },

  {
    id: "fees-payments",
    label: "Fees & Payments",
    icon: <Banknote size={20} />,
    children: [
      {
        id: "Fee Management",
        label: "Fee Management",
        icon: <Banknote size={20} />,
        path: "/admin/fee-management",
        requiredPermission: "payments.view_applicationfee",
      },
    ],
  },

  {
    id: "reports-section",
    label: "Reports",
    icon: <FileBarChart size={20} />,
    children: [
      {
        id: "all-applicants-report",
        label: "All Applicants",
        icon: <FileText size={20} />,
        path: "/admin/reports/all-applicants",
        requiredPermission: "admissions.view_application",
      },
      {
        id: "admission-reports",
        label: "Admission Reports",
        icon: <FileBarChart size={20} />,
        path: "/admin/admission-reports",
        requiredPermission: "AdmissionReports.view_admissionreports",
      },
      {
        id: "finance-report",
        label: "Finance",
        icon: <BanknoteArrowDown size={20} />,
        path: "/admin/finance",
        requiredPermission: "payments.view_applicationpayment",
      },
    ],
  },

  {
    id: "user-management",
    label: "User Management",
    icon: <People size={20} />,
    children: [
      {
        id: "users",
        label: "Users",
        icon: <Users size={20} />,
        path: "/admin/user_management",
        requiredPermission: "accounts.view_user",
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        icon: <Settings size={20} />,
        path: "/admin/roles-permissions",
        requiredPermission: "auth.view_group",
      },
    ],
  },
  {
    id: "auditlogs",
    label: "Audit Logs",
    icon: <Logs size={20} />,
    path: "/admin/logs",
    requiredPermission: "audit.view_auditlog",
  },
]

// Helper function to filter nav items based on user permissions
function filterNavItems(items: NavItem[], permissions: string[]): NavItem[] {
  const filtered: NavItem[] = []

  for (const item of items) {
    // Leaf node (no children)
    if (!item.children || item.children.length === 0) {
      if (!item.requiredPermission || permissions.includes(item.requiredPermission)) {
        filtered.push(item)
      }
      continue
    }

    // Has children → filter recursively
    const filteredChildren = filterNavItems(item.children, permissions)

    // Only include parent if it has at least one visible child
    if (filteredChildren.length > 0) {
      filtered.push({
        ...item,
        children: filteredChildren,
      })
    }
  }

  return filtered
}

export default function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(["admissions", "applications"])
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)

  // Get user permissions from AuthContext
  const { loggeduser } = useContext(AuthContext) || {}
  const userPermissions = loggeduser?.permissions || []

  // Filter navigation based on permissions
  const filteredNavigation = useMemo(() => {
    return filterNavItems(navigationItems, userPermissions)
  }, [userPermissions])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path)
      if (isMobile) setMobileOpen(false)
    }
  }

  const isActive = (path?: string) => path === location.pathname

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => {
      const expanded = expandedItems.includes(item.id)

      return (
        <Box key={item.id}>
          <ListItemButton
            onClick={() => {
              if (item.children) {
                toggleExpand(item.id)
              } else {
                handleNavigate(item.path)
              }
            }}
            sx={{
              pl: 2 + level * 2,
              backgroundColor: isActive(item.path) ? "rgba(13,0,96,0.08)" : "transparent",
              borderRight: isActive(item.path) ? "4px solid #0D0060" : "none",
              "&:hover": { backgroundColor: "rgba(13,0,96,0.05)" },
              transition: "background 0.2s ease",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? "#0D0060" : "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                "& .MuiTypography-root": {
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: "0.95rem",
                  color: isActive(item.path) ? "#0D0060" : "inherit",
                },
              }}
            />
            {item.children && (
              <Box sx={{ ml: 1, transition: "transform 0.25s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                <ExpandMore size={20} />
              </Box>
            )}
          </ListItemButton>

          {item.children && (
            <Collapse in={expanded} timeout={200} unmountOnExit>
              <List component="div" disablePadding>
                {renderNavItems(item.children, level + 1)}
              </List>
            </Collapse>
          )}
        </Box>
      )
    })
  }

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#ffffff" }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Ndejje University Logo"
          sx={{ width: 40, height: 40, borderRadius: "8px" }}
        />
        <Box>
          <Box sx={{ fontWeight: 800, fontSize: "1rem", color: "#0D0060", lineHeight: 1.1 }}>NDEJJE UNIVERSITY</Box>
          <Box sx={{ fontSize: "0.72rem", color: "#757575" }}>Admissions Management System</Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List component="nav" sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {renderNavItems(filteredNavigation)}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
        <Box
          component="a"
          href="/logout"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.4,
            borderRadius: 2,
            background: "linear-gradient(135deg, #c0001a 0%, #8b0014 100%)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            boxShadow: "0 4px 14px rgba(192,0,26,0.3)",
            transition: "all 0.25s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #a0001a 0%, #6b0010 100%)",
              boxShadow: "0 6px 20px rgba(192,0,26,0.45)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <LogOut size={18} />
          Sign Out
        </Box>
      </Box>
    </Box>
  )

  const drawerWidth = 280

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box sx={{ position: "fixed", top: 16, left: 16, zIndex: 1300 }}>
          <IconButton
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ backgroundColor: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}




