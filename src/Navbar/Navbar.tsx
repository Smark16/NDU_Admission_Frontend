"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import LoginIcon from "@mui/icons-material/Login"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import logo from '../Images/Ndejje_University_Logo.jpg'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navItems = [
    { label: "Login", path: "/", icon: <LoginIcon fontSize="small" /> },
    { label: "Register", path: "/register", icon: <PersonAddIcon fontSize="small" /> },
  ]

  const drawer = (
    <Box sx={{ width: 280650, bgcolor: "background.paper", height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, bgcolor: "#7c1519", color: "white" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "0.5px" }}>
            Ndejje Portal
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <List sx={{ px: 2, pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                py: 1.8,
                bgcolor: item.label === "Register" ? "#3e397b" : "#f8f9fa",
                color: item.label === "Register" ? "white" : "#3e397b",
                "&:hover": {
                  bgcolor: item.label === "Register" ? "#7770c7ff" : "#e3f2fd",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
                transition: "all 0.3s ease",
                fontWeight: 600,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {item.icon}
                <ListItemText primary={item.label} />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #7c1519 0%, #7c1519 100%)",
          color: "white",
          boxShadow: "0 4px 20px rgba(13, 71, 161, 0.25)",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 70, sm: 80 }, px: { xs: 2, sm: 4 } }}>
          {/* Logo & Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
            <Box
              component="img"
              src={logo}
              alt="Ndejje University"
              sx={{
                width: 52,
                height: 52,
                borderRadius: "12px",
                objectFit: "contain",
                border: "3px solid rgba(255,255,255,0.3)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            />
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  fontSize: { xs: "1.3rem", sm: "1.6rem" },
                  textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                }}
              >
                Ndejje Applications Portal
              </Typography>
            </Link>
          </Box>

          {/* Desktop Buttons */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button
              component={Link}
              to="/"
              startIcon={<LoginIcon />}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.25)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                },
              }}
            >
              Login
            </Button>

            <Button
              component={Link}
              to="/register"
              startIcon={<PersonAddIcon />}
              variant="contained"
              sx={{
                bgcolor: "#ffb300",
                color: "#0d47a1",
                fontWeight: 700,
                borderRadius: 3,
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 6px 20px rgba(255, 179, 0, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#ffca28",
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 30px rgba(255, 179, 0, 0.5)",
                },
              }}
            >
              Register Now
            </Button>
          </Box>

          {/* Mobile Menu */}
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              display: { xs: "flex", md: "none" },
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: { width: "85%", maxWidth: 350 }
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}