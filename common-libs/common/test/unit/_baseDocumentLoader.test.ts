import { expect } from 'chai'

import { isAbsolute, removeDotSegments, parse, prependBase, parseLinkHeader } from '../../src/_baseDocumentLoader/util'

describe('isAbsolute', () => {
  it('returns true when given an absolute URL', () => {
    expect(isAbsolute('https://schema.org')).to.be.true
  })

  it('returns false when given a non-absolute URL', () => {
    expect(isAbsolute('some/relative/url')).to.be.false
  })
})

describe('removeDotSegments', () => {
  it('removes dots when relative', () => {
    expect(removeDotSegments('a/b/../c')).to.eq('a/c')
  })

  it('removes dots when absoulte', () => {
    expect(removeDotSegments('/a/b/../c')).to.eq('/a/c')
  })

  it('removes signle dot', () => {
    expect(removeDotSegments('/a/b/./c')).to.eq('/a/b/c')
  })

  it('removes dots when absoulte with trailing dots', () => {
    expect(removeDotSegments('/a/b/../c/..')).to.eq('/a/')
  })

  it('removes signle trailing dot', () => {
    expect(removeDotSegments('/a/b/c/.')).to.eq('/a/b/c/')
  })

  it('works when given an empty string', () => {
    expect(removeDotSegments('')).to.eq('')
  })
})

describe('parse', () => {
  it('returns a parsed absolute URL', () => {
    expect(parse('https://schema.org')).to.deep.eq({
      auth: null,
      authority: 'schema.org',
      directory: '',
      file: '',
      fragment: null,
      hostname: 'schema.org',
      href: 'https://schema.org',
      normalizedPath: '',
      password: null,
      path: '',
      port: null,
      protocol: 'https:',
      query: null,
      scheme: 'https',
      user: null,
    })
  })

  it('returns a parsed relative URL', () => {
    expect(parse('some/relative/url')).to.deep.eq({
      auth: null,
      authority: null,
      directory: 'some/relative/',
      file: 'url',
      fragment: null,
      hostname: null,
      href: 'some/relative/url',
      normalizedPath: 'some/relative/url',
      password: null,
      path: 'some/relative/url',
      port: null,
      protocol: null,
      query: null,
      scheme: null,
      user: null,
    })
  })
})

describe('prependBase', () => {
  it('prepends an IRI to the given URL', () => {
    expect(prependBase('base/iri/path', 'some/relative/url')).to.eq('base/iri/some/relative/url')
  })

  it("doesn't prepend abosulte URLs", () => {
    expect(prependBase('base/iri/path', 'https://schema.org')).to.eq('https://schema.org')
  })
})

describe('parseLinkHeader', () => {
  it('parses a header', () => {
    expect(
      parseLinkHeader(
        'Link: <https://one.example.com>; rel="preconnect", <https://two.example.com>; rel="preconnect", <https://three.example.com>; rel="preconnect"',
      ),
    ).to.deep.eq({
      preconnect: [
        {
          rel: 'preconnect',
          target: 'https://one.example.com',
        },
        {
          rel: 'preconnect',
          target: 'https://two.example.com',
        },
        {
          rel: 'preconnect',
          target: 'https://three.example.com',
        },
      ],
    })
  })

  it('parses a header with multiple params', () => {
    expect(
      parseLinkHeader(
        'Link: <https://one.example.com>; rel="preconnect"; param="value", <https://two.example.com>; rel="preconnect", <https://three.example.com>; rel="preconnect"',
      ),
    ).to.deep.eq({
      preconnect: [
        {
          rel: 'preconnect',
          param: 'value',
          target: 'https://one.example.com',
        },
        {
          rel: 'preconnect',
          target: 'https://two.example.com',
        },
        {
          rel: 'preconnect',
          target: 'https://three.example.com',
        },
      ],
    })
  })

  it("doesn't parse with an invalid link", () => {
    expect(
      parseLinkHeader(
        'Link: https://bad.example.com; rel="preconnect", <https://two.example.com>; rel="preconnect", <https://three.example.com>; rel="preconnect"',
      ),
    ).to.deep.eq({
      preconnect: [
        {
          rel: 'preconnect',
          target: 'https://two.example.com',
        },
        {
          rel: 'preconnect',
          target: 'https://three.example.com',
        },
      ],
    })
  })

  it('parses without a rel', () => {
    expect(
      parseLinkHeader(
        'Link: <https://one.example.com>, <https://two.example.com>; rel="preconnect", <https://three.example.com>; rel="preconnect"',
      ),
    ).to.deep.eq({
      '': {
        target: 'https://one.example.com',
      },

      preconnect: [
        {
          rel: 'preconnect',
          target: 'https://two.example.com',
        },
        {
          rel: 'preconnect',
          target: 'https://three.example.com',
        },
      ],
    })
  })

  it('parses with different rels', () => {
    expect(
      parseLinkHeader(
        'Link: <https://one.example.com>; rel="preload", <https://two.example.com>; rel="preconnect", <https://three.example.com>; rel="preconnect"',
      ),
    ).to.deep.eq({
      preload: {
        rel: 'preload',
        target: 'https://one.example.com',
      },

      preconnect: [
        {
          rel: 'preconnect',
          target: 'https://two.example.com',
        },
        {
          rel: 'preconnect',
          target: 'https://three.example.com',
        },
      ],
    })
  })
})
