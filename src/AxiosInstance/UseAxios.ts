import { useContext, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AuthContext, type DecodedUser } from "../Context/AuthContext";
import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { getApiBaseURL } from "../../lib/apiBaseUrl";

const baseURL = getApiBaseURL();

type AuthTokens = { access: string; refresh: string };

async function syncSessionPermissions(
  access: string,
  setLoggedUser: Dispatch<SetStateAction<DecodedUser | null>>,
) {
  try {
    const response = await axios.get(`${baseURL}/api/accounts/session`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    setLoggedUser((prev) => {
      const decoded = jwtDecode<DecodedUser>(access);
      return {
        ...decoded,
        ...(prev || {}),
        ...response.data,
        permissions: response.data?.permissions ?? prev?.permissions ?? [],
      };
    });
  } catch {
    /* keep previous permissions if session sync fails mid-refresh */
  }
}

// use Axios
const useAxios = () => {
  const context = useContext(AuthContext);

  // Throw error if used outside AuthProvider
  if (!context) {
    throw new Error("useAxios must be used within an AuthProvider");
  }

  const { setLoggedUser, setAuthTokens, authTokens } = context;

  // useMemo ensures Axios instance is not recreated on every render
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL,
      headers: { Authorization: `Bearer ${authTokens?.access ?? ""}` },
    });

    instance.interceptors.request.use(async (req) => {
      if (!authTokens) return req;

      const user = jwtDecode<{ exp: number }>(authTokens.access);
      const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

      if (!isExpired) return req;

      try {
        const response = await axios.post(`${baseURL}/api/token/refresh/`, {
          refresh: authTokens.refresh,
        });

        const newTokens = response.data as AuthTokens;
        localStorage.setItem("authtokens", JSON.stringify(newTokens));
        setAuthTokens(newTokens);
        // Preserve permissions until /session returns (JWT no longer embeds them).
        setLoggedUser((prev) => {
          const decoded = jwtDecode<DecodedUser>(newTokens.access);
          return {
            ...decoded,
            permissions: prev?.permissions ?? decoded.permissions ?? [],
          };
        });
        void syncSessionPermissions(newTokens.access, setLoggedUser);

        req.headers.Authorization = `Bearer ${newTokens.access}`;
        return req;
      } catch (error) {
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
        return Promise.reject(error);
      }
    });

    return instance;
  }, [authTokens, setAuthTokens, setLoggedUser]);

  return axiosInstance;
};

export default useAxios;
