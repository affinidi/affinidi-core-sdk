import { VPV1Unsigned } from '@affinidi/vc-common'

const presentationWithSubmission: VPV1Unsigned = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://identity.foundation/presentation-exchange/submission/v1',
  ],
  type: ['VerifiablePresentation', 'PresentationSubmission'],
  holder: {
    id:
      'did:elem:EiBi2nJp4p8x6dVz8zW635_ccJFn3Y_tIQDIvdxUUmtMgQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBek4yTTFaVFV3WTJKaE9HRTNNamRoWkRSbE5XWXdNamc0Tm1VMll6bGxabVk0TWpGaFl6QTJOV1ZtWXpFd1pEZGhPVEkyT1RJME1XTTNZV1kxTUdVek1pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TWpNeVpUazVZekl3T1dVd01HSmxOVGM1TldRMFpqUXlNR0psTlRoak1qQm1OREV5Tm1Vd05qZ3hNbVUxTVROalpXWmtOVEprWW1KaU5qazRNekkxTURNaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWhKdDlCVEtyV0YyRjdRSGhPNTJuODhtZTdxU3VMOHdJOVdCSGh3UC1BQkVvZzF6R2t3SkJUSkdaNE0wTjZLb1c0U2RGYXRlSnJZTUNhamhNeWtSZlEifQ',
  },
  presentation_submission: {
    id: '6HyHIVVLFQ0kq9SMPjmUZ',
    definition_id: '048fccfb-1432-474f-ac10-19dafd038435',
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
      id: 'claimId:dk69lfp6c4',
      type: ['VerifiableCredential', 'ContentLike'],
      holder: {
        id:
          'did:elem:EiBi2nJp4p8x6dVz8zW635_ccJFn3Y_tIQDIvdxUUmtMgQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBek4yTTFaVFV3WTJKaE9HRTNNamRoWkRSbE5XWXdNamc0Tm1VMll6bGxabVk0TWpGaFl6QTJOV1ZtWXpFd1pEZGhPVEkyT1RJME1XTTNZV1kxTUdVek1pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TWpNeVpUazVZekl3T1dVd01HSmxOVGM1TldRMFpqUXlNR0psTlRoak1qQm1OREV5Tm1Vd05qZ3hNbVUxTVROalpXWmtOVEprWW1KaU5qazRNekkxTURNaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWhKdDlCVEtyV0YyRjdRSGhPNTJuODhtZTdxU3VMOHdJOVdCSGh3UC1BQkVvZzF6R2t3SkJUSkdaNE0wTjZLb1c0U2RGYXRlSnJZTUNhamhNeWtSZlEifQ',
      },
      credentialSubject: {
        data: {
          '@type': ['VerifiableCredential', 'ContentLike'],
          url: 'https://www.youtube.com/watch?v=Pk5Rnd5ixCI&list=PL1e3Vu_V-AU9yKjCWIPWDZylRVZvw5kPW&index=1',
          date: '2023-03-13T08:57:19.951Z',
          like: true,
          score: 10,
        },
      },
      credentialSchema: {
        id: 'https://schema.affinidi.com/ContentLikeV1-0.json',
        type: 'JsonSchemaValidator2018',
      },
      issuanceDate: '2023-03-13T08:57:19.952Z',
      issuer:
        'did:elem:EiBi2nJp4p8x6dVz8zW635_ccJFn3Y_tIQDIvdxUUmtMgQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBek4yTTFaVFV3WTJKaE9HRTNNamRoWkRSbE5XWXdNamc0Tm1VMll6bGxabVk0TWpGaFl6QTJOV1ZtWXpFd1pEZGhPVEkyT1RJME1XTTNZV1kxTUdVek1pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TWpNeVpUazVZekl3T1dVd01HSmxOVGM1TldRMFpqUXlNR0psTlRoak1qQm1OREV5Tm1Vd05qZ3hNbVUxTVROalpXWmtOVEprWW1KaU5qazRNekkxTURNaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiRWhKdDlCVEtyV0YyRjdRSGhPNTJuODhtZTdxU3VMOHdJOVdCSGh3UC1BQkVvZzF6R2t3SkJUSkdaNE0wTjZLb1c0U2RGYXRlSnJZTUNhamhNeWtSZlEifQ',
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: '2023-03-13T08:57:20Z',
        verificationMethod: 'did:elem:EiBi2nJp4p8x6dVz8zW635_ccJFn3Y_tIQDIvdxUUmtMgQ#primary',
        proofPurpose: 'assertionMethod',
        jws:
          'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..LbynVws4bVQc1E9RcSAySclkFGMpWZu43-7Lpr-yeKJXxMFold5vbH1sulIaPtw5Sse01in9IG9xMq-NbkLYxA',
      },
    },
  ],
}

export default presentationWithSubmission
