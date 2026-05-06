import { useContext, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AuthContext, type DecodedUser } from "../Context/AuthContext";
import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

const configuredBaseURL = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
const baseURL = configuredBaseURL || "http://127.0.0.1:8000";

type AuthTokens = { access: string; refresh: string };

function readStoredTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem("authtokens");
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

/** Single-flight refresh: required when backend uses ROTATE_REFRESH_TOKENS + blacklist. */
let refreshInFlight: Promise<AuthTokens> | null = null;

function forceLogout(
  setAuthTokens: Dispatch<SetStateAction<AuthTokens | null>>,
  setLoggedUser: Dispatch<SetStateAction<DecodedUser | null>>,
  error: unknown,
) {
  console.error("Token refresh error:", error);
  Swal.fire({
    icon: "warning",
    title: "Session expired",
    text: "Please log in again.",
    timer: 6000,
    showConfirmButton: true,
  });
  setAuthTokens(null);
  setLoggedUser(null);
  localStorage.removeItem("authtokens");
  window.location.href = "/";
}

function refreshTokensSingleFlight(
  setAuthTokens: Dispatch<SetStateAction<AuthTokens | null>>,
  setLoggedUser: Dispatch<SetStateAction<DecodedUser | null>>,
): Promise<AuthTokens> {
  if (!refreshInFlight) {
    const stored = readStoredTokens();
    if (!stored?.refresh) {
      const p = Promise.reject(new Error("No refresh token")) as Promise<AuthTokens>;
      void p.finally(() => {
        refreshInFlight = null;
      });
      refreshInFlight = p;
      return refreshInFlight;
    }

    refreshInFlight = axios
      .post<AuthTokens>(`${baseURL}/api/token/refresh/`, { refresh: stored.refresh })
      .then((response) => {
        const newTokens = response.data;
        localStorage.setItem("authtokens", JSON.stringify(newTokens));
        setAuthTokens(newTokens);
        setLoggedUser(jwtDecode(newTokens.access));
        return newTokens;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

const useAxios = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAxios must be used within an AuthProvider");
  }

  const { setLoggedUser, setAuthTokens } = context;

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL,
    });

    instance.interceptors.request.use(async (req) => {
      const stored = readStoredTokens();
      if (!stored?.access) return req;

      let access = stored.access;

      try {
        const user = jwtDecode<{ exp: number }>(access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (isExpired) {
          try {
            const newTokens = await refreshTokensSingleFlight(setAuthTokens, setLoggedUser);
            access = newTokens.access;
          } catch (error) {
            forceLogout(setAuthTokens, setLoggedUser, error);
            return Promise.reject(error);
          }
        }
      } catch {
        return req;
      }

      req.headers.Authorization = `Bearer ${access}`;
      return req;
    });

    return instance;
  }, [setAuthTokens, setLoggedUser]);

  return axiosInstance;
};

export default useAxios;
