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

export const isAbsolute = (v: string) => /^([A-Za-z][A-Za-z0-9+-.]*|_):[^\s]*$/.test(v)

export const removeDotSegments = (path: string) => {
  // RFC 3986 5.2.4 (reworked)

  // empty path shortcut
  if (path.length === 0) {
    return ''
  }

  const input = path.split('/')
  const output = []

  while (input.length > 0) {
    const next = input.shift()
    const done = input.length === 0

    if (next === '.') {
      if (done) {
        // ensure output has trailing /
        output.push('')
      }

      continue
    }

    if (next === '..') {
      output.pop()
      if (done) {
        // ensure output has trailing /
        output.push('')
      }

      continue
    }

    output.push(next)
  }

  // if path was absolute, ensure output has leading /
  if (path[0] === '/' && output.length > 0 && output[0] !== '') {
    output.unshift('')
  }

  if (output.length === 1 && output[0] === '') {
    return '/'
  }

  return output.join('/')
}

export const parse = (str: string) => {
  const parsed: Record<string, any> = {}
  const keys = [
    'href',
    'protocol',
    'scheme',
    'authority',
    'auth',
    'user',
    'password',
    'hostname',
    'port',
    'path',
    'directory',
    'file',
    'query',
    'fragment',
  ]
  const regex = /^(([^:/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(\d*))?))?(?:(((?:[^?#/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/

  const match = regex.exec(str)
  for (let i = 0; i < keys.length; i++) {
    parsed[keys[i]] = match[i] === undefined ? null : match[i]
  }

  // remove default ports in found in URLs
  if ((parsed.scheme === 'https' && parsed.port === '443') || (parsed.scheme === 'http' && parsed.port === '80')) {
    parsed.href = parsed.href.replace(`:${parsed.port}`, '')
    parsed.authority = parsed.authority.replace(`:${parsed.port}`, '')
    parsed.port = null
  }

  parsed.normalizedPath = removeDotSegments(parsed.path)
  return parsed
}

export const prependBase = (base: string, iri: string) => {
  // already an absolute IRI
  if (isAbsolute(iri)) {
    return iri
  }

  // parse given IRI
  const rel = parse(iri)
  const baseParsed = parse(base)

  // per RFC3986 5.2.2
  const transform: Record<string, any> = {
    protocol: baseParsed.protocol || '',
  }

  if (rel.authority !== null) {
    transform.authority = rel.authority
    transform.path = rel.path
    transform.query = rel.query
  } else {
    transform.authority = baseParsed.authority

    if (rel.path === '') {
      transform.path = baseParsed.path
      if (rel.query !== null) {
        transform.query = rel.query
      } else {
        transform.query = baseParsed.query
      }
    } else {
      if (rel.path.indexOf('/') === 0) {
        // IRI represents an absolute path
        transform.path = rel.path
      } else {
        // merge paths
        let path = baseParsed.path

        // append relative path to the end of the last directory from base
        path = path.substr(0, path.lastIndexOf('/') + 1)
        if ((path.length > 0 || baseParsed.authority) && path.substr(-1) !== '/') {
          path += '/'
        }

        path += rel.path

        transform.path = path
      }

      transform.query = rel.query
    }
  }

  if (rel.path !== '') {
    // remove slashes and dots in path
    transform.path = removeDotSegments(transform.path)
  }

  // construct URL
  let rval = transform.protocol
  if (transform.authority !== null) {
    rval += `//${transform.authority}`
  }

  rval += transform.path
  if (transform.query !== null) {
    rval += `?${transform.query}`
  }

  if (rel.fragment !== null) {
    rval += `#${rel.fragment}`
  }

  // handle empty base
  if (rval === '') {
    rval = './'
  }

  return rval
}

const REGEX_LINK_HEADERS = /(?:<[^>]*?>|"[^"]*?"|[^,])+/g
const REGEX_LINK_HEADER = /\s*<([^>]*?)>\s*(?:;\s*(.*))?/
const REGEX_LINK_HEADER_PARAMS = /(.*?)=(?:(?:"([^"]*?)")|([^"]*?))\s*(?:(?:;\s*)|$)/g
export const LINK_HEADER_CONTEXT = 'http://www.w3.org/ns/json-ld#context'

export const parseLinkHeader = (header: string) => {
  const rval: Record<string, any> = {}
  // split on unbracketed/unquoted commas
  const entries = header.match(REGEX_LINK_HEADERS)
  for (const entry of entries) {
    let match = entry.match(REGEX_LINK_HEADER)
    if (!match) {
      continue
    }

    const result: Record<string, any> = { target: match[1] }
    const params = match[2]
    match = REGEX_LINK_HEADER_PARAMS.exec(params)
    while (match) {
      result[match[1]] = match[2] === undefined ? match[3] : match[2]
      match = REGEX_LINK_HEADER_PARAMS.exec(params)
    }

    const rel = result['rel'] || ''
    if (Array.isArray(rval[rel])) {
      rval[rel].push(result)
    } else if (Object.prototype.hasOwnProperty.call(rval, rel)) {
      rval[rel] = [rval[rel], result]
    } else {
      rval[rel] = result
    }
  }

  return rval
}
