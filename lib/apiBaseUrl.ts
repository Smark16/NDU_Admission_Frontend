/**
 * In dev, use relative URLs so Vite's /api proxy reaches Django on any local port
 * without CORS issues. In production, use VITE_API_BASE_URL.
 */
export function getApiBaseURL(): string {
  if (import.meta.env.DEV) {
    return "";
  }
  const configured = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  return configured || "http://127.0.0.1:8000";
}
