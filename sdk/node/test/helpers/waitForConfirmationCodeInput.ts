export const waitForConfirmationCodeInput = async (): Promise<string> => {
  const systemInput = process.stdin

  return new Promise((resolve) => {
    console.log('Please enter your confirmation code')
    systemInput.on('data', (data) => {
      const result = data.toString().replace('\n', '')
      // process.exit()
      resolve(result)
    })
  })
}
