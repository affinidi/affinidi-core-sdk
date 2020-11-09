export const generateEmail = () => {
  const TIMESTAMP = Date.now().toString(16).toUpperCase()

  return `test.user-${TIMESTAMP}@gdwk.in`
}
