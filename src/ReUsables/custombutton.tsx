import React from "react";
import { Button, type ButtonProps } from "@mui/material";
import { type SxProps, type Theme } from "@mui/material/styles";

interface CustomButtonProps extends Omit<ButtonProps, "variant"> {
  text?: React.ReactNode;
  icon?: React.ReactNode;
  startIcon?: React.ReactNode;
  onClick?: () => void;
  variant?: "text" | "outlined" | "contained";
  sx?: SxProps<Theme>;

  component?: React.ElementType;
  to?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text = "",
  icon = null,
  endIcon=null,
  onClick,
  variant = "contained",
  sx = {},
  ...props
}) => {
  const defaultStyles: SxProps<Theme> = {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    px: 3,
    py: 1.5,
    transition: "all 0.25s ease",
    ...(variant === 'contained' ? {
      background: "linear-gradient(135deg, #c0001a 0%, #8b0014 100%)",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(192,0,26,0.3)",
      "&:hover": {
        background: "linear-gradient(135deg, #a0001a 0%, #6b0010 100%)",
        boxShadow: "0 6px 20px rgba(192,0,26,0.45)",
        transform: "translateY(-1px)",
      },
    } : {
      borderColor: "#c0001a",
      color: "#c0001a",
      "&:hover": {
        borderColor: "#a0001a",
        backgroundColor: "rgba(192,0,26,0.06)",
      },
    })
  };

  return (
    <Button
      variant={variant}
      startIcon={icon}
      onClick={onClick}
      sx={{ ...defaultStyles, ...sx }}
      {...props}
      endIcon={endIcon}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
