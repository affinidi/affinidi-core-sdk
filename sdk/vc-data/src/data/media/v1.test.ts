import { expandVC } from '../../testUtil.test'
import { getVCFileV1Context, VCFileV1, VCSFileV1 } from './v1'

describe('VCFileV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCFileV1, VCSFileV1>({
      type: 'FileV1',
      data: {
        '@type': ['Thing', 'CreativeWork', 'MediaObject', 'File'],
        contentAsBase64: 'aGVsbG8=',
        contentUrl: 'https://cdn.affinidi.io/file-uuid',
        name: 'test.txt',
        contentSize: '1.2MB',
        encodingFormat: 'text/plain',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      context: getVCFileV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot(`
      Object {
        "@id": "urn:uuid:9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "@type": Array [
          "https://www.w3.org/2018/credentials#VerifiableCredential",
          "https://schema.affinity-project.org/FileV1",
        ],
        "https://www.w3.org/2018/credentials#credentialSubject": Array [
          Object {
            "https://schema.affinity-project.org/data": Array [
              Object {
                "@type": Array [
                  "https://schema.org/Thing",
                  "https://schema.org/CreativeWork",
                  "https://schema.org/MediaObject",
                  "https://schema.affinity-project.org/File",
                ],
                "https://schema.affinity-project.org/contentAsBase64": Array [
                  Object {
                    "@value": "aGVsbG8=",
                  },
                ],
                "https://schema.org/contentSize": Array [
                  Object {
                    "@value": "1.2MB",
                  },
                ],
                "https://schema.org/contentUrl": Array [
                  Object {
                    "@value": "https://cdn.affinidi.io/file-uuid",
                  },
                ],
                "https://schema.org/encodingFormat": Array [
                  Object {
                    "@value": "text/plain",
                  },
                ],
                "https://schema.org/name": Array [
                  Object {
                    "@value": "test.txt",
                  },
                ],
                "https://schema.org/sha256": Array [
                  Object {
                    "@value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                  },
                ],
              },
            ],
          },
        ],
        "https://www.w3.org/2018/credentials#holder": Array [
          Object {
            "@id": "did:elem:123",
          },
        ],
      }
    `)
  })
})
