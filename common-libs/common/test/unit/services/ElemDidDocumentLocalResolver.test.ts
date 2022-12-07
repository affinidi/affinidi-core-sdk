import { resolveLegacyDidElemLocal } from '../../../src/services/DidDocumentService/ElemDidDocumentLocalResolver'
import { expect } from 'chai'

const didElem =
  'did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw;' +
  'elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhk' +
  'R1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXl' +
  'sb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWE' +
  'pwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKM' +
  'WMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZ' +
  'MkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelpHRTJaV1E1TkR' +
  'KaU56STVNakUxTWpNMU1tWXdZV0l5WkdabU1HVXdNamd6WVRBNU1XTTROalJtT0RZNE16Tm' +
  'hOV0U0T0dSak5EQmpOMkptTW1Vd05DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxY' +
  'zJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFX' +
  'TmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TWpNek1HWTJZbU0' +
  'zTlRRNU1tUm1NRGc0WWpVek0yTmpaakJqWWpnNE4yRTVOMkl5WlRnNU5UVTBOMlU1TURkal' +
  'pHVmxaV1E1TVRRek5HVXdaR0U0WVdNaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJa' +
  'U53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNK' +
  'ZGZRIiwic2lnbmF0dXJlIjoiYmNMY1JNdEJaSXNsM0dUYWFfb3FSVkt6ZVpXQWlOanJZaFl' +
  'rRkRRNFRrc0lTSTl6cGFCSW5RRjM5ZTBWMkRoY3hOMHVvY1dsQ3V3cUVuV2J6cHNGSUEifQ'

describe('#resolveLegacyDidElemLocal', () => {
  it('should resolve legacy did elem', async () => {
    const resolved = await resolveLegacyDidElemLocal(didElem)

    console.log(JSON.stringify(resolved, null, 2))
    expect(resolved).to.be.deep.eq({
      '@context': 'https://w3id.org/security/v2',
      publicKey: [
        {
          id: 'did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw#primary',
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '03da6ed942b7292152352f0ab2dff0e0283a091c864f86833a5a88dc40c7bf2e04',
        },
        {
          id: 'did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw#recovery',
          usage: 'recovery',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: '02330f6bc75492df088b533ccf0cb887a97b2e895547e907cdeeed91434e0da8ac',
        },
      ],
      authentication: ['did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw#primary'],
      assertionMethod: ['did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw#primary'],
      id: 'did:elem:EiAab5TYE15xf761dDpSUrUUa77W7xoRo6VlbM80yrMefw',
    })
  })
})
