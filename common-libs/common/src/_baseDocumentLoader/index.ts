// This code is a modiefied version of the documentLoaders provided by jsonld.js using fetch instead of `xhr` or `request`

// You may use the jsonld.js project under the terms of the BSD License.

// You are free to use this project in commercial projects as long as the
// copyright header is left intact.

// If you are a commercial entity and use this set of libraries in your
// commercial software then reasonable payment to Digital Bazaar, if you can
// afford it, is not required but is expected and would be appreciated. If this
// library saves you time, then it's saving you money. The cost of developing
// JSON-LD was on the order of several months of work and tens of
// thousands of dollars. We are attempting to strike a balance between helping
// the development community while not being taken advantage of by lucrative
// commercial entities for our efforts.

// -------------------------------------------------------------------------------
// New BSD License (3-clause)
// Copyright (c) 2010, Digital Bazaar, Inc.
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of Digital Bazaar, Inc. nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL DIGITAL BAZAAR BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import { parseLinkHeader, LINK_HEADER_CONTEXT, prependBase } from './util'
import { localContexts } from './localContexts'

let fetch: any

if (!fetch) {
  fetch = require('node-fetch')
}

// Domains with schemas that never change and can be cached,
// as opposed to domains with documents that change dynamically
// (such as https://affinity-revocation.staging.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/1)
const domainsToCache = ['https://www.w3.org/', 'https://w3id.org/']

const cachedDocuments = new Map(
  Object.entries(localContexts).map(([url, document]) => [
    url,
    Object.freeze({
      contextUrl: null as string | null,
      document: document as Record<string, any>,
      documentUrl: url,
    }),
  ]),
)

export const baseDocumentLoader = async (url: string) => {
  const loader = async (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL could not be deferenced; only "http" and "https" URLs are supported')
    }

    // If we have a cached copy of the context do not make a request
    if (cachedDocuments.has(url)) {
      return cachedDocuments.get(url)
    }

    let res: Response

    try {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/ld+json, application/json',
        },
      })
    } catch (error) {
      throw new Error(`URL could not be dereferenced, an error occurred. ${error}`)
    }

    if (res.status >= 400) {
      throw new Error(`URL could not be dereferenced, an error occurred. ${res.status}`)
    }

    const document = await res.json()

    let doc: {
      contextUrl: null | string
      document: any
      documentUrl: string
    } = { contextUrl: null, documentUrl: url, document }

    const contentType = res.headers.get('Content-Type')
    const linkHeader = res.headers.get('Link')
    if (linkHeader && contentType === 'application/ld+json') {
      // only 1 related link header permitted
      const linkHeaders = parseLinkHeader(linkHeader)
      const linkedContext = linkHeaders[LINK_HEADER_CONTEXT]
      if (Array.isArray(linkedContext)) {
        throw new Error('URL could not be dereferenced, it has more than one associated HTTP Link Header.')
      }

      if (linkedContext) {
        doc.contextUrl = linkedContext.target
      }

      // "alternate" link header is a redirect
      const alternate = linkHeaders['alternate']
      if (
        alternate &&
        alternate.type === 'application/ld+json' &&
        !(contentType || '').match(/^application\/(\w*\+)?json$/)
      ) {
        doc = await loader(prependBase(url, alternate.target))
      }
    }

    if (domainsToCache.some((domain) => url.startsWith(domain))) {
      const result = Object.freeze(doc)
      cachedDocuments.set(url, result)
      return result
    }

    return doc
  }

  return loader(url)
}
