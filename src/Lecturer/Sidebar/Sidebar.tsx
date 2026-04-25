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
  Collapse,
  CircularProgress,
  Avatar,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Class as ClassIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "../../Context/AuthContext"
import useAxios from "../../AxiosInstance/UseAxios"
import moment from "moment"
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
    { id: "portal", label: "Lecturer Portal", icon: SchoolIcon, path: "/lecturer/portal" },
    { id: "courses", label: "My Courses", icon: BookIcon, path: "/lecturer/courses" },
    { id: "students", label: "My Students", icon: GroupsIcon, path: "/lecturer/students" },
    { id: "scores", label: "Enter Scores", icon: ClassIcon, path: "/lecturer/enter-scores" },
    { id: "profile", label: "My Profile", icon: PersonIcon, path: "/lecturer/profile" },
  ]

  const handleClick = (path: string) => {
    navigate(path)
    onNavigate(path)
    onClose()
  }

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <img
          src={logo}
          alt="NDU Logo"
          style={{ maxWidth: "120px", height: "auto" }}
        />
      </Box>

      {/* User Info */}
      {loggeduser && (
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: "#3e397b",
                width: 40,
                height: 40,
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {loggeduser.first_name?.charAt(0) || "L"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {loggeduser.first_name} {loggeduser.last_name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                Lecturer
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 1, overflow: "auto" }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleClick(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  bgcolor: isActive ? "#3e397b" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: isActive ? "#2d2960" : "action.hover",
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? "white" : "inherit" }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Notifications Section */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton
          onClick={() => setExpandNotifications(!expandNotifications)}
          sx={{ mx: 1, borderRadius: 2, py: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Notifications"
            secondary={unreadCount > 0 ? `${unreadCount} unread` : ""}
          />
          {expandNotifications ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        <Collapse in={expandNotifications} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ maxHeight: 200, overflow: "auto" }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : notifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                />
              </ListItem>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    bgcolor: notification.is_read ? "transparent" : "action.selected",
                  }}
                >
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary">
                          {moment(notification.created_at).fromNow()}
                        </Typography>
                        {notification.message && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                        )}
                      </>
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: notification.is_read ? 400 : 600,
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Collapse>
      </Box>

      {/* Logout */}
      <Divider />
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => {
            navigate("/logout")
            onClose()
          }}
          sx={{
            mx: 1,
            my: 1,
            borderRadius: 2,
            color: "error.main",
            "&:hover": {
              bgcolor: "error.light",
              color: "white",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </ListItem>
    </Box>
  )
}

// Main Sidebar Component
const Sidebar: React.FC<SidebarProps> = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerWidth = 280

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Desktop Sidebar
  const desktopSidebar = (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  )

  // Mobile Drawer
  const mobileDrawer = (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: drawerWidth,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <SidebarContent onClose={handleDrawerToggle} />
    </Drawer>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1300,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            width: "100%",
            p: 1,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && desktopSidebar}

      {/* Mobile Drawer */}
      {isMobile && mobileDrawer}
    </>
  )
}

export default Sidebar

