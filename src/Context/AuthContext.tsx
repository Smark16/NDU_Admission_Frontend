import { createContext, useState, useEffect, useCallback, useRef } from "react";
import type { Dispatch, SetStateAction, ReactNode } from "react";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import { CircularProgress, Typography } from "@mui/material";

// API base URL (mirrors UseAxios.ts logic so this stays consistent in any env)
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "") ||
  "http://127.0.0.1:8000";

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
        const decoded = jwtDecode<DecodedUser>(data.access);

        // This SPA is applicants/students only; staff use main-erp-portal.
        if (decoded.is_staff) {
          setNoAccount(
            "Staff accounts cannot sign in here. Please use the internal ERP portal.",
          );
          showErrorAlert(
            "Staff accounts cannot sign in here. Please use the internal ERP portal.",
          );
          return;
        }

        localStorage.setItem("authtokens", JSON.stringify(data));
        setAuthTokens(data);
        setLoggedUser(decoded);
        navigate("/applicant/dashboard");
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
        if (decoded.is_staff) {
          localStorage.removeItem('authtokens');
          setAuthTokens(null);
          setLoggedUser(null);
          localStorage.removeItem('lastPath');
          setLoading(false);
          return;
        }
        const lastPath = localStorage.getItem('lastPath');
        setLoggedUser(decoded);

        if (lastPath && !lastPath.startsWith('/admin')) {
          navigate(lastPath);
          localStorage.removeItem('lastPath');
        } else if (lastPath?.startsWith('/admin')) {
          localStorage.removeItem('lastPath');
        }
      } catch (err) {
        localStorage.removeItem("authtokens");
        setAuthTokens(null);
      }
    }
    setLoading(false);
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
  // Reads the configured timeout from /api/accounts/system_settings, picks the
  // right window based on whether the user is admin or applicant, and resets
  // an idle timer on every interaction. When the timer fires, we sign the user
  // out and tell them why. Activity is shared across tabs via a localStorage
  // key, so being active in any tab keeps every other tab alive too.
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleMsRef = useRef<number>(0); // 0 = not yet known / disabled

  useEffect(() => {
    // Only run when fully signed in
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
        // localStorage unavailable (e.g. private mode) — fall back to in-memory only
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
        // Re-evaluate — another tab may have written a fresher timestamp.
        const elapsed2 = Date.now() - readLastActivity();
        if (elapsed2 >= idleMsRef.current) {
          logoutUser("You have been signed out due to inactivity.");
        } else {
          scheduleCheck();
        }
      }, remaining + 250); // small buffer
    };

    const onActivity = () => {
      writeActivity();
      scheduleCheck();
    };

    const onStorage = (e: StorageEvent) => {
      // Another tab logged activity — re-arm with the new value.
      if (e.key === ACTIVITY_KEY) scheduleCheck();
    };

    // Activity events. `passive: true` so we never block scrolling.
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

    // Mark "now" as activity so we don't immediately log out on first load.
    writeActivity();

    // Pull the configured timeout from the backend — fall back to sane defaults
    // if the call fails so we still enforce *some* limit.
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
        // Network failure — keep the fallback timeout, don't break login.
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