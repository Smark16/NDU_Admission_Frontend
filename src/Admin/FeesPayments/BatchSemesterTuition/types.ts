export interface MatrixRow {
  program_batch_id: number
  program_batch_name: string
  semester_id: number
  semester_name: string
  order: number
  tuition_amount: string
  functional_amount: string
  currency: string
  tuition_amount_international?: string
  tuition_currency_international?: string
  functional_amount_international?: string
  functional_currency_international?: string
}

/** Academic program batch (Year 1, etc.) from Program batches & semesters */
export interface ProgramBatchOption {
  id: number
  name: string
  program_id?: number
  semester_count?: number
}
