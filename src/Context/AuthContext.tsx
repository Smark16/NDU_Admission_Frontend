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
  is_student: boolean;
  is_lecturer: boolean;
  must_change_password: boolean;
  date_joined: string;
  jti: string;
  token_type: string;
};

type PortalType = "applicant" | "student" | "admin" | "staff"

type AuthContextType = {
  showSuccessAlert: (message: string) => void;
  showErrorAlert: (message: string) => void;
  loginUser: (username: string, password: string, portalType?: PortalType) => Promise<void>;
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
 
  console.log(loggeduser)

  // Returns true if the decoded user is allowed for the selected portal type
  const portalMatches = (decoded: DecodedUser, portalType?: PortalType): boolean => {
    if (!portalType) return true
    switch (portalType) {
      case "applicant": return !decoded.is_staff && !decoded.is_student
      case "student":   return decoded.is_student
      case "admin":     return decoded.is_staff && !decoded.is_lecturer
      case "staff":     return decoded.is_staff || decoded.is_lecturer
      default:          return true
    }
  }

  const portalLabel: Record<PortalType, string> = {
    applicant: "Applicant",
    student:   "Student",
    admin:     "Administrator",
    staff:     "Staff",
  }

  const loginUser = async (username: string, password: string, portalType?: PortalType) => {
    setLoginLoading(true);
    setNoAccount("");

    try {
      const response = await api.post("api/accounts/login", { username, password });

      if (response.status === 200 || response.status === 201) {
        const data: AuthTokens = response.data;
        const decoded = jwtDecode<DecodedUser>(data.access);

        // ── Portal type guard ──────────────────────────────────────────
        if (!portalMatches(decoded, portalType)) {
          const selected = portalType ? portalLabel[portalType] : "this"
          const actual   = decoded.is_staff    ? "Administrator/Staff"
                         : decoded.is_student  ? "Student"
                         : "Applicant"
          const msg = `These credentials belong to the ${actual} portal, not ${selected}. Please select the correct portal.`
          setNoAccount(msg)
          showErrorAlert(msg)
          return
        }
        // ──────────────────────────────────────────────────────────────

        localStorage.setItem("authtokens", JSON.stringify(data));
        setAuthTokens(data);
        setLoggedUser(decoded);

        if (decoded.must_change_password) {
          navigate('/student/change-password')
        } else if (decoded.is_lecturer) {
          navigate('/lecturer/portal')
        } else if (decoded.is_staff) {
          navigate('/admin/admission_dashboard')
        } else if (decoded.is_student) {
          navigate('/student/portal')
        } else {
          navigate('/applicant/dashboard')
        }

        showSuccessAlert("Login successful!");
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
      title: message,
      icon: "success",
      toast: true,
      timer: 6000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const showErrorAlert = (message: string) => {
    Swal.fire({
      title: message,
      icon: "error",
      toast: true,
      timer: 6000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
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