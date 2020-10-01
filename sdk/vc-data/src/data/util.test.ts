import { createContextEntry, combineContextEntries } from './util'

describe('createContextEntry', () => {
  it('returns a context with no vocab set', () => {
    const entry = createContextEntry<{ '@type': 'MyType'; field1: string }>({
      type: 'MyType',
      typeIdBase: 'affSchema',
      fields: {
        field1: 'affSchema',
      },
    })

    expect(entry).toMatchInlineSnapshot(`
      Object {
        "MyType": Object {
          "@context": Object {
            "@protected": true,
            "@version": 1.1,
            "@vocab": null,
            "field1": "https://schema.affinity-project.org/field1",
          },
          "@id": "https://schema.affinity-project.org/MyType",
        },
      }
    `)
  })

  it('returns a context with vocab set', () => {
    const entry = createContextEntry<{ '@type': 'MyType'; field1: string }>({
      type: 'MyType',
      typeIdBase: 'affSchema',
      fields: {
        field1: 'affSchema',
      },
      vocab: 'schema',
    })

    expect(entry).toMatchInlineSnapshot(`
      Object {
        "MyType": Object {
          "@context": Object {
            "@protected": true,
            "@version": 1.1,
            "@vocab": "https://schema.org/",
            "field1": "https://schema.affinity-project.org/field1",
          },
          "@id": "https://schema.affinity-project.org/MyType",
        },
      }
    `)
  })
})

describe('combineContextEntries', () => {
  it('combines the two entries', () => {
    const entry1 = createContextEntry<{ '@type': 'MyType1'; field1: string }>({
      type: 'MyType1',
      typeIdBase: 'affSchema',
      fields: {
        field1: 'affSchema',
      },
      vocab: 'schema',
    })

    const entry2 = createContextEntry<{ '@type': 'MyType2'; field1: string }>({
      type: 'MyType2',
      typeIdBase: 'affSchema',
      fields: {
        field1: 'affSchema',
      },
      vocab: 'schema',
    })

    const combined = combineContextEntries({ entries: [entry1, entry2] })

    expect(combined).toMatchInlineSnapshot(`
      Object {
        "MyType1": Object {
          "@context": Object {
            "@protected": true,
            "@version": 1.1,
            "@vocab": "https://schema.org/",
            "field1": "https://schema.affinity-project.org/field1",
          },
          "@id": "https://schema.affinity-project.org/MyType1",
        },
        "MyType2": Object {
          "@context": Object {
            "@protected": true,
            "@version": 1.1,
            "@vocab": "https://schema.org/",
            "field1": "https://schema.affinity-project.org/field1",
          },
          "@id": "https://schema.affinity-project.org/MyType2",
        },
      }
    `)
  })

  it('throws when there are duplicates', () => {
    const entry = createContextEntry<{ '@type': 'MyType'; field1: string }>({
      type: 'MyType',
      typeIdBase: 'affSchema',
      fields: {
        field1: 'affSchema',
      },
      vocab: 'schema',
    })

    expect(() => {
      combineContextEntries({ entries: [entry, entry] })
    }).toThrow()
  })
})
