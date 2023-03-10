import { VPV1Unsigned } from '@affinidi/vc-common'

const presentationWithSubmission: VPV1Unsigned = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://identity.foundation/presentation-exchange/submission/v1',
  ],
  type: ['VerifiablePresentation', 'PresentationSubmission'],
  holder: {
    id:
      'did:elem:EiBPGxTXuoX6QSajxrSg5CusYoCw9uMGiV4xTq0iaNSN2Q;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBellqRTNOMlJqWkdSaFpEazJaV1V5TXpFMVl6Z3lOakU0Wm1ZMFltSTFZelZqTm1NeVlXSm1OalptWlRnd1pqUmtPREptWWpjeFlUYzVPRGhsTkROaE1pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TTJKak5EazNNR1ZsWXpoak9USmpPRFUyWVRWbE0yTTRPVGs0WldFell6QXlNbUl6WldVeE1XSXhORGhpTXpZeVptSmhZMkUyTWpVd05XRTROVEl6WmpZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiU1N3a0tVZEU4MDZJbzZpVmdfeHpOVWM5Y1o0S2hnYXRCNllVRENEcDJyUkhjTG5oaEEwSU5RX1RLSWljZGk1c2lTcGRRRXpxVGoybEJWVGhYV2E5NFEifQ',
  },
  presentation_submission: {
    id: 'CEXip8ZLakgEYbOL10lmk',
    definition_id: 'a215a0ea-bdd5-4f44-8569-21fa9db052b0',
    descriptor_map: [
      {
        id: 'score',
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]',
      },
      {
        id: 'likes',
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]',
      },
    ],
  },
  verifiableCredential: [
    {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://schema.affinidi.com/ContentLikeV1-0.jsonld'],
      id: 'claimId:btc72ir53t',
      type: ['VerifiableCredential', 'ContentLike'],
      holder: {
        id:
          'did:elem:EiBPGxTXuoX6QSajxrSg5CusYoCw9uMGiV4xTq0iaNSN2Q;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBellqRTNOMlJqWkdSaFpEazJaV1V5TXpFMVl6Z3lOakU0Wm1ZMFltSTFZelZqTm1NeVlXSm1OalptWlRnd1pqUmtPREptWWpjeFlUYzVPRGhsTkROaE1pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TTJKak5EazNNR1ZsWXpoak9USmpPRFUyWVRWbE0yTTRPVGs0WldFell6QXlNbUl6WldVeE1XSXhORGhpTXpZeVptSmhZMkUyTWpVd05XRTROVEl6WmpZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiU1N3a0tVZEU4MDZJbzZpVmdfeHpOVWM5Y1o0S2hnYXRCNllVRENEcDJyUkhjTG5oaEEwSU5RX1RLSWljZGk1c2lTcGRRRXpxVGoybEJWVGhYV2E5NFEifQ',
      },
      credentialSubject: {
        data: {
          '@type': ['VerifiableCredential', 'ContentLike'],
          url: 'https://www.youtube.com/watch?v=Pk5Rnd5ixCI&list=PL1e3Vu_V-AU9yKjCWIPWDZylRVZvw5kPW&index=1',
          date: '2023-03-10T09:47:04.727Z',
          like: true,
          score: 10,
        },
      },
      credentialSchema: {
        id: 'https://schema.affinidi.com/ContentLikeV1-0.json',
        type: 'JsonSchemaValidator2018',
      },
      issuanceDate: '2023-03-10T09:47:04.727Z',
      issuer:
        'did:elem:EiBPGxTXuoX6QSajxrSg5CusYoCw9uMGiV4xTq0iaNSN2Q;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBellqRTNOMlJqWkdSaFpEazJaV1V5TXpFMVl6Z3lOakU0Wm1ZMFltSTFZelZqTm1NeVlXSm1OalptWlRnd1pqUmtPREptWWpjeFlUYzVPRGhsTkROaE1pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TTJKak5EazNNR1ZsWXpoak9USmpPRFUyWVRWbE0yTTRPVGs0WldFell6QXlNbUl6WldVeE1XSXhORGhpTXpZeVptSmhZMkUyTWpVd05XRTROVEl6WmpZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiU1N3a0tVZEU4MDZJbzZpVmdfeHpOVWM5Y1o0S2hnYXRCNllVRENEcDJyUkhjTG5oaEEwSU5RX1RLSWljZGk1c2lTcGRRRXpxVGoybEJWVGhYV2E5NFEifQ',
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: '2023-03-10T09:47:04Z',
        verificationMethod: 'did:elem:EiBPGxTXuoX6QSajxrSg5CusYoCw9uMGiV4xTq0iaNSN2Q#primary',
        proofPurpose: 'assertionMethod',
        jws:
          'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..LCxQ9PKrNQrVWuCH8ViEi9kZBEgBISavw-nq-2kvYdM4rP8QaUq4qh4FVCyoCNtf_EnpFGsW_xKMp1rl7zkI-w',
      },
    },
  ],
}
export default presentationWithSubmission
