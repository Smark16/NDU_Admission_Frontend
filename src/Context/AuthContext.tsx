import { createContext, useState, useEffect, useCallback, useRef } from "react";
import type { Dispatch, SetStateAction, ReactNode } from "react";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { getApiBaseURL } from "../../lib/apiBaseUrl";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import { CircularProgress, Typography } from "@mui/material";
import { admissionsPortalMismatchMessage } from "../config/portalSite";

const API_BASE_URL = getApiBaseURL();

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
  is_student?: boolean;
  is_lecturer?: boolean;
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

function clearSession(
  setAuthTokens: Dispatch<SetStateAction<AuthTokens | null>>,
  setLoggedUser: Dispatch<SetStateAction<DecodedUser | null>>,
) {
  localStorage.removeItem("authtokens");
  setAuthTokens(null);
  setLoggedUser(null);
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
          <span style="font-size:20px;">⚠️</span>
          <span style="font-size:0.92rem;font-weight:600;color:#fff;">${message}</span>
        </div>`,
      toast: true,
      timer: 6000,
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
      const response = await api.post("api/accounts/login", {
        username,
        password,
        portal: "admissions",
        portal_kind: "admissions",
      });

      if (response.status === 200 || response.status === 201) {
        const data: AuthTokens = response.data;
        const decoded = jwtDecode<DecodedUser>(data.access);

        const mismatch = admissionsPortalMismatchMessage(decoded);
        if (mismatch) {
          clearSession(setAuthTokens, setLoggedUser);
          setNoAccount(mismatch);
          showErrorAlert(mismatch);
          return;
        }

        localStorage.setItem("authtokens", JSON.stringify(data));
        setAuthTokens(data);

        let user = decoded;
        try {
          user = await fetchSessionUser(data.access, decoded);
        } catch {
          /* applicants can proceed without session enrichment */
        }

        const mismatchAfterSession = admissionsPortalMismatchMessage(user);
        if (mismatchAfterSession) {
          clearSession(setAuthTokens, setLoggedUser);
          setNoAccount(mismatchAfterSession);
          showErrorAlert(mismatchAfterSession);
          return;
        }

        setLoggedUser(user);
        navigate("/applicant/dashboard");
        showSuccessAlert("Login successful!");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        "Invalid username or password";
      setNoAccount(message);
      showErrorAlert(message);
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (!authTokens?.access) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrapSession = async () => {
      try {
        const decoded = jwtDecode<DecodedUser>(authTokens.access);

        const mismatch = admissionsPortalMismatchMessage(decoded);
        if (mismatch) {
          if (cancelled) return;
          clearSession(setAuthTokens, setLoggedUser);
          showErrorAlert(mismatch);
          navigate("/", { replace: true });
          return;
        }

        try {
          const user = await fetchSessionUser(authTokens.access, decoded);
          if (cancelled) return;
          const sessionMismatch = admissionsPortalMismatchMessage(user);
          if (sessionMismatch) {
            clearSession(setAuthTokens, setLoggedUser);
            showErrorAlert(sessionMismatch);
            navigate("/", { replace: true });
            return;
          }
          setLoggedUser(user);
        } catch {
          if (cancelled) return;
          setLoggedUser(decoded);
        }

        const lastPath = localStorage.getItem("lastPath");
        if (lastPath && !lastPath.startsWith("/admin")) {
          navigate(lastPath);
          localStorage.removeItem("lastPath");
        } else if (lastPath?.startsWith("/admin")) {
          localStorage.removeItem("lastPath");
          navigate("/applicant/dashboard");
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

    const applyMinutes = (minutes: number) => {
      if (!Number.isFinite(minutes) || minutes < 1) return;
      idleMsRef.current = Math.floor(minutes) * 60 * 1000;
      scheduleCheck();
    };

    applyMinutes(30);

    fetch(`${API_BASE_URL}/api/accounts/system_settings`, {
      headers: { Authorization: `Bearer ${authTokens.access}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        if (!data) return;
        applyMinutes(Number(data.student_session_timeout) || 30);
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
      {loading ? (
        <>
          <Box sx={{ p: 8, textAlign: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#7c1519" }} />
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
              loading...
            </Typography>
          </Box>
        </>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
