/** ISO codes for local-fee East African countries (react-select-country-list values). */
export const LOCAL_APPLICANT_COUNTRY_CODES = ["UG", "KE", "TZ"] as const

export type ApplicantCategory = "local" | "international"

export function isLocalCountryOption(option: { label: string; value: string }): boolean {
  return (LOCAL_APPLICANT_COUNTRY_CODES as readonly string[]).includes(option.value)
}

/** Match stored nationality / country picker labels (incl. UN long form for Tanzania). */
export function isLocalNationality(nationality: string): boolean {
  const n = (nationality || "").trim().toLowerCase()
  if (!n) return false
  if (n === "uganda" || n === "kenya") return true
  return n === "tanzania" || n.startsWith("tanzania,") || n.includes("tanzania")
}

export function feeTypeForCategory(category: ApplicantCategory | ""): "Local" | "International" {
  return category === "local" ? "Local" : "International"
}

export function categoryLabel(category: ApplicantCategory | ""): string {
  if (category === "local") return "Local"
  if (category === "international") return "International"
  return ""
}

/** @deprecated Use isLocalNationality — kept for imports that referenced the old constant */
export const LOCAL_APPLICANT_COUNTRIES = ["Uganda", "Kenya", "Tanzania"] as const
