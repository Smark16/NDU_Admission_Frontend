/** Admissions site is for applicants only; staff/students use the main ERP. */

export const ERP_SITE_URL =
  (import.meta.env.VITE_ERP_SITE_URL as string | undefined)?.trim().replace(/\/+$/, "") ||
  "https://erp.ndejje.ndu.ac.ug";

export const PORTAL_KIND = "admissions" as const;

type RoleFlags = {
  is_staff?: boolean;
  is_student?: boolean;
  is_lecturer?: boolean;
  is_applicant?: boolean;
};

export function isErpPortalUser(d: RoleFlags): boolean {
  return !!(d.is_staff || d.is_student || d.is_lecturer);
}

/** Non-null if this account must not use the admissions portal. */
export function admissionsPortalMismatchMessage(decoded: RoleFlags): string | null {
  if (!isErpPortalUser(decoded)) return null;
  return `Staff and student accounts use the main university ERP. Sign in at ${ERP_SITE_URL}/`;
}
