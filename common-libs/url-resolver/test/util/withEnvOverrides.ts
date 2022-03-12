const withEnvOverrides =
  <T>(overrides: Record<string, string>, action: () => T) =>
  () => {
    const oldEnv = process.env
    process.env = { ...process.env, ...overrides }
    try {
      return action()
    } finally {
      process.env = oldEnv
    }
  }

export default withEnvOverrides
