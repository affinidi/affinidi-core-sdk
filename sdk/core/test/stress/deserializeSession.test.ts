import { writeFileSync } from 'fs'
import pLimit from 'p-limit'
import { AffinidiWalletV6 } from '../helpers/AffinidiWallet'
import { getBasicOptionsForEnvironment, testSecrets } from '../helpers'

const OPERATIONS_COUNT = Number(process.env.DESERIALIZE_SESSION_OPERATIONS_COUNT ?? 1000)
const CONCURRENCY = Number(process.env.DESERIALIZE_SESSION_CONCURRENCY ?? 10)
const LOG_TO_FILE = process.env.LOG_TO_FILE

const { COGNITO_PASSWORD, COGNITO_USERNAME } = testSecrets

const cognitoUsername = COGNITO_USERNAME
const cognitoPassword = COGNITO_PASSWORD

const options = getBasicOptionsForEnvironment()

const bucketsPoints = [0.5, 0.95, 1.8, 3.4, 5.3, 7.8, 9.3, 11.3, 14.5, 18.3, 27.1, 39.3, 47.8, 64.4, 97.1, 137.3, 250.5]
const buckets = bucketsPoints.reduce((acc, e) => ({ ...acc, [e]: 0 }), { errors: 0 }) as any

const createLogger = () => {
  const lines: string[] = []
  return {
    log: (str: string) => {
      lines.push(str)
    },
    saveLogs: () => {
      if (LOG_TO_FILE) {
        const str = lines.join('\n')
        writeFileSync(`./test-result-${new Date().toISOString()}.txt`, str)
      }

      lines.forEach((l) => console.log(l))
    },
  }
}

describe('#NetworkMember.deserializeSession', () => {
  it('should successfully deserializeSession in specificTime', async () => {
    const optionsWithElemDid = Object.assign({}, options, { didMethod: 'elem' } as const)
    const commonNetworkMember = await AffinidiWalletV6.logInWithPassword(
      optionsWithElemDid,
      cognitoUsername,
      cognitoPassword,
    )
    const session = commonNetworkMember.serializeSession()
    const limit = pLimit(CONCURRENCY)
    const { log, saveLogs } = createLogger()

    const test = (i: number) => async () => {
      const start = Date.now()
      await AffinidiWalletV6.deserializeSession(optionsWithElemDid, session).catch((err) => {
        buckets.errors += 1
        log(err.toString())
      })
      const time = Date.now() - start
      bucketsPoints.forEach((e) => {
        if (e > time / 1000) {
          buckets[`${e}`] += 1
        }
      })

      if (i % CONCURRENCY === 0) {
        console.log(`ITERATION NUMBER ${i}`)
      }

      log(`deserialize:${i}: ${time / 1000}s`)
    }

    await Promise.all([...new Array(OPERATIONS_COUNT)].map((_, i) => limit(test(i))))
    log(JSON.stringify(buckets, null, 2))
    saveLogs()
  })
})
