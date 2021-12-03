/**
 * This function is invited to wrap json ld.frame function
 * in case it returns not a valid segment but @context and @graph fields,
 * under which in the first index segment with data is contained.
 * This problem only related to vcs with new jsonld context.
 * It is temporary solution until we will have time  to find,
 * fix, get PR review in jsonld lib, merge it, publish,
 * then  update jsonld lib in @mattrglobal/json-signatures-bbs,
 * get PR review from them, merge it, publish and only then update this SDK
 */

const jsonld = require('jsonld')

const originalJsonldFrame = jsonld.frame

const normalizeFramingResult = (framingResult: Record<string, any>) => {
  const normalizedFramingResult = framingResult['@graph']
    ? { ...framingResult, ...framingResult['@graph'][0] }
    : framingResult

  delete normalizedFramingResult['@graph']
  return normalizedFramingResult
}

jsonld.frame = (...args: unknown[]) => originalJsonldFrame(...args).then(normalizeFramingResult)
