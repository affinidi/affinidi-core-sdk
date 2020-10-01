export type BaseErrState = {
  success: false
  type: 'income' | 'assets' | 'utility' | 'address' | 'id-document' // Expand as needed
  provider: 'quovo' | 'urjanet' | 'acuant' // Expand as needed
  state: string
  details?: Record<string, any>
}
