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
  Collapse,
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
  Circle as CircleIcon,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import useHook from "../../Hooks/useHook"
import { AuthContext } from "../../Context/AuthContext"
import useAxios from "../../AxiosInstance/UseAxios"
import moment from "moment"
import logo from '../../Images/Ndejje_University_Logo.jpg'

const NAVY = "#0D0060"
const NAVY_DARK = "#07003A"

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

const SidebarContent: React.FC<SidebarProps & { onClose?: () => void }> = ({
  onNavigate = () => {},
  onClose = () => {},
}) => {
  const AxiosInstance = useAxios()
  const location = useLocation()
  const navigate = useNavigate()
  const { batch } = useHook()
  const { loggeduser } = useContext(AuthContext) || {}
  const [expandNotifications, setExpandNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/admissions/list_user_notification')
      setNotifications(response.data)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
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

  const handleClick = (path: string) => {
    navigate(path)
    onNavigate(path)
    onClose()
  }

  // User initials avatar
  const initials = `${loggeduser?.first_name?.[0] ?? ""}${loggeduser?.last_name?.[0] ?? ""}`.toUpperCase()

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>

      {/* ── Header ── */}
      <Box
        sx={{
          background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
          px: 3,
          pt: 3,
          pb: 2.5,
        }}
      >
        {/* Logo row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box
            component="img"
            src={logo}
            alt="Ndejje University"
            sx={{ width: 36, height: 36, objectFit: "contain", borderRadius: 1, backgroundColor: "#fff", p: 0.4 }}
          />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", color: "#fff", lineHeight: 1.1 }}>
              NDEJJE UNIVERSITY
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.65)" }}>
              Applications Portal
            </Typography>
          </Box>
        </Box>

        {/* User avatar + name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42, height: 42,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c0001a 0%, #8b0014 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "1rem", color: "#fff",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            {initials}
          </Box>
          <Box sx={{ overflow: "hidden" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff", textTransform: "capitalize", lineHeight: 1.2 }}>
              {loggeduser?.first_name} {loggeduser?.last_name}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {loggeduser?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Notifications ── */}
      <Box sx={{ px: 2, pt: 2 }}>
        <Box
          sx={{
            border: "1px solid #e8eaf6",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "#fafafa",
          }}
        >
          <ListItemButton onClick={() => setExpandNotifications(!expandNotifications)} sx={{ py: 1.2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box sx={{ position: "relative" }}>
                <NotificationsIcon sx={{ color: NAVY, fontSize: 22 }} />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: "absolute", top: -3, right: -3,
                      width: 16, height: 16, borderRadius: "50%",
                      background: "#c0001a", color: "#fff",
                      fontSize: "0.6rem", fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography fontWeight={700} fontSize="0.875rem" color={NAVY}>
                  Notifications
                </Typography>
              }
            />
            {expandNotifications ? <ExpandLessIcon sx={{ color: NAVY }} /> : <ExpandMoreIcon sx={{ color: NAVY }} />}
          </ListItemButton>

          <Collapse in={expandNotifications}>
            <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={20} sx={{ color: NAVY }} />
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 2.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    No notifications to show
                  </Typography>
                </Box>
              ) : (
                notifications.map(n => (
                  <Box
                    key={n.id}
                    sx={{
                      px: 2, py: 1.5,
                      borderTop: "1px solid #f0f0f0",
                      backgroundColor: n.is_read ? "#fff" : "#e8eaf6",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      {!n.is_read && <CircleIcon sx={{ fontSize: 8, color: NAVY, mt: 0.8, flexShrink: 0 }} />}
                      <Box>
                        <Typography variant="caption" fontWeight={n.is_read ? 500 : 700} display="block">
                          {n.title}
                        </Typography>
                        {n.message && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {n.message}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
                          {moment(n.created_at).fromNow()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* ── Main Menu ── */}
      <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path)
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleClick(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? "rgba(0,0,128,0.08)" : "transparent",
                  borderLeft: isActive ? `4px solid ${NAVY}` : "4px solid transparent",
                  "&:hover": { backgroundColor: "rgba(0,0,128,0.05)" },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: isActive ? NAVY : "#666" }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontSize="0.9rem" fontWeight={isActive ? 700 : 500} color={isActive ? NAVY : "text.primary"}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* ── Quick Links ── */}
      <Box sx={{ px: 2, pb: 1 }}>
        <ListItemButton
          onClick={() => handleClick("/applicant/profile")}
          sx={{ borderRadius: 2, mb: 0.5, "&:hover": { backgroundColor: "rgba(0,0,128,0.05)" } }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "#666" }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography fontSize="0.9rem" fontWeight={500}>Edit Profile</Typography>}
          />
        </ListItemButton>
      </Box>

      {/* ── Logout ── */}
      <Box sx={{ px: 2, pb: 2, borderTop: "1px solid #e0e0e0", pt: 1.5 }}>
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
          <LogoutIcon sx={{ fontSize: 18 }} />
          Sign Out
        </Box>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ px: 2, pb: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
          © {new Date().getFullYear()} Ndejje University
        </Typography>
      </Box>
    </Box>
  )
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  const TopBar = () => (
    <Box
      sx={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 64,
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        zIndex: 1200,
        boxShadow: "0 2px 8px rgba(0,0,128,0.3)",
      }}
    >
      <Typography variant="h6" fontWeight={700} color="#fff" fontSize="0.95rem">
        Ndejje University Portal
      </Typography>
      <IconButton onClick={handleDrawerToggle} size="large" sx={{ color: "#fff" }}>
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
    </Box>
  )

  const drawerWidth = 290

  return (
    <>
      {isMobile && <TopBar />}

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
            borderRight: isMobile ? "none" : "1px solid #e9ecef",
            mt: isMobile ? "64px" : "0",
            height: isMobile ? "calc(100% - 64px)" : "100%",
          },
        }}
      >
        <SidebarContent {...props} onClose={handleDrawerToggle} />
      </Drawer>

      {!isMobile && <Box sx={{ width: drawerWidth, flexShrink: 0 }} />}
    </>
  )
}

export default Sidebar
