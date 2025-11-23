"use client"

import { useState } from "react"
import {Link} from "react-router-dom"
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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navItems = [
    { label: "Login", href: "/" },
    { label: "Register", href: "/register" },
  ]

  const drawer = (
    <Box sx={{ width: 250, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Menu
        </Typography>
        <IconButton onClick={handleDrawerToggle} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.href}
              onClick={handleDrawerToggle}
              sx={{
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: 500,
                    color: "#1a1a1a",
                  },
                }}
              />
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
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f0f0f0",
          color: "#1a1a1a",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 3 },
            py: 1.5,
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                fontSize: "1.25rem",
                letterSpacing: "-0.5px",
                cursor: "pointer",
              }}
            >
              Ndejje
            </Typography>
          </Link>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.href}
                sx={{
                  color: "#1a1a1a",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            <MenuIcon sx={{ color: "#1a1a1a" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
