import { EcdsaSecp256k1Signature2019, EcdsaSecp256k1KeyClass2019 } from '@transmute/lds-ecdsa-secp256k1-2019'
import { keyUtils } from '@transmute/es256k-jws-ts'

import { Secp256k1Signature, Secp256k1Key } from './'

const jsonld = require('jsonld')
const jsigs = require('jsonld-signatures')

const { AssertionProofPurpose } = jsigs.purposes

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
const didConfig = {
  did: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ',
  didDoc: {
    '@context': 'https://w3id.org/security/v2',
    publicKey: [
      {
        id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary',
        usage: 'signing',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
      },
      {
        id:
          'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ#primary',
        usage: 'signing',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
      },
      {
        id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#recovery',
        usage: 'recovery',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
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
      'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary',
      'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ#primary',
    ],
    assertionMethod: [
      'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary',
      'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVl6QTBaR00yTUdRME1UWmtaRFl3TkdJNVlUQTJaV0l3WkRObE5USTNOVEpsT1RNM1pXSXpabVUwTmpRMlpUQXdOV1ZqTnpjd1l6YzJObUl4TWpBNU5pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKaU5ETmpZV0ZtTkRBellXTmxOV0ZtTWpBd1ptSmlPRGxsWm1Oa1pEYzJNVEF4TWpSak5UUXpZVFEwT1dNMU1USTBNelUzTWprd1lURmtOalU0TVRZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWVlaGxnajdjVnA0N0dHRXBUNEZieFV1WG1VY1dXZktHQkI2aUxnQTgtd3BLcXViSHVEeVJYQzQ4SldMMjZQRzVZV0xtZFRwcV8wVHNkVmhVMlEwYUEifQ#primary',
    ],
    id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ',
  },
  keys: {
    primaryKey: {
      publicKey: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
      privateKey: 'dbcec07b9f9816ac5cec1dadadde64fc0ed610be39b06a77a238e95df36d774a',
    },
    recoveryKey: {
      publicKey: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
      privateKey: '03f8547441c20a6be216d8335e9dd96021a0a5de84db12bbe40af1bb7cbdc276',
    },
  },
}

const didConfigLegacy = {
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
  keys: {
    primaryKey: {
      publicKey: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
      privateKey: 'dbcec07b9f9816ac5cec1dadadde64fc0ed610be39b06a77a238e95df36d774a',
    },
    recoveryKey: {
      publicKey: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
      privateKey: '03f8547441c20a6be216d8335e9dd96021a0a5de84db12bbe40af1bb7cbdc276',
    },
  },
}

const didConfigWOBackwardsCompat = {
  did: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ',
  didDoc: {
    '@context': 'https://w3id.org/security/v2',
    publicKey: [
      {
        id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary',
        usage: 'signing',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
      },
      {
        id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#recovery',
        usage: 'recovery',
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
      },
    ],
    authentication: ['did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary'],
    assertionMethod: ['did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ#primary'],
    id: 'did:elem:EiBOH3jRdJZmRE4ew_lKc0RgSDsZphs3ddXmz2MHfKHXcQ',
  },
  keys: {
    primaryKey: {
      publicKey: '02c04dc60d416dd604b9a06eb0d3e52752e937eb3fe4646e005ec770c766b12096',
      privateKey: 'dbcec07b9f9816ac5cec1dadadde64fc0ed610be39b06a77a238e95df36d774a',
    },
    recoveryKey: {
      publicKey: '032b43caaf403ace5af200fbb89efcdd7610124c543a449c5124357290a1d65816',
      privateKey: '03f8547441c20a6be216d8335e9dd96021a0a5de84db12bbe40af1bb7cbdc276',
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

const document = {
  '@context': {
    Person: 'https://schema.org/Person',
    name: 'https://schema.org/name',
  },
  '@type': 'Person',
  name: 'Bob Belcher',
}

const documentLoader = (didDoc = didConfig.didDoc) => async (url: string): Promise<any> => {
  if (url.startsWith('did:')) {
    return {
      contextUrl: null,
      document: didDoc,
      documentUrl: url,
    }
  }

  return jsonld.documentLoaders.node()(url)
}

describe('Secp256k1Signature', () => {
  it('can be used to sign a document', async () => {
    const { proof, ...rest } = await jsigs.sign(
      { ...document },
      {
        suite: new Secp256k1Signature({
          key: new Secp256k1Key({
            privateKeyHex: didConfig.keys.primaryKey.privateKey,
            id: `${didConfig.didDoc.id}#primary`,
            controller: didConfig.did,
          }),
        }),
        documentLoader: documentLoader(),
        purpose: new AssertionProofPurpose(),
        compactProof: false,
      },
    )

    expect(rest).toEqual(document)
    expect(proof.type).toEqual('EcdsaSecp256k1Signature2019')
    expect(typeof proof.created).toEqual('string')
    expect(proof.verificationMethod).toEqual(`${didConfig.didDoc.id}#primary`)
    expect(proof.proofPurpose).toEqual('assertionMethod')
    expect(typeof proof.jws).toEqual('string')
  })

  it('produces a signature that can be validated by "@transmute/lds-ecdsa-secp256k1-2019"', async () => {
    const signed = await jsigs.sign(
      { ...document },
      {
        suite: new Secp256k1Signature({
          key: new Secp256k1Key({
            privateKeyHex: didConfig.keys.primaryKey.privateKey,
            id: `${didConfig.didDoc.id}#primary`,
            controller: didConfig.did,
          }),
        }),
        documentLoader: documentLoader(),
        purpose: new AssertionProofPurpose(),
        compactProof: false,
      },
    )

    const result = await jsigs.verify(signed, {
      suite: new EcdsaSecp256k1Signature2019({
        key: new EcdsaSecp256k1KeyClass2019({
          id: `${didConfig.didDoc.id}#primary`,
          controller: didConfig.did,
          publicKeyJwk: await keyUtils.publicJWKFromPublicKeyHex(didConfig.keys.primaryKey.publicKey),
        }),
      }),
      documentLoader: documentLoader(),
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })

    expect(result.verified).toBeTruthy()
  })
})

describe('Secp256k1Signature', () => {
  let signed: Record<string, any>

  beforeEach(async () => {
    signed = await jsigs.sign(
      { ...document },
      {
        suite: new Secp256k1Signature({
          key: new Secp256k1Key({
            privateKeyHex: didConfig.keys.primaryKey.privateKey,
            id: `${didConfig.didDoc.id}#primary`,
            controller: didConfig.did,
          }),
        }),
        documentLoader: documentLoader(),
        purpose: new AssertionProofPurpose(),
        compactProof: false,
      },
    )
  })

  it('can be used to verify a signed document', async () => {
    const result = await jsigs.verify(signed, {
      suite: new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: didConfig.keys.primaryKey.publicKey,
          id: `${didConfig.didDoc.id}#primary`,
          controller: didConfig.didDoc.id,
        }),
      }),
      documentLoader: documentLoader(),
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })

    console.log(result.error?.errors)

    expect(result.verified).toBeTruthy()
  })

  it('fails verification if the data is tampered with', async () => {
    const result = await jsigs.verify(
      { ...signed, name: 'Linda Belcher' },
      {
        suite: new Secp256k1Signature({
          key: new Secp256k1Key({
            publicKeyHex: didConfig.keys.primaryKey.publicKey,
            id: `${didConfig.didDoc.id}#primary`,
            controller: didConfig.didDoc.id,
          }),
        }),
        documentLoader: documentLoader(),
        purpose: new AssertionProofPurpose(),
        compactProof: false,
      },
    )

    expect(result.verified).toBeFalsy()
  })

  it('can be used to verify a legacy signed document', async () => {
    const signed = await jsigs.sign(
      { ...document },
      {
        suite: new Secp256k1Signature({
          key: new Secp256k1Key({
            privateKeyHex: didConfigLegacy.keys.primaryKey.privateKey,
            id: `${didConfigLegacy.didDoc.id}#primary`,
            controller: didConfigLegacy.did,
          }),
        }),
        documentLoader: documentLoader(didConfigLegacy.didDoc),
        purpose: new AssertionProofPurpose(),
        compactProof: false,
      },
    )

    const result = await jsigs.verify(signed, {
      suite: new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: didConfigLegacy.keys.primaryKey.publicKey,
          id: `${didConfigLegacy.didDoc.id}#primary`,
          controller: didConfigLegacy.didDoc.id,
        }),
      }),
      documentLoader: documentLoader(didConfig.didDoc),
      purpose: new AssertionProofPurpose({
        controller: didConfig.didDoc,
      }),
      compactProof: false,
    })

    expect(result.verified).toBeTruthy()
  })

  it('fails to verify if signed by a legacy DID without a controller set in the proof purpose', async () => {
    const signed = await jsigs.sign(
      { ...document },
      {
        suite: new Secp256k1Signature({
          key: new Secp256k1Key({
            privateKeyHex: didConfigLegacy.keys.primaryKey.privateKey,
            id: `${didConfigLegacy.didDoc.id}#primary`,
            controller: didConfigLegacy.did,
          }),
        }),
        documentLoader: documentLoader(didConfigLegacy.didDoc),
        purpose: new AssertionProofPurpose(),
        compactProof: false,
      },
    )

    const result = await jsigs.verify(signed, {
      suite: new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: didConfigLegacy.keys.primaryKey.publicKey,
          id: `${didConfigLegacy.didDoc.id}#primary`,
          controller: didConfigLegacy.didDoc.id,
        }),
      }),
      documentLoader: documentLoader(didConfig.didDoc),
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })

    expect(result.verified).toBeFalsy()
  })

  it('fails verification if when signed with a legacy DID Doc and verified with a non-backwards compatible DID Doc', async () => {
    const signed = await jsigs.sign(
      { ...document },
      {
        suite: new Secp256k1Signature({
          key: new Secp256k1Key({
            privateKeyHex: didConfigLegacy.keys.primaryKey.privateKey,
            id: `${didConfigLegacy.didDoc.id}#primary`,
            controller: didConfigLegacy.did,
          }),
        }),
        documentLoader: documentLoader(didConfigLegacy.didDoc),
        purpose: new AssertionProofPurpose({
          controller: didConfigLegacy.didDoc,
        }),
        compactProof: false,
      },
    )

    const result = await jsigs.verify(signed, {
      suite: new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: didConfigLegacy.keys.primaryKey.publicKey,
          id: `${didConfigLegacy.didDoc.id}#primary`,
          controller: didConfigLegacy.didDoc.id,
        }),
      }),
      documentLoader: documentLoader(didConfigWOBackwardsCompat.didDoc),
      purpose: new AssertionProofPurpose({
        controller: didConfigWOBackwardsCompat.didDoc,
      }),
      compactProof: false,
    })

    expect(result.verified).toBeFalsy()
  })

  it("fails verification if the DID doesn't have authorization for the given proof purpose", async () => {
    const result = await jsigs.verify(signed, {
      suite: new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: didConfig.keys.primaryKey.publicKey,
          id: `${didConfig.didDoc.id}#primary`,
          controller: didConfig.didDoc.id,
        }),
      }),
      documentLoader: documentLoader({ ...didConfig.didDoc, assertionMethod: [] }),
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })

    expect(result.verified).toBeFalsy()
  })

  it('validates a signature that was generated by "@transmute/lds-ecdsa-secp256k1-2019"', async () => {
    const signed = await jsigs.sign(
      { ...document },
      {
        suite: new EcdsaSecp256k1Signature2019({
          key: new EcdsaSecp256k1KeyClass2019({
            id: `${didConfig.didDoc.id}#primary`,
            controller: didConfig.did,
            privateKeyJwk: await keyUtils.privateJWKFromPrivateKeyHex(didConfig.keys.primaryKey.privateKey),
          }),
        }),
        documentLoader: documentLoader(),
        purpose: new AssertionProofPurpose(),
        compactProof: false,
      },
    )

    const result = await jsigs.verify(signed, {
      suite: new Secp256k1Signature({
        key: new Secp256k1Key({
          publicKeyHex: didConfig.keys.primaryKey.publicKey,
          id: `${didConfig.didDoc.id}#primary`,
          controller: didConfig.didDoc.id,
        }),
      }),
      documentLoader: documentLoader(),
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })

    expect(result.verified).toBeTruthy()
  })
})
