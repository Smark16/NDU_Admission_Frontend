import { useEffect, useState } from "react"
import type { AxiosInstance } from "axios"

export interface CatalogCourseUnit {
  id: number
  name: string
  code: string
  credit_units: number | null
  is_active: boolean
}

interface RawCatalogUnit {
  id: number
  title: string
  code: string
  credit_units: number | null
  is_active: boolean
}

export function useCourseCatalog(axios: AxiosInstance) {
  const [loading, setLoading] = useState(true)
  const [catalog, setCatalog] = useState<CatalogCourseUnit[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const { data } = await axios.get<RawCatalogUnit[]>("/api/courses/catalog_course_units", {
          params: { is_active: 1 },
        })
        if (!cancelled) {
          const mapped: CatalogCourseUnit[] = (Array.isArray(data) ? data : []).map((u) => ({
            id: u.id,
            name: u.title,
            code: u.code,
            credit_units: u.credit_units,
            is_active: u.is_active,
          }))
          setCatalog(mapped)
        }
      } catch {
        if (!cancelled) {
          setCatalog([])
          setLoadError("Could not load course catalog")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [axios])

  return { loading, catalog, loadError }
}
