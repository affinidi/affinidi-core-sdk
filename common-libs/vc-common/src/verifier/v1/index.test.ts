import { Secp256k1Key, Secp256k1Signature } from '@affinidi/tiny-lds-ecdsa-secp256k1-2019'
import { parse } from 'did-resolver'

import { VPV1, VCV1, VCV1SubjectBase, GetSignSuiteFn } from '../../'
import { validateVPV1, validateVCV1, GetVerifySuiteFn } from './'
import { Validatied, ErrorConfig } from '../util'
import { buildVCV1, buildVCV1Skeleton, buildVCV1Unsigned, buildVPV1, buildVPV1Unsigned } from '../../issuer'

const jsonld = require('jsonld')

type KeyPair = {
  privateKey: string
  publicKey: string
}

type Users = 'issuer' | 'bob' | 'alice'

type DidConfigs = {
  [key in Users]: {
    did: NonNullable<string>
    didDoc: {
      '@context': string
      id: string
      publicKey: {
        id: string
        usage: string
        type: string
        publicKeyHex: string
      }[]
      authentication: string[]
      assertionMethod: string[]
    }
    primaryKey: KeyPair
    recoveryKey: KeyPair
  }
}

/*
 _____  _                        _   __                     ___                _   _         _     _____                    _  _    _
|_   _|| |                      | | / /                    / _ \              | \ | |       | |   /  ___|                  (_)| |  (_)
  | |  | |__    ___  ___   ___  | |/ /   ___  _   _  ___  / /_\ \ _ __   ___  |  \| |  ___  | |_  \ `--.   ___  _ __   ___  _ | |_  _ __   __  ___
  | |  | '_ \  / _ \/ __| / _ \ |    \  / _ \| | | |/ __| |  _  || '__| / _ \ | . ` | / _ \ | __|  `--. \ / _ \| '_ \ / __|| || __|| |\ \ / / / _ \
  | |  | | | ||  __/\__ \|  __/ | |\  \|  __/| |_| |\__ \ | | | || |   |  __/ | |\  || (_) || |_  /\__/ /|  __/| | | |\__ \| || |_ | | \ V / |  __/
  \_/  |_| |_| \___||___/ \___| \_| \_/ \___| \__, ||___/ \_| |_/|_|    \___| \_| \_/ \___/  \__| \____/  \___||_| |_||___/|_| \__||_|  \_/   \___|
                                               __/ |
                                              |___/

The keys below this message are used to test that key cryptographic functionality does not break.
They are fixtures and should not be considered sensitive.
*/
const didConfigs: DidConfigs = {
  issuer: {
    did:
      'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ',
    didDoc: {
      '@context': 'https://w3id.org/security/v2',
      publicKey: [
        {
          id:
            'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
        },
        {
          id:
            'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ#recovery',
          usage: 'recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
        },
      ],
      authentication: [
        'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ#primary',
      ],
      assertionMethod: [
        'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ#primary',
      ],
      id:
        'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ',
    },
    primaryKey: {
      publicKey: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
      privateKey: 'dbcec07b9f9816ac5cec1dadadde64fc0ed610be39b06a77a238e95df36d774a',
    },
    recoveryKey: {
      publicKey: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
      privateKey: '03f8547441c20a6be216d8335e9dd96021a0a5de84db12bbe40af1bb7cbdc276',
    },
  },
  alice: {
    did:
      'did:elem:EiCQUcWpx_z9eSIAHzcKKwTjwNa2IyCmc2SlV8STyXzpyg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVpqaGpNRFZpWXpOa01XSXdaV05oTTJRelpESTBaVFExWXpReE5EVXpNbVUzWm1aaU56a3pNRFZqTlRFNE5HTXdOV0ppTVRnM05EY3labUkwTnpkak1DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpRNVlqazROR1ppTW1FMlpEaG1ObVJpT1RJeE1HWTJaVFUzTWprNU9HVTVZelUzWkRSa05UZzJNMk5rTWpOak9EZzJaRFF3WWpZek9EazJZemN3T0dVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRVFRRG9mQXc0aVRWc090WlA5emFkZkRwc0dWVjBCa3FmOXU5Vm5waEZMeFh0cXZjZWpzcFdfZ3F2bFJVUmVVOHpjbmtGU0FtY2RXeFducUZtdUdvREEifQ',
    didDoc: {
      '@context': 'https://w3id.org/security/v2',
      publicKey: [
        {
          id:
            'did:elem:EiCQUcWpx_z9eSIAHzcKKwTjwNa2IyCmc2SlV8STyXzpyg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVpqaGpNRFZpWXpOa01XSXdaV05oTTJRelpESTBaVFExWXpReE5EVXpNbVUzWm1aaU56a3pNRFZqTlRFNE5HTXdOV0ppTVRnM05EY3labUkwTnpkak1DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpRNVlqazROR1ppTW1FMlpEaG1ObVJpT1RJeE1HWTJaVFUzTWprNU9HVTVZelUzWkRSa05UZzJNMk5rTWpOak9EZzJaRFF3WWpZek9EazJZemN3T0dVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRVFRRG9mQXc0aVRWc090WlA5emFkZkRwc0dWVjBCa3FmOXU5Vm5waEZMeFh0cXZjZWpzcFdfZ3F2bFJVUmVVOHpjbmtGU0FtY2RXeFducUZtdUdvREEifQ#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '02f8c05bc3d1b0eca3d3d24e45c414532e7ffb79305c5184c05bb187472fb477c0',
        },
        {
          id:
            'did:elem:EiCQUcWpx_z9eSIAHzcKKwTjwNa2IyCmc2SlV8STyXzpyg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVpqaGpNRFZpWXpOa01XSXdaV05oTTJRelpESTBaVFExWXpReE5EVXpNbVUzWm1aaU56a3pNRFZqTlRFNE5HTXdOV0ppTVRnM05EY3labUkwTnpkak1DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpRNVlqazROR1ppTW1FMlpEaG1ObVJpT1RJeE1HWTJaVFUzTWprNU9HVTVZelUzWkRSa05UZzJNMk5rTWpOak9EZzJaRFF3WWpZek9EazJZemN3T0dVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRVFRRG9mQXc0aVRWc090WlA5emFkZkRwc0dWVjBCa3FmOXU5Vm5waEZMeFh0cXZjZWpzcFdfZ3F2bFJVUmVVOHpjbmtGU0FtY2RXeFducUZtdUdvREEifQ#recovery',
          usage: 'recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '0349b984fb2a6d8f6db9210f6e572998e9c57d4d5863cd23c886d40b63896c708e',
        },
      ],
      authentication: [
        'did:elem:EiCQUcWpx_z9eSIAHzcKKwTjwNa2IyCmc2SlV8STyXzpyg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVpqaGpNRFZpWXpOa01XSXdaV05oTTJRelpESTBaVFExWXpReE5EVXpNbVUzWm1aaU56a3pNRFZqTlRFNE5HTXdOV0ppTVRnM05EY3labUkwTnpkak1DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpRNVlqazROR1ppTW1FMlpEaG1ObVJpT1RJeE1HWTJaVFUzTWprNU9HVTVZelUzWkRSa05UZzJNMk5rTWpOak9EZzJaRFF3WWpZek9EazJZemN3T0dVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRVFRRG9mQXc0aVRWc090WlA5emFkZkRwc0dWVjBCa3FmOXU5Vm5waEZMeFh0cXZjZWpzcFdfZ3F2bFJVUmVVOHpjbmtGU0FtY2RXeFducUZtdUdvREEifQ#primary',
      ],
      assertionMethod: [
        'did:elem:EiCQUcWpx_z9eSIAHzcKKwTjwNa2IyCmc2SlV8STyXzpyg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVpqaGpNRFZpWXpOa01XSXdaV05oTTJRelpESTBaVFExWXpReE5EVXpNbVUzWm1aaU56a3pNRFZqTlRFNE5HTXdOV0ppTVRnM05EY3labUkwTnpkak1DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpRNVlqazROR1ppTW1FMlpEaG1ObVJpT1RJeE1HWTJaVFUzTWprNU9HVTVZelUzWkRSa05UZzJNMk5rTWpOak9EZzJaRFF3WWpZek9EazJZemN3T0dVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRVFRRG9mQXc0aVRWc090WlA5emFkZkRwc0dWVjBCa3FmOXU5Vm5waEZMeFh0cXZjZWpzcFdfZ3F2bFJVUmVVOHpjbmtGU0FtY2RXeFducUZtdUdvREEifQ#primary',
      ],
      id:
        'did:elem:EiCQUcWpx_z9eSIAHzcKKwTjwNa2IyCmc2SlV8STyXzpyg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVpqaGpNRFZpWXpOa01XSXdaV05oTTJRelpESTBaVFExWXpReE5EVXpNbVUzWm1aaU56a3pNRFZqTlRFNE5HTXdOV0ppTVRnM05EY3labUkwTnpkak1DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpRNVlqazROR1ppTW1FMlpEaG1ObVJpT1RJeE1HWTJaVFUzTWprNU9HVTVZelUzWkRSa05UZzJNMk5rTWpOak9EZzJaRFF3WWpZek9EazJZemN3T0dVaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRVFRRG9mQXc0aVRWc090WlA5emFkZkRwc0dWVjBCa3FmOXU5Vm5waEZMeFh0cXZjZWpzcFdfZ3F2bFJVUmVVOHpjbmtGU0FtY2RXeFducUZtdUdvREEifQ',
    },
    primaryKey: {
      publicKey: '02f8c05bc3d1b0eca3d3d24e45c414532e7ffb79305c5184c05bb187472fb477c0',
      privateKey: '1776a50de186e71747ae25cd64be98b951556a792a17963481fa9ad901bfd7ee',
    },
    recoveryKey: {
      publicKey: '0349b984fb2a6d8f6db9210f6e572998e9c57d4d5863cd23c886d40b63896c708e',
      privateKey: '8d360a3c05481a48378c14a2e1b8236ebea3a2ce0b8fc2a445146bc62ebb3c5a',
    },
  },
  bob: {
    did:
      'did:elem:EiA_Xc2i3jvnvKvxoLvhzrsYTWEy4YFEI_qJSAi5Ev16cA;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelpERTBaRE0zWkdWaFpEQXhabVkzTUdaa1lUSmhOVGMyTm1ZeU5XSTNNalk1TldaaE0yRmhNRGMwTm1SbE5EVXhOemcwWldWaE9UQmhZalEwTURGaE9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1RMU1tTm1OR0prWVdWbU1HSTVNamszT1RVek9XVTJZMlExWVdOaU5qQXhOakU0TjJVek9XWTNNR1kyTXpVMVptTXlOell4Wm1VM056Y3dZekZtTldZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiM0dUX29xcjJQMmNSOUIyd2tEWG9LaXNpZ00yZm0zTHlySkV1cDZrdFJMUW9PZWt3eVljR3lKdzdTeWxyNmhyUDdJclozczRIdXFPdDJtRzlDZXNmZVEifQ',
    didDoc: {
      '@context': 'https://w3id.org/security/v2',
      publicKey: [
        {
          id:
            'did:elem:EiA_Xc2i3jvnvKvxoLvhzrsYTWEy4YFEI_qJSAi5Ev16cA;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelpERTBaRE0zWkdWaFpEQXhabVkzTUdaa1lUSmhOVGMyTm1ZeU5XSTNNalk1TldaaE0yRmhNRGMwTm1SbE5EVXhOemcwWldWaE9UQmhZalEwTURGaE9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1RMU1tTm1OR0prWVdWbU1HSTVNamszT1RVek9XVTJZMlExWVdOaU5qQXhOakU0TjJVek9XWTNNR1kyTXpVMVptTXlOell4Wm1VM056Y3dZekZtTldZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiM0dUX29xcjJQMmNSOUIyd2tEWG9LaXNpZ00yZm0zTHlySkV1cDZrdFJMUW9PZWt3eVljR3lKdzdTeWxyNmhyUDdJclozczRIdXFPdDJtRzlDZXNmZVEifQ#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '03d14d37dead01ff70fda2a5766f25b72695fa3aa0746de451784eea90ab4401a9',
        },
        {
          id:
            'did:elem:EiA_Xc2i3jvnvKvxoLvhzrsYTWEy4YFEI_qJSAi5Ev16cA;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelpERTBaRE0zWkdWaFpEQXhabVkzTUdaa1lUSmhOVGMyTm1ZeU5XSTNNalk1TldaaE0yRmhNRGMwTm1SbE5EVXhOemcwWldWaE9UQmhZalEwTURGaE9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1RMU1tTm1OR0prWVdWbU1HSTVNamszT1RVek9XVTJZMlExWVdOaU5qQXhOakU0TjJVek9XWTNNR1kyTXpVMVptTXlOell4Wm1VM056Y3dZekZtTldZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiM0dUX29xcjJQMmNSOUIyd2tEWG9LaXNpZ00yZm0zTHlySkV1cDZrdFJMUW9PZWt3eVljR3lKdzdTeWxyNmhyUDdJclozczRIdXFPdDJtRzlDZXNmZVEifQ#recovery',
          usage: 'recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '02d52cf4bdaef0b92979539e6cd5acb6016187e39f70f6355fc2761fe7770c1f5f',
        },
      ],
      authentication: [
        'did:elem:EiA_Xc2i3jvnvKvxoLvhzrsYTWEy4YFEI_qJSAi5Ev16cA;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelpERTBaRE0zWkdWaFpEQXhabVkzTUdaa1lUSmhOVGMyTm1ZeU5XSTNNalk1TldaaE0yRmhNRGMwTm1SbE5EVXhOemcwWldWaE9UQmhZalEwTURGaE9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1RMU1tTm1OR0prWVdWbU1HSTVNamszT1RVek9XVTJZMlExWVdOaU5qQXhOakU0TjJVek9XWTNNR1kyTXpVMVptTXlOell4Wm1VM056Y3dZekZtTldZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiM0dUX29xcjJQMmNSOUIyd2tEWG9LaXNpZ00yZm0zTHlySkV1cDZrdFJMUW9PZWt3eVljR3lKdzdTeWxyNmhyUDdJclozczRIdXFPdDJtRzlDZXNmZVEifQ#primary',
      ],
      assertionMethod: [
        'did:elem:EiA_Xc2i3jvnvKvxoLvhzrsYTWEy4YFEI_qJSAi5Ev16cA;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelpERTBaRE0zWkdWaFpEQXhabVkzTUdaa1lUSmhOVGMyTm1ZeU5XSTNNalk1TldaaE0yRmhNRGMwTm1SbE5EVXhOemcwWldWaE9UQmhZalEwTURGaE9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1RMU1tTm1OR0prWVdWbU1HSTVNamszT1RVek9XVTJZMlExWVdOaU5qQXhOakU0TjJVek9XWTNNR1kyTXpVMVptTXlOell4Wm1VM056Y3dZekZtTldZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiM0dUX29xcjJQMmNSOUIyd2tEWG9LaXNpZ00yZm0zTHlySkV1cDZrdFJMUW9PZWt3eVljR3lKdzdTeWxyNmhyUDdJclozczRIdXFPdDJtRzlDZXNmZVEifQ#primary',
      ],
      id:
        'did:elem:EiA_Xc2i3jvnvKvxoLvhzrsYTWEy4YFEI_qJSAi5Ev16cA;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelpERTBaRE0zWkdWaFpEQXhabVkzTUdaa1lUSmhOVGMyTm1ZeU5XSTNNalk1TldaaE0yRmhNRGMwTm1SbE5EVXhOemcwWldWaE9UQmhZalEwTURGaE9TSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1RMU1tTm1OR0prWVdWbU1HSTVNamszT1RVek9XVTJZMlExWVdOaU5qQXhOakU0TjJVek9XWTNNR1kyTXpVMVptTXlOell4Wm1VM056Y3dZekZtTldZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiM0dUX29xcjJQMmNSOUIyd2tEWG9LaXNpZ00yZm0zTHlySkV1cDZrdFJMUW9PZWt3eVljR3lKdzdTeWxyNmhyUDdJclozczRIdXFPdDJtRzlDZXNmZVEifQ',
    },
    primaryKey: {
      publicKey: '03d14d37dead01ff70fda2a5766f25b72695fa3aa0746de451784eea90ab4401a9',
      privateKey: 'a95ba5e9a5d0d280fbc04400818590b99674e23f09f27fe3280dbdfe943fabed',
    },
    recoveryKey: {
      publicKey: '02d52cf4bdaef0b92979539e6cd5acb6016187e39f70f6355fc2761fe7770c1f5f',
      privateKey: '7415d104d4d64c77387cad0d60418774d578104c75ea42ba42d74bae331ea1c6',
    },
  },
}
/*
 _____             _           __    __  _        _
|  ___|           | |         / _|  / _|(_)      | |
| |__   _ __    __| |   ___  | |_  | |_  _ __  __| |_  _   _  _ __   ___  ___
|  __| | '_ \  / _` |  / _ \ |  _| |  _|| |\ \/ /| __|| | | || '__| / _ \/ __|
| |___ | | | || (_| | | (_) || |   | |  | | >  < | |_ | |_| || |   |  __/\__ \
\____/ |_| |_| \__,_|  \___/ |_|   |_|  |_|/_/\_\ \__| \__,_||_|    \___||___/


*/

