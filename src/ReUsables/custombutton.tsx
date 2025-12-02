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
    px: 3,
    py: 1.5,
    boxShadow: (theme) => theme.shadows[4],
    ...(variant === 'contained' ? {
        bgcolor: "#7c1519",
        "&:hover": {
          bgcolor: "#7c1519",
        },
    } : {
    borderColor: "#7c1519", 
    color: "#7c1519"
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
