/**
 * Normalize DRF list responses: plain array or paginated { results, count }.
 */
export function asApiList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>
    if (Array.isArray(o.results)) return o.results as T[]
    if (Array.isArray(o.data)) return o.data as T[]
  }
  return []
}
