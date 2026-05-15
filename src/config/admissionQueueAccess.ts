/**
 * OR-set for admission application queues (list / dashboard fetch).
 * Keep in sync with backend `CanViewAdmissionQueues` in accounts/erp_drf_permissions.py.
 */
export const ADMISSION_QUEUE_ACCESS_PERMISSIONS: string[] = [
  "admissions.view_application",
  "accounts.access_admissions",
  "accounts.access_reports",
  "accounts.approve_admissions",
  "accounts.manage_direct_applications",
  "accounts.manage_batches",
]
