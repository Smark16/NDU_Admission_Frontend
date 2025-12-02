"use client"

import React, { useState } from "react"
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
  Divider,
} from "@mui/material"
import {
  LayoutDashboard as Dashboard,
  Droplet as People,
  School,
  Settings,
  MenuIcon,
  CloverIcon as CloseIcon,
  Expand as ExpandLess,
  Expand as ExpandMore,
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
} from "lucide-react"
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  School as SchoolIcon,
} from '@mui/icons-material';
import logo from '../../Images/Ndejje_University_Logo.jpg'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  // {
  //   id: "dashboard",
  //   label: "Dashboard",
  //   icon: <Dashboard size={20} />,
  //   path: "/dashboard",
  // },

  // ADMINSSIONS
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
          },
          // {
          //   id: "application-review",
          //   label: "Review Applications",
          //   icon: <BarChart3 size={20} />,
          //   path: "/review",
          // },
          {
            id: "admitted",
            label: "Admitted Students",
            icon: <CheckCircle size={20} />,
            path: "/admin/admited_students",
          },
        ],
      },
      {
        id: "Intakes",
        label: "Admission Intakes",
        icon: <BookOpen size={20} />,
        path: "/admin/intake",
      },
      {
        id: "reports",
        label: "Admission Reports",
        icon: <FileBarChart size={20} />,
        path: "/admin/admission-reports",
      },
      {
        id: "subjets and Templates",
        label: "Subjects and Templates",
        icon: <BookOpen size={20} />,
        path: "/admin/set_up",
      },
      {
        id: "Fee Management",
        label: "Fee Management",
        icon: <Banknote size={20} />,
        path: "/admin/fee-management",
      },
      {
        id: "Academic Levels",
        label: "Academic Levels",
        icon: <SchoolIcon sx={{ color: '#3e397b', fontSize: 20 }} />,
        path: "/admin/academic-levels",
      },

    ],
  },

  // ACADEMIC SETUP
  {
    id: "academic",
    label: "Academic Setup",
    icon: <School size={20} />,
    children: [
      {
        id: "programs",
        label: "Programs",
        icon: <BookOpen size={20} />,
        path: "/admin/program_list",
      },
      {
        id: "faculties",
        label: "Faculties",
        icon: <Building size={20} />,
        path: "/admin/faculty-management",
      },
      {
        id: "campuses",
        label: "Campuses",
        icon: <Building size={20} />,
        path: "/admin/campus_management",
      }
    ],
  },

  // USER MANAGEMENT
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
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        icon: <Settings size={20} />,
        path: "/admin/roles-permissions",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={20} />,
    path: "/settings",
  },
  {
    id: "auditlogs",
    label: "Audit Logs",
    icon: <Logs size={20} />,
    path: "/admin/logs",
  },
]

export default function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(["applications", "admissions"])
  const router = useNavigate()
  const pathname = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleNavigate = (path?: string) => {
    if (path) {
      router(path)
      if (isMobile) {
        setMobileOpen(false)
      }
    }
  }

  const isActive = (path?: string) => {
    return path === pathname.pathname
  }

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => (
      <React.Fragment key={item.id}>
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
            backgroundColor: isActive(item.path) ? "rgba(25, 118, 210, 0.08)" : "transparent",
            borderRight: isActive(item.path) ? '4px solid #3e397b' : "none",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isActive(item.path) ? "#3e397b" : "inherit",
              transition: "color 0.3s ease",
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            sx={{
              "& .MuiTypography-root": {
                fontWeight: isActive(item.path) ? 600 : 500,
                fontSize: "0.95rem",
                color: isActive(item.path) ? "#3e397b" : "inherit",
                transition: "all 0.3s ease",
              },
            }}
          />
          {item.children && (
            <Box sx={{ ml: 1 }}>
              {expandedItems.includes(item.id) ? <ExpandLess size={20} /> : <ExpandMore size={20} />}
            </Box>
          )}
        </ListItemButton>

        {item.children && (
          <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {renderNavItems(item.children, level + 1)}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    ))
  }

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#ffffff",
      }}
    >
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
          sx={{
            width: 40,
            height: 40,
            borderRadius: "8px",
            background: "linear-gradient(135deg, #3e397b 0%, #3e397b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        />
         
        <Box>
          <Box sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#3e397b" }}>Admissions</Box>
          <Box sx={{ fontSize: "0.75rem", color: "#757575" }}>System</Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List
        component="nav"
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#3e397b",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#3e397b",
            borderRadius: "3px",
            "&:hover": {
              background: "#9e9e9e",
            },
          },
        }}
      >
        {renderNavItems(navigationItems)}
      </List>

      {/* Divider and Footer */}
      <Divider />
      <Box sx={{ p: 2 }}>

        <Link to='/logout'>
          <ListItemButton
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "#d32f2f" }}>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                "& .MuiTypography-root": {
                  color: "#d32f2f",
                  fontWeight: 500,
                },
              }}
            />
          </ListItemButton>
        </Link>

      </Box>
    </Box>
  )

  const drawerWidth = 280

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
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
              boxShadow: "2px 0 8px rgba(0, 0, 0, 0.08)",
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
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}
