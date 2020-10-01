export const errorResp = (id: string, type: Array<string>, status: string, data: Record<string, unknown> = {}) => {
  return { id, type, status, success: false, data: data }
}
