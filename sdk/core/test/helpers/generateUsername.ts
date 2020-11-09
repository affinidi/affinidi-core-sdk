export const generateUsername = () => {
  const TIMESTAMP = Date.now().toString(16).toUpperCase()

  return `test.user-${TIMESTAMP}`
}
