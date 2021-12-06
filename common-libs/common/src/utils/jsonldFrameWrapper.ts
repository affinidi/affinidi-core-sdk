/**
 * This function wraps json ld.frame function
 * in case it returns not a valid segment ({ @context, ...segment }) but { @context, @graph: [segment, fullVC]),
 * This problem only related to vcs with new jsonld context.
 * It is temporary solution until we will have time to find,
 * fix, get PR review in jsonld lib, merge it, publish,
 * then update jsonld lib in @mattrglobal/json-signatures-bbs,
 * get PR review from them, merge it, publish and only then update this SDK
 */
const normalizeFramingResult = ({ '@graph': graph, ...restFramingResult }: Record<string, any>) => ({
  ...restFramingResult,
  ...graph?.[0],
})

export const wrapJsonldFrameFunction = (jsonld: { frame: (...args: unknown[]) => Promise<unknown> }): void => {
  const originalJsonldFrame = jsonld.frame

  jsonld.frame = (...args: unknown[]) => originalJsonldFrame(...args).then(normalizeFramingResult)
}
