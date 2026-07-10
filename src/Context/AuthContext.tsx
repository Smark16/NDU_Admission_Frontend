import { createContext, useState, useEffect, useCallback, useRef } from "react";
import type { Dispatch, SetStateAction, ReactNode } from "react";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { getApiBaseURL } from "../../lib/apiBaseUrl";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import { CircularProgress, Typography } from "@mui/material";

// API base URL (shared with lib/api.ts and UseAxios.ts)
const API_BASE_URL = getApiBaseURL();

// Types
type AuthTokens = { access: string; refresh: string };
export type DecodedUser = {
  user_id: number | string;
  exp: number;
  iat: number;
  email: string;
  first_name: string;
  last_name: string;
  last_login: string | null;
  phone: number;
  permissions?: string[];
  roles?: string[];
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
  logoutUser: (reason?: string) => void;
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

async function fetchSessionUser(
  access: string,
  decoded: DecodedUser,
): Promise<DecodedUser> {
  const sessionRes = await api.get("api/accounts/session", {
    headers: { Authorization: `Bearer ${access}` },
  });
  return {
    ...decoded,
    ...sessionRes.data,
    permissions: sessionRes.data?.permissions ?? [],
  };
}

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

  const loginUser = async (username: string, password: string) => {
    setLoginLoading(true);
    setNoAccount("");

    try {
      const response = await api.post("api/accounts/login", { username, password });

      if (response.status === 200 || response.status === 201) {
        const data: AuthTokens = response.data;
        localStorage.setItem("authtokens", JSON.stringify(data));
        setAuthTokens(data);

        const decoded = jwtDecode<DecodedUser>(data.access);
        // Permissions are no longer in the JWT (nginx 431). Staff menus need /session.
        let user = decoded;
        try {
          user = await fetchSessionUser(data.access, decoded);
        } catch {
          if (decoded.is_staff) {
            localStorage.removeItem("authtokens");
            setAuthTokens(null);
            setLoggedUser(null);
            const msg =
              "Could not load your permissions from the server. Please try logging in again.";
            setNoAccount(msg);
            showErrorAlert(msg);
            return;
          }
        }
        setLoggedUser(user);

        { user?.is_staff ? navigate('/admin/admission_dashboard') : navigate('/applicant/dashboard') }

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

  // Decode token on mount and sync live permissions from the server.
  useEffect(() => {
    if (!authTokens?.access) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrapSession = async () => {
      try {
        const decoded = jwtDecode<DecodedUser>(authTokens.access);

        try {
          const user = await fetchSessionUser(authTokens.access, decoded);
          if (cancelled) return;
          setLoggedUser(user);
        } catch {
          if (cancelled) return;
          if (decoded.is_staff) {
            localStorage.removeItem("authtokens");
            setAuthTokens(null);
            setLoggedUser(null);
            showErrorAlert(
              "Could not load your permissions. Please log in again (role changes need a fresh session).",
            );
            navigate("/login", { replace: true });
            return;
          }
          setLoggedUser(decoded);
        }

        const lastPath = localStorage.getItem("lastPath");
        if (lastPath) {
          navigate(lastPath);
          localStorage.removeItem("lastPath");
        }
      } catch {
        localStorage.removeItem("authtokens");
        setAuthTokens(null);
        setLoggedUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [authTokens]);

  // Manual logout — also used by the inactivity watcher below.
  const logoutUser = useCallback(
    (reason?: string) => {
      localStorage.removeItem("authtokens");
      setAuthTokens(null);
      setLoggedUser(null);
      if (reason) {
        Swal.fire({
          icon: "info",
          title: "Signed out",
          text: reason,
          timer: 6000,
          showConfirmButton: true,
        });
      }
      navigate("/");
    },
    [navigate]
  );

  // ── Inactivity-based auto-logout ──────────────────────────────────────────
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleMsRef = useRef<number>(0);

  useEffect(() => {
    if (!loggeduser || !authTokens?.access) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
      idleMsRef.current = 0;
      return;
    }

    const ACTIVITY_KEY = "ndu_last_activity_ts";

    const writeActivity = () => {
      try {
        localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      } catch {
        /* private mode */
      }
    };

    const readLastActivity = (): number => {
      try {
        const v = Number(localStorage.getItem(ACTIVITY_KEY));
        return Number.isFinite(v) && v > 0 ? v : Date.now();
      } catch {
        return Date.now();
      }
    };

    const scheduleCheck = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (idleMsRef.current <= 0) return;

      const elapsed = Date.now() - readLastActivity();
      const remaining = idleMsRef.current - elapsed;
      if (remaining <= 0) {
        logoutUser("You have been signed out due to inactivity.");
        return;
      }
      idleTimerRef.current = setTimeout(() => {
        const elapsed2 = Date.now() - readLastActivity();
        if (elapsed2 >= idleMsRef.current) {
          logoutUser("You have been signed out due to inactivity.");
        } else {
          scheduleCheck();
        }
      }, remaining + 250);
    };

    const onActivity = () => {
      writeActivity();
      scheduleCheck();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_KEY) scheduleCheck();
    };

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel",
    ];
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    window.addEventListener("storage", onStorage);

    writeActivity();

    const fallbackMinutes = loggeduser.is_staff ? 60 : 30;
    const applyMinutes = (minutes: number) => {
      if (!Number.isFinite(minutes) || minutes < 1) return;
      idleMsRef.current = Math.floor(minutes) * 60 * 1000;
      scheduleCheck();
    };

    applyMinutes(fallbackMinutes);

    fetch(`${API_BASE_URL}/api/accounts/system_settings`, {
      headers: { Authorization: `Bearer ${authTokens.access}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        if (!data) return;
        const minutes = loggeduser.is_staff
          ? Number(data.admin_session_timeout)
          : Number(data.student_session_timeout);
        applyMinutes(minutes);
      })
      .catch(() => {
        /* keep fallback */
      });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener("storage", onStorage);
    };
  }, [loggeduser, authTokens?.access, logoutUser]);


  const contextData: AuthContextType = {
    showSuccessAlert,
    showErrorAlert,
    loginUser,
    logoutUser,
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
