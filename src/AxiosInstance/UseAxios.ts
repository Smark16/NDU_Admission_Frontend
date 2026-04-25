import { useContext, useMemo } from "react";
import {AuthContext} from '../Context/AuthContext';
import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
      headers: { Authorization: `Bearer ${authTokens?.access ?? ""}` }, // Use empty string if no token
    });

    instance.interceptors.request.use(async (req) => {
      if (!authTokens) return req;

      const user = jwtDecode<any>(authTokens.access);
      const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

      if (!isExpired) return req;

      try {
        // Refresh the token
        const response = await axios.post(`${baseURL}/api/token/refresh/`, {
          refresh: authTokens.refresh,
        });

        const newTokens = response.data;
        localStorage.setItem("authtokens", JSON.stringify(newTokens));
        setAuthTokens(newTokens);
        setLoggedUser(jwtDecode(newTokens.access));

        // Update request header
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