const documentLoader = async (url: string): Promise<any> => {
  if (url.startsWith('did:')) {
    const didDocs = Object.keys(didConfigs).map((key) => didConfigs[key as Users].didDoc)
    const didDocument = didDocs.find((didDoc) => {
      // Super basic stripping of hash at the end of a DID key, only for testing!
      if (url.indexOf('#') >= 0) {
        return didDoc.id === url.substr(0, url.indexOf('#'))
      }

      return didDoc.id === url
    })

    return {
      contextUrl: null,
      document: didDocument,
      documentUrl: url,
    }
  }

  if (url === 'https://example.com') {
    return {
      contextUrl: null,
      document: {},
      documentUrl: url,
    }
  }

  const res = await jsonld.documentLoaders.node()(url)

  return res
}

type Signer = {
  did: string
  keyId: string
  privateKey: string
}

type Holder = {
  did: string
}

const getSignSuite: GetSignSuiteFn = async ({ controller, keyId, privateKey }) =>
  new Secp256k1Signature({
    key: new Secp256k1Key({
      id: keyId,
      controller: controller,
      privateKeyHex: privateKey,
    }),
  })

const getVerifySuite: GetVerifySuiteFn = async ({ controller, verificationMethod }) => {
  // Essentially resolving the controller
  const didDocs = Object.keys(didConfigs).map((key) => didConfigs[key as Users].didDoc)
  const didDoc = didDocs.find((didDoc) => didDoc.id === controller)

  if (!didDoc) throw Error(`Could not find DID doc for ${controller}`)

  // Get the public key from the DID doc, because that's how it'll be done outside of tests
  const publicKey = didDoc.publicKey.find(({ id }) => id === verificationMethod)

  if (!publicKey) throw Error(`Could not find public key for doc for ${verificationMethod}`)

  return new Secp256k1Signature({
    key: new Secp256k1Key({
      id: verificationMethod,
      controller: controller,
      publicKeyHex: publicKey.publicKeyHex,
    }),
  })
}

