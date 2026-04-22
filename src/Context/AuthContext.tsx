import { createContext, useState, useEffect } from "react";
import type { Dispatch, SetStateAction, ReactNode } from "react";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import { CircularProgress, Typography } from "@mui/material";

// Types
type AuthTokens = { access: string; refresh: string };
type DecodedUser = {
  user_id: number | string;
  exp: number;
  iat: number;
  email: string;
  first_name: string;
  last_name: string;
  last_login: string | null;
  phone: number;
  permissions: string[];
  role: string;
  is_staff: boolean;
  is_applicant: boolean;
  date_joined: string;
  jti: string;
  token_type: string;
};

type AuthContextType = {
  showSuccessAlert: (message: string) => void;
  showErrorAlert: (message: string) => void;
  loginUser: (username: string, password: string) => Promise<void>;
  loggeduser: DecodedUser | null;
  loginLoading: boolean;
  noAccount: string;
  authTokens: AuthTokens | null;
  setAuthTokens: Dispatch<SetStateAction<AuthTokens | null>>;
  setLoggedUser: Dispatch<SetStateAction<DecodedUser | null>>;
  setLoading: (value: boolean) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
    const stored = localStorage.getItem("authtokens");
    return stored ? JSON.parse(stored) : null;
  });

  const [loggeduser, setLoggedUser] = useState<DecodedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [noAccount, setNoAccount] = useState("");

  const loginUser = async (username: string, password: string) => {
    setLoginLoading(true);
    setNoAccount("");

    try {
      const response = await api.post("api/accounts/login", { username, password });

      if (response.status === 200 || response.status === 201) {
        const data: AuthTokens = response.data;
        localStorage.setItem("authtokens", JSON.stringify(data));
        setAuthTokens(data);

        // Decode will trigger useEffect above
        const decoded = jwtDecode<DecodedUser>(data.access);
        setLoggedUser(decoded);

        { decoded?.is_staff ? navigate('/admin/admission_dashboard') : navigate('/applicant/dashboard') }

        showSuccessAlert("Login successful!");
        // Navigation happens in useEffect
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || "Invalid username or password";
      setNoAccount(message);
      showErrorAlert(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const showSuccessAlert = (message: string) => {
    Swal.fire({
      html: `
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">✅</span>
          <span style="font-size:0.92rem;font-weight:600;color:#fff;">${message}</span>
        </div>`,
      toast: true,
      timer: 5000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#000080",
      color: "#fff",
      padding: "12px 20px",
      width: "auto",
      customClass: { popup: "ndu-toast" },
    });
  };

  const showErrorAlert = (message: string) => {
    Swal.fire({
      html: `
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">❌</span>
          <span style="font-size:0.92rem;font-weight:600;color:#fff;">${message}</span>
        </div>`,
      toast: true,
      timer: 5000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#c0001a",
      color: "#fff",
      padding: "12px 20px",
      width: "auto",
      customClass: { popup: "ndu-toast" },
    });
  };

  // Decode token on mount
  useEffect(() => {
    if (authTokens?.access) {
      try {
        const decoded = jwtDecode<DecodedUser>(authTokens.access);
        const lastPath = localStorage.getItem('lastPath');
        setLoggedUser(decoded);

        if (lastPath) {
          navigate(lastPath);
          localStorage.removeItem('lastPath');
        }
      } catch (err) {
        localStorage.removeItem("authtokens");
        setAuthTokens(null);
      }
    }
    setLoading(false);
  }, [authTokens]);


  const contextData: AuthContextType = {
    showSuccessAlert,
    showErrorAlert,
    loginUser,
    loggeduser,
    noAccount,
    loginLoading,
    setLoggedUser,
    setAuthTokens,
    setLoading,
    authTokens,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? (<>
        <Box sx={{ p: 8, textAlign: "center", py: 12 }}>
          <CircularProgress sx={{ color: "#7c1519" }} />
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
            loading...
          </Typography>
        </Box>
      </>) : children}
    </AuthContext.Provider>
  );
};