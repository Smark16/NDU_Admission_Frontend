"use client"

import React, { useContext, useEffect, useState } from "react"
import {
  Box,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Collapse,
  Card,
  CircularProgress,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import useHook from "../../Hooks/useHook"
import { AuthContext } from "../../Context/AuthContext"
import useAxios from "../../AxiosInstance/UseAxios"
import moment from "moment";
import logo from '../../Images/Ndejje_University_Logo.jpg'

interface Notification {
  id: number
  title: string
  message?: string
  created_at: string
  is_read: boolean
}

interface SidebarProps {
  notifications?: Notification[]
  onNavigate?: (path: string) => void
}

// Reusable Sidebar Content (used in both mobile drawer & desktop sidebar)
const SidebarContent: React.FC<SidebarProps & { onClose?: () => void }> = ({
  onNavigate = () => { },
  onClose = () => { },
}) => {
  const AxiosInstance = useAxios()
  const location = useLocation()
  const navigate = useNavigate()
  const { batch } = useHook()
  const { loggeduser } = useContext(AuthContext) || {}
  const [expandNotifications, setExpandNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/admissions/list_user_notification')
      setNotifications(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon, path: "/applicant/dashboard" },
    { id: "profile", label: "My Profile", icon: PersonIcon, path: "/applicant/profile" },
    ...(batch?.is_active
      ? [{ id: "application", label: "New Application", icon: AddIcon, path: "/applicant/new_application" }]
      : []
    ),
  ]

  const quickLinks = [
    { id: "edit", label: "Edit Profile", icon: EditIcon, path: "/applicant/profile" },
    { id: "logout", label: "Logout", icon: LogoutIcon, path: "/logout" },
  ]

  const handleClick = (path: string) => {
    navigate(path)
    onNavigate(path)
    onClose()
  }

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* User Profile Card */}
      <Box sx={{
        p: 3,
        background: "linear-gradient(135deg, #5ba3f5 0%, #3b82f6 100%)",
        color: "white",
        textAlign: "center",
        borderRadius: 0,
      }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,                   
            px: 3,                   
            py: 2.5,                
            borderBottom: "1px solid", 
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          {/* Professional small logo */}
          <Box
            component="img"
            src={logo}
            alt="Ndejje University Logo"
            sx={{
              width: 38,        
              height: 38,
              borderRadius: 1.5, 
              objectFit: "contain",
              boxShadow: 1,    
              backgroundColor: "white", 
              p: 0.5,          
            }}
          />

          {/* Clean, bold title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "12px",
              color: "text.primary",
              letterSpacing: "0.2px",
            }}
          >
            NDU Applications Portal
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={700} noWrap>{loggeduser?.first_name} {loggeduser?.last_name}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.85rem" }}>
          {loggeduser?.email}
        </Typography>
      </Box>

      {/* Notifications */}
      <Box sx={{ p: 2 }}>
        <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <ListItemButton onClick={() => setExpandNotifications(!expandNotifications)}>
            <ListItemIcon><NotificationsIcon sx={{ color: "#0066cc" }} /></ListItemIcon>
            <ListItemText primary="Notifications" primaryTypographyProps={{ fontWeight: 600 }} />
            {unreadCount > 0 && <Chip label={unreadCount} size="small" color="primary" />}
            {expandNotifications ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse in={expandNotifications}>
            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications to show
                  </Typography>
                </Box>
              ) : (
                notifications.map(n => (
                  <Box key={n.id} sx={{ p: 2, borderTop: "1px solid #f0f0f0", bgcolor: n.is_read ? "white" : "#f0f7ff" }}>
                    <Typography variant="subtitle2" fontWeight={n.is_read ? 500 : 600}>
                      {n.title}
                    </Typography>
                    {n.message && <Typography variant="caption" color="text.secondary">{n.message}</Typography>}
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      {moment(n.created_at).fromNow()}
                    </Typography>
                  </Box>
                ))
              )}

            </Box>
          </Collapse>
        </Card>
      </Box>

      {/* Main Menu */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path)
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleClick(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? "#e8f1ff" : "transparent",
                  color: isActive ? "#0066cc" : "inherit",
                  "&:hover": { bgcolor: isActive ? "#e8f1ff" : "#f5f5f5" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? "#0066cc" : "inherit" }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* Quick Links */}
      <List sx={{ px: 2, pb: 2 }}>
        {quickLinks.map(item => {
          const Icon = item.icon
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => handleClick(item.path)} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: "center", borderTop: "1px solid #e9ecef" }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Admissions Portal
        </Typography>
      </Box>
    </Box>
  )
}

// Main Sidebar Component (Now with Top Menu Button!)
const Sidebar: React.FC<SidebarProps> = (props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md")) // Mobile + Tablet
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  // This is the NEW top bar with menu button
  const TopBar = () => (
    <Box sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 64,
      bgcolor: "white",
      borderBottom: "1px solid #e9ecef",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 2,
      zIndex: 1200,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}>
      <Typography variant="h6" fontWeight={600} color="#1a1a1a">
        Admissions Portal
      </Typography>

      <IconButton onClick={handleDrawerToggle} size="large">
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
    </Box>
  )

  const drawerWidth = 300

  return (
    <>
      {/* Top Bar with Menu Icon (Visible only on mobile/tablet) */}
      {isMobile && <TopBar />}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 4,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#f8f9fa",
            borderRight: isMobile ? "none" : "1px solid #e9ecef",
            mt: isMobile ? "64px" : "0", // Push below top bar on mobile
            height: isMobile ? "calc(100% - 64px)" : "100%",
          },
        }}
      >
        <SidebarContent {...props} onClose={handleDrawerToggle} />
      </Drawer>

      {/* Optional: Add padding to main content so it doesn't hide under sidebar */}
      {!isMobile && <Box sx={{ width: drawerWidth, flexShrink: 0 }} />}
    </>
  )
}

export default Sidebar