const getVerifySuiteBad: GetVerifySuiteFn = () => {
  throw new Error('Error')
}

const createVC = async (
  issuer: Signer,
  holder: Holder,
  options: {
    exirationDate?: boolean
    revocation?: boolean
  } = {},
): Promise<VCV1> => {
  const signed = await buildVCV1({
    unsigned: buildVCV1Unsigned({
      skeleton: buildVCV1Skeleton({
        id: 'urn:uuid:75442486-0878-440c-9db1-a7006c25a39f',
        holder: {
          id: holder.did,
        },
        credentialSubject: {
          id: holder.did,
          data: {
            '@type': 'Person',
          },
        },
        type: ['CustomCredential'],
        context: {
          '@version': 1.1,

          CustomCredential: {
            '@id': 'https://example.com/CustomCredential',
            '@context': {
              '@version': 1.1,
              '@protected': true,
            },
          },

          OtherType: {
            '@id': 'https://example.com/OtherType',
            '@context': {
              '@version': 1.1,
              '@protected': true,
            },
          },

          data: {
            '@id': 'https://example.com/data',
            '@type': '@json',
          },
          revocation: {
            '@id': 'https://example.com/revocation',
            '@type': '@json',
          },
        } as any,
      }),
      issuanceDate: new Date().toISOString(),
      expirationDate: options.exirationDate ? new Date(new Date().getTime() + 10000).toISOString() : undefined,
      revocation: options.revocation ? { id: 'urn:uuid:004aadf4-8e1a-4450-905b-6039179f52da' } : undefined,
    }),
    issuer,
    documentLoader,
    getSignSuite,
  })

  return signed
}

