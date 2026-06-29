import axios from "axios";
import { getApiBaseURL } from "./apiBaseUrl";

export const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
});