const createVP = async (sharer: Signer, ...vcs: VCV1<any>[]): Promise<VPV1> => {
  const signed = await buildVPV1({
    unsigned: buildVPV1Unsigned({
      id: 'urn:uuid:11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
      vcs,
      holder: { id: sharer.did },
      presentation_submission: {
        locale: 'locale',
        descriptor_map: [
          {
            id: 'id',
            path: 'path',
            format: 'jwt',
          },
          {
            id: 'id',
            path: 'path',
            format: 'jwt_vc',
          },
          {
            id: 'id',
            path: 'path',
            format: 'jwt_vp',
          },
          {
            id: 'id',
            path: 'path',
            format: 'ldp',
          },
          {
            id: 'id',
            path: 'path',
            format: 'ldp_vc',
          },
          {
            id: 'id',
            path: 'path',
            format: 'ldp_vp',
          },
          {
            id: 'id',
            path_nested: {
              id: 'id',
              path: 'path',
              format: 'jwt',
            },
            path: 'path',
            format: 'jwt',
          },
          {
            id: 'id',
            path_nested: {
              id: 'id',
              path: 'path',
              format: 'jwt_vc',
            },
            path: 'path',
            format: 'jwt',
          },
          {
            id: 'id',
            path_nested: {
              id: 'id',
              path: 'path',
              format: 'jwt_vp',
            },
            path: 'path',
            format: 'jwt',
          },
          {
            id: 'id',
            path_nested: {
              id: 'id',
              path: 'path',
              format: 'ldp',
            },
            path: 'path',
            format: 'jwt',
          },
          {
            id: 'id',
            path_nested: {
              id: 'id',
              path: 'path',
              format: 'ldp_vc',
            },
            path: 'path',
            format: 'jwt',
          },
          {
            id: 'id',
            path_nested: {
              id: 'id',
              path: 'path',
              format: 'ldp_vp',
            },
            path: 'path',
            format: 'jwt',
          },
        ],
      },
    }),
    documentLoader,
    getSignSuite,
    holder: sharer,
    getProofPurposeOptions: () => ({
      challenge: 'challenge',
      domain: 'domain',
    }),
  })

  return signed
}

const expectToBeInvalidWith = <T>(res: Validatied<T>, ...errors: ErrorConfig[]) => {
  if (res.kind === 'invalid') {
    for (const error of errors) {
      expect(res.errors).toContainEqual(error)
    }
  } else {
    fail('Expected to be invalid')
  }
}

describe('validateVCV1', () => {
  it('validates a valid VC', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
    )

    // Verify the VC
    const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

    if (res.kind === 'invalid') {
      res.errors.map(({ kind, message }) => console.log(`${kind}: ${message}`))
    }

    expect(res.kind).toEqual('valid')
  })

  it('validates a valid VC with an exiration date', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
      { exirationDate: true },
    )

    // Verify the VC
    const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

    expect(res.kind).toEqual('valid')
  })

  it('validates a valid VC with revocation', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
      { revocation: true },
    )

    // Verify the VC
    const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

    expect(res.kind).toEqual('valid')
  })

  it('fails when context is invalid', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
    )

    vc['@context'] = ''

    // Verify the VC
    const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

    expectToBeInvalidWith(res, {
      kind: 'invalid_param',
      message:
        'Invalid value for field "@context": Expected to be string or object OR an array of strings and/or objects',
    })
  })

  it('fails when id is invalid', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
    )

    vc.id = ''

    // Verify the VC
    const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

    expectToBeInvalidWith(res, {
      kind: 'invalid_param',
      message: 'Invalid value for field "id": Expected non empty string',
    })
  })

  describe('fails when type is invalid', () => {
    it('with empty string', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.type.push('')

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "type": One or more items failed validation: Expected non empty string',
      })
    })

    it('when missing "VerifiableCredential"', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.type = ['OtherCredential'] as any

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "type": Expected to contain: "VerifiableCredential"',
      })
    })
  })

  describe('fails when holder is invalid', () => {
    it('with an empty id', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.holder.id = ''

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "holder": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected non empty string\ninvalid_param: Invalid value for field "id": Expected to start with "did:"',
      })
    })

    it("with an id that doesn't start with did:", async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.holder.id = '1234'

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "holder": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected to start with "did:"',
      })
    })
  })

  describe('fails when issuer is invalid', () => {
    it('with an empty string', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.issuer = ''

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "issuer": Expected non empty string',
      })
    })

    it("with an id that doesn't start with did:", async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.issuer = '1234'

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "issuer": Expected to start with "did:"',
      })
    })
  })

  describe('fails when issuanceDate is invalid', () => {
    it('with an empty string', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.issuanceDate = ''

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "issuanceDate": Expected non empty string',
      })
    })
  })

  describe('fails when expirationDate is invalid', () => {
    it('with an empty string', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.expirationDate = ''

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "expirationDate": Expected non empty string',
      })
    })

    it('with an old date', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.expirationDate = new Date(new Date().getTime() - 1000).toISOString()

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: `Invalid value for field "expirationDate": Credential "${vc.id}" is expired.`,
      })
    })
  })

  describe('fails when credentialSubject is invalid', () => {
    it('with an empty id', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      if (Array.isArray(vc.credentialSubject)) {
        vc.credentialSubject.forEach((sub) => {
          sub.id = ''
        })
      } else {
        vc.credentialSubject.id = ''
      }

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "credentialSubject": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected non empty string\ninvalid_param: Invalid value for field "id": Expected to start with "did:"',
      })
    })

    it("with a id that isn't a DID", async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      if (Array.isArray(vc.credentialSubject)) {
        vc.credentialSubject.forEach((sub) => {
          sub.id = '1234'
        })
      } else {
        vc.credentialSubject.id = '1234'
      }

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "credentialSubject": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected to start with "did:"',
      })
    })

    it('with invalid data', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      if (Array.isArray(vc.credentialSubject)) {
        vc.credentialSubject.forEach((sub) => {
          sub.data['@type'] = ''
        })
      } else {
        vc.credentialSubject.data['@type'] = ''
      }

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "credentialSubject": The following errors have occurred:\ninvalid_param: Invalid value for field "data": The following errors have occurred:\ninvalid_param: Invalid value for field "@type": Item failed all validators:\nExpected non empty string\nOR\nExpected to be an array',
      })
    })
  })

  describe('fails with an invalid revocation', () => {
    it('when id is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.revocation = { id: '' }

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "revocation": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected non empty string',
      })
    })
  })

  describe('fails with an invalid proof', () => {
    describe('when the top level fields are tampered with', () => {
      it('(issuanceDate/string value)', async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Verify the VC
        const res = await validateVCV1({ documentLoader, getVerifySuite })({
          ...vc,
          issuanceDate: new Date(0).toISOString(),
        })

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message: 'Invalid value for field "proof": Invalid credential proof:\nError: Invalid signature.',
        })
      })

      it.skip('(types/array value)', async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Verify the VC
        const res = await validateVCV1({ documentLoader, getVerifySuite })({
          ...vc,
          type: [...vc.type, 'OtherType'],
        })

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message: 'Invalid value for field "proof": Invalid credential proof:\nError: Invalid signature.',
        })
      })
    })

    it('when the content are tampered with', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })({
        ...vc,
        credentialSubject: {
          ...vc.credentialSubject,
          data: {
            ...(vc.credentialSubject as VCV1SubjectBase).data,
            otherField: 'invalid',
          },
        },
      })

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "proof": Invalid credential proof:\nError: Invalid signature.',
      })
    })

    it('when type is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.proof.type = ''

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "type": Expected non empty string',
      })
    })

    it('when created is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.proof.created = ''

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "created": Expected non empty string',
      })
    })

    it('when proofPurpose is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.proof.proofPurpose = '' as any

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "proofPurpose": Expected non empty string\ninvalid_param: Invalid value for field "proofPurpose": Expected to be "assertionMethod"',
      })
    })

    it('when proofPurpose is not assertionMethod', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.proof.proofPurpose = 'purpose' as any

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "proofPurpose": Expected to be "assertionMethod"',
      })
    })

    it('when verification is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.proof.verificationMethod = ''

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "verificationMethod": Expected non empty string\ninvalid_param: Invalid value for field "verificationMethod": Expected to start with "did:"',
      })
    })

    it('when verification is not a DID', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.proof.verificationMethod = '1234'

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "verificationMethod": Expected to start with "did:"',
      })
    })

    it('when jws is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      if ('jws' in vc.proof) {
        vc.proof.jws = ''
      }

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "jws": Expected non empty string',
      })
    })

    it('when jws is invalid', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      if ('jws' in vc.proof) {
        vc.proof.jws = vc.proof.jws.substr(0, vc.proof.jws.length - 1)
      }

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vc)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "proof": Invalid credential proof:\nError: Invalid signature.',
      })
    })
  })

  it('fails when getVerifySuite throws', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
    )

    // Verify the VC
    const res = await validateVCV1({ documentLoader, getVerifySuite: getVerifySuiteBad })(vc)

    expectToBeInvalidWith(res, {
      kind: 'invalid_param',
      message:
        'Invalid value for field "proof": Error while validating proof: Error: Error while getting verify suite Error: Error',
    })
  })
})

describe('validateVPV1', () => {
  it('validates a valid VP', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
    )

    // Bob creates a VP containing his VC
    const vp = await createVP(
      {
        did: bob.did,
        keyId: `${bob.did}#primary`,
        privateKey: bob.primaryKey.privateKey,
      },
      vc,
    )

    // Verify the VP
    const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

    expect(res.kind).toEqual('valid')
  })

  it("validates a valid VP when holder DIDs don't match but are still the same DID", async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs

    const parsed = parse(bob.did)
    // TS assertion
    if (!parsed) {
      fail('unable to parse bob.did')
    }

    const shortFormDid = parsed.did

    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      {
        // Provide the short form DID here becuase VP.holder.id needs to be resolvable
        did: shortFormDid,
      },
    )

    // Bob creates a VP containing his VC
    const vp = await createVP(
      {
        did: bob.did,
        keyId: `${bob.did}#primary`,
        privateKey: bob.primaryKey.privateKey,
      },
      vc,
    )

    // Verify the VP
    const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

    expect(res.kind).toEqual('valid')
  })

  it('fails when @context is invalid', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
    )

    // Bob creates a VP containing his VC
    const vp = await createVP(
      {
        did: bob.did,
        keyId: `${bob.did}#primary`,
        privateKey: bob.primaryKey.privateKey,
      },
      vc,
    )

    vp['@context'] = ''

    // Verify the VP
    const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

    expectToBeInvalidWith(res, {
      kind: 'invalid_param',
      message:
        'Invalid value for field "@context": Expected to be string or object OR an array of strings and/or objects',
    })
  })

  describe('fails when type is invalid', () => {
    it('with empty string', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.type.push('')

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "type": One or more items failed validation: Expected non empty string',
      })
    })

    it('when missing "VerifiableCredential"', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.type = ['OtherCredential'] as any

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "type": Expected to contain: "VerifiablePresentation"',
      })
    })
  })

  describe('fails when holder is invalid', () => {
    it('with an empty id', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.holder.id = ''

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "holder": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected non empty string\ninvalid_param: Invalid value for field "id": Expected to start with "did:"',
      })
    })

    it("with an id that doesn't start with did:", async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.holder.id = '1234'

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "holder": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected to start with "did:"',
      })
    })
  })

  describe('fails when presentation_submission is invalid', () => {
    it('with an empty locale', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.presentation_submission = {
        locale: '',
        descriptor_map: [...(vp.presentation_submission?.descriptor_map || [])],
      }

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "presentation_submission": The following errors have occurred:\ninvalid_param: Invalid value for field "locale": Expected non empty string',
      })
    })

    describe('with an invalid descriptor_map', () => {
      it("when it's not an array", async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Bob creates a VP containing his VC
        const vp = await createVP(
          {
            did: bob.did,
            keyId: `${bob.did}#primary`,
            privateKey: bob.primaryKey.privateKey,
          },
          vc,
        )

        vp.presentation_submission = {
          locale: vp.presentation_submission?.locale || 'locale',
          descriptor_map: 'descriptor_map' as any,
        }

        // Verify the VP
        const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message:
            'Invalid value for field "presentation_submission": The following errors have occurred:\ninvalid_param: Invalid value for field "descriptor_map": Expected to be an array',
        })
      })

      it('when id is empty', async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Bob creates a VP containing his VC
        const vp = await createVP(
          {
            did: bob.did,
            keyId: `${bob.did}#primary`,
            privateKey: bob.primaryKey.privateKey,
          },
          vc,
        )

        vp.presentation_submission = {
          locale: vp.presentation_submission?.locale || 'locale',
          descriptor_map: [
            {
              id: '',
              path: 'path',
              format: 'jwt',
            },
          ],
        }

        // Verify the VP
        const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message:
            'Invalid value for field "presentation_submission": The following errors have occurred:\ninvalid_param: Invalid value for field "descriptor_map": One or more items failed validation: The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected non empty string',
        })
      })

      it('when path is empty', async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Bob creates a VP containing his VC
        const vp = await createVP(
          {
            did: bob.did,
            keyId: `${bob.did}#primary`,
            privateKey: bob.primaryKey.privateKey,
          },
          vc,
        )

        vp.presentation_submission = {
          locale: vp.presentation_submission?.locale || 'locale',
          descriptor_map: [
            {
              id: 'id',
              path: '',
              format: 'jwt',
            },
          ],
        }

        // Verify the VP
        const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message:
            'Invalid value for field "presentation_submission": The following errors have occurred:\ninvalid_param: Invalid value for field "descriptor_map": One or more items failed validation: The following errors have occurred:\ninvalid_param: Invalid value for field "path": Expected non empty string',
        })
      })

      it('when format is invalid', async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Bob creates a VP containing his VC
        const vp = await createVP(
          {
            did: bob.did,
            keyId: `${bob.did}#primary`,
            privateKey: bob.primaryKey.privateKey,
          },
          vc,
        )

        vp.presentation_submission = {
          locale: vp.presentation_submission?.locale || 'locale',
          descriptor_map: [
            {
              id: 'id',
              path: 'path',
              format: 'invalid' as any,
            },
          ],
        }

        // Verify the VP
        const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message:
            'Invalid value for field "presentation_submission": The following errors have occurred:\ninvalid_param: Invalid value for field "descriptor_map": One or more items failed validation: The following errors have occurred:\ninvalid_param: Invalid value for field "format": Expected a value to be one of: jwt, jwt_vc, jwt_vp, ldp, ldp_vc, ldp_vp',
        })
      })

      it('when path_nested is invalid', async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Bob creates a VP containing his VC
        const vp = await createVP(
          {
            did: bob.did,
            keyId: `${bob.did}#primary`,
            privateKey: bob.primaryKey.privateKey,
          },
          vc,
        )

        vp.presentation_submission = {
          locale: vp.presentation_submission?.locale || 'locale',
          descriptor_map: [
            {
              id: 'id',
              path: 'path',
              format: 'jwt',
              path_nested: {
                id: '',
                path: 'path',
                format: 'jwt',
              },
            },
          ],
        }

        // Verify the VP
        const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message:
            'Invalid value for field "presentation_submission": The following errors have occurred:\ninvalid_param: Invalid value for field "descriptor_map": One or more items failed validation: The following errors have occurred:\ninvalid_param: Invalid value for field "path_nested": The following errors have occurred:\ninvalid_param: Invalid value for field "id": Expected non empty string',
        })
      })
    })
  })

  describe('fails with invalid verifiableCredential', () => {
    it("when it's not an array", async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.verifiableCredential = vc as any

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "verifiableCredential": Expected to be an array',
      })
    })

    it('when a VC is invalid', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      vc.type.push('')

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "verifiableCredential": One or more items failed validation: The following errors have occurred:\ninvalid_param: Invalid value for field "type": One or more items failed validation: Expected non empty string',
      })
    })

    it('when a VC is issued to someone else', async () => {
      expect.assertions(1)

      const { issuer, bob, alice } = didConfigs
      // Issue a VC to alice
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: alice.did },
      )

      // Bob creates a VP containing _alice's_ VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: `Invalid value for field "verifiableCredential": One or more items failed validation: Credential ${vc.id} has a different holder than the VP`,
      })
    })
  })

  describe('fails with an invalid proof', () => {
    describe('when the top level fields are tampered with', () => {
      it.skip('(type/array value)', async () => {
        expect.assertions(1)

        const { issuer, bob } = didConfigs
        // Issue a VC to bob
        const vc = await createVC(
          {
            did: issuer.did,
            keyId: `${issuer.did}#primary`,
            privateKey: issuer.primaryKey.privateKey,
          },
          { did: bob.did },
        )

        // Bob creates a VP containing his VC
        const vp = await createVP(
          {
            did: bob.did,
            keyId: `${bob.did}#primary`,
            privateKey: bob.primaryKey.privateKey,
          },
          vc,
        )

        // Verify the VP
        const res = await validateVPV1({ documentLoader, getVerifySuite })({
          ...vp,
          type: [...vp.type, 'OtherType'],
        })

        expectToBeInvalidWith(res, {
          kind: 'invalid_param',
          message: 'Invalid value for field "proof": Invalid presentation proof:\nError: Invalid signature.',
        })
      })
    })

    it('when the content is tampered with', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })({
        ...vp,
        verifiableCredential: [
          {
            ...vp.verifiableCredential[0],
            credentialSubject: {
              ...vp.verifiableCredential[0].credentialSubject,
              data: {
                ...(vp.verifiableCredential[0].credentialSubject as VCV1SubjectBase).data,
                otherField: 'invalid',
              },
            },
          },
        ],
      })

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "proof": Invalid presentation proof:\nError: Invalid signature.',
      })
    })

    it('when type is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.type = ''

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "type": Expected non empty string',
      })
    })

    it('when created is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.created = ''

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "created": Expected non empty string',
      })
    })

    it('when proofPurpose is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.proofPurpose = '' as any

      // Verify the VC
      const res = await validateVCV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "proofPurpose": Expected non empty string\ninvalid_param: Invalid value for field "proofPurpose": Expected to be "assertionMethod"',
      })
    })

    it('when proofPurpose is not authentication', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.proofPurpose = 'purpose' as any

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "proofPurpose": Expected to be "authentication"',
      })
    })

    it('when verificationMethod is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.verificationMethod = ''

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "verificationMethod": Expected non empty string\ninvalid_param: Invalid value for field "verificationMethod": Expected to start with "did:"',
      })
    })

    it('when verificationMethod is not a DID', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.verificationMethod = '1234'

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "verificationMethod": Expected to start with "did:"',
      })
    })

    it('when challenge is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.challenge = ''

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "challenge": Expected non empty string',
      })
    })

    it('when domain is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.domain = ''

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "domain": Expected non empty string',
      })
    })

    it('when jws is empty', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.jws = ''

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message:
          'Invalid value for field "proof": The following errors have occurred:\ninvalid_param: Invalid value for field "jws": Expected non empty string',
      })
    })

    it('when jws is invalid', async () => {
      expect.assertions(1)

      const { issuer, bob } = didConfigs
      // Issue a VC to bob
      const vc = await createVC(
        {
          did: issuer.did,
          keyId: `${issuer.did}#primary`,
          privateKey: issuer.primaryKey.privateKey,
        },
        { did: bob.did },
      )

      // Bob creates a VP containing his VC
      const vp = await createVP(
        {
          did: bob.did,
          keyId: `${bob.did}#primary`,
          privateKey: bob.primaryKey.privateKey,
        },
        vc,
      )

      vp.proof.jws = vp.proof.jws.substr(0, vp.proof.jws.length - 1)

      // Verify the VP
      const res = await validateVPV1({ documentLoader, getVerifySuite })(vp)

      expectToBeInvalidWith(res, {
        kind: 'invalid_param',
        message: 'Invalid value for field "proof": Invalid presentation proof:\nError: Invalid signature.',
      })
    })
  })

  it('fails when getVerifySuite throws', async () => {
    expect.assertions(1)

    const { issuer, bob } = didConfigs
    // Issue a VC to bob
    const vc = await createVC(
      {
        did: issuer.did,
        keyId: `${issuer.did}#primary`,
        privateKey: issuer.primaryKey.privateKey,
      },
      { did: bob.did },
    )

    // Bob creates a VP containing his VC
    const vp = await createVP(
      {
        did: bob.did,
        keyId: `${issuer.did}#primary`,
        privateKey: bob.primaryKey.privateKey,
      },
      vc,
    )

    // Verify the VP
    const res = await validateVPV1({ documentLoader, getVerifySuite: getVerifySuiteBad })(vp)

    expectToBeInvalidWith(res, {
      kind: 'invalid_param',
      message:
        'Invalid value for field "proof": Error while validating proof: Error: Error while getting verify suite Error: Error',
    })
  })
})
