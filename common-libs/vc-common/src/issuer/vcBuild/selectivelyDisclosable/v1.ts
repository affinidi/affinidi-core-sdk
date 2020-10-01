// import * as R from 'ramda'
// import { uuid } from 'uuidv4'
// // import {
// //   buildVCV1,
// //   Issuer
// // } from '../v1'
// import {
//   /* Primitives and generics */
//   SimpleThing,
//   ObjectGeneric,
//   // SelectiveStructureComponent,
//   SelectiveNode,
//   SelectiveEdge,
//   SelectiveNodePropertyList,
//   SelectiveProperty,
//   VCV1Subject,
//   /* Subject Types */
//   VCV1SelectiveFullSubject,
//   // VCV1SelectiveStructuralFullSubject,
//   // VCV1SelectiveStructuralAtomSubject,
//   // VCV1SelectiveNodePropertyListSubject,
//   // VCV1SelectivePropertySubject,
//   // VCV1SelectiveMetaSubject,
//   /* Contexts */
//   // VCV1SelectiveFullContext,
//   // VCV1SelectiveStructuralFullContext,
//   // VCV1SelectiveStructuralAtomContext,
//   // VCV1SelectiveNodePropertyListContext,
//   // VCV1SelectivePropertyContext,
//   // VCV1SelectiveMetaContext,
//   /* Type strings */
//   // VCV1SelectiveFullType,
//   // VCV1SelectiveStructuralFullType,
//   // VCV1SelectiveStructuralAtomType,
//   // VCV1SelectiveNodePropertyListType,
//   // VCV1SelectivePropertyType,
//   // VCV1SelectiveMetaType,
//   // VC types
//   // VCV1SelectiveFull,
//   // VCV1SelectiveStructuralFull,
//   // VCV1SelectiveStructuralAtom,
//   // VCV1SelectiveNodePropertyList,
//   // VCV1SelectiveProperty,
//   // VCV1SelectiveMeta,
//   /* Global VC types */
//   // VCV1Revocation,
//   VCV1Type,
//   // VCV1,
//   // VCV1Holder,
// } from '@affinidi/vc-common'

// // Intermediate utility type for expansion of SD VC
// export type SelectiveStructuralMaster = {
//   '@vcId': string
//   '@vcType': VCV1Type
//   '@vcContext': Array<string>
//   nodes: Array<SelectiveNode>
//   edges: Array<SelectiveEdge>
//   nodePropertyLists: Array<SelectiveNodePropertyList>
//   partials: Array<SelectiveProperty>
// }

// export const buildVCV1SelectiveFullSubject = async <Data extends SimpleThing>(opts: {
//   credentialSubject: VCV1Subject<Data>
//   vcId: string
// }): Promise<VCV1SelectiveFullSubject<Data>> => {
//   const credSubjClone = R.clone(opts.credentialSubject) // Don't mutate credSubj
//   const newCredSubjData = assignNodeIds(credSubjClone['data'])
//   return {
//     ...credSubjClone,
//     data: {
//       ...newCredSubjData,
//       '@vcId': opts.vcId,
//     },
//   }
// }

// export type AccumulateStructureOptions = {
//   '@vcId': string
//   '@vcType': VCV1Type
//   '@vcContext': Array<string>
//   depth: number
//   includeNodeTypes: boolean
// }

// export const buildSelectiveStructuralMasterV1 = <Data extends SimpleThing>(
//   opts: { full: VCV1SelectiveFullSubject<Data> } & AccumulateStructureOptions,
// ): SelectiveStructuralMaster => {
//   const accumulator: SelectiveStructuralMaster = {
//     '@vcId': opts['@vcId'],
//     '@vcType': opts['@vcType'],
//     '@vcContext': opts['@vcContext'],
//     nodes: [],
//     edges: [],
//     nodePropertyLists: [],
//     partials: [],
//   }
//   accumulateStructure(accumulator, opts.full.data, opts)
//   return accumulator
// }

// // export const buildVCV1SelectiveStructuralFullSubject = ({
// //   structuralMaster,
// // }: {
// //   structuralMaster: SelectiveStructuralMaster
// // }): VCV1SelectiveStructuralFullSubject => ({
// //   id: uuid(),
// //   data: {
// //     '@vcId': structuralMaster['@vcId'],
// //     '@type': 'SelectiveStructuralFull',
// //     nodes: structuralMaster.nodes,
// //     edges: structuralMaster.edges,
// //   },
// // })

// // export const buildAllVCV1SelectiveStructuralAtomSubject = (opts: {
// //   structuralMaster: SelectiveStructuralMaster
// // }): Array<VCV1SelectiveStructuralAtomSubject> => {
// //   const structuralAtoms: VCV1SelectiveStructuralAtomSubject[] = []

// //   const props: Array<SelectiveStructureComponent> = ['nodes', 'edges']
// //   props.forEach((k: SelectiveStructureComponent) => {
// //     opts.structuralMaster[k].forEach((i: SelectiveNode | SelectiveEdge) => {
// //       const baseData = {
// //         '@type': 'SelectiveStructure' as 'SelectiveStructure',
// //         '@vcId': opts.structuralMaster['@vcId'],
// //       }
// //       const structuralAtom: VCV1SelectiveStructuralAtomSubject = {
// //         id: uuid(),
// //         data: Object.assign(baseData, k === 'nodes' ? { nodes: [i] as [SelectiveNode] } : { edges: [i] as [SelectiveEdge] }),
// //       }
// //       structuralAtoms.push(structuralAtom)
// //     })
// //   })

// //   return structuralAtoms
// // }

// // export const buildAllVCV1SelectiveNodePropertyListSubject = async (opts: {
// //   structuralMaster: SelectiveStructuralMaster
// // }): Promise<Array<VCV1SelectiveNodePropertyListSubject>> =>
// //   opts.structuralMaster.nodePropertyLists.map(npl => ({
// //     id: uuid(),
// //     sdvcClass: 'NodePropertyList',
// //     data: { '@type': 'NodePropertyList', ...npl },
// //   }))

// // export const buildAllVCV1SelectivePropertySubject = async (opts: {
// //   structuralMaster: SelectiveStructuralMaster
// // }): Promise<Array<VCV1SelectivePropertySubject>> =>
// //   opts.structuralMaster.partials.map(p => ({
// //     id: uuid(),
// //     data: p,
// //   }))

// // export const buildVCV1SelectiveMetaSubject = async (opts: {
// //   structuralMaster: SelectiveStructuralMaster
// // }): Promise<VCV1SelectiveMetaSubject> => ({
// //   id: uuid(),
// //   data: {
// //     '@type': 'SelectiveMeta',
// //     '@vcId': opts.structuralMaster['@vcId'],
// //     '@vcType': opts.structuralMaster['@vcType'],
// //     '@vcContext': opts.structuralMaster['@vcContext'],
// //   },
// // })

// // export const buildAllVCV1SelectiveSubject = async <Data extends SimpleThing, R extends VCV1Revocation>(opts: {
// //   baseType: string
// //   issuer: Issuer
// //   holder: VCV1Holder
// //   expirationDate?: string
// //   revocation: R
// //   context: string[]
// //   credentialSubject: VCV1Subject<Data>
// //   includeStructuralFull?: boolean
// //   includeStructuralAtom?: boolean
// //   includeNodePropertyList?: boolean
// //   includeProperties?: boolean
// // }): Promise<Array<
// //   VCV1<
// //     | VCV1SelectiveFullSubject<Data>
// //     | VCV1SelectiveStructuralFullSubject
// //     | VCV1SelectiveStructuralAtomSubject
// //     | VCV1SelectiveNodePropertyListSubject
// //     | VCV1SelectivePropertySubject
// //     | VCV1SelectiveMetaSubject
// //   >
// // >> => {
// //   const vcs: Array<VCV1<
// //     | VCV1SelectiveFullSubject<Data>
// //     | VCV1SelectiveStructuralFullSubject
// //     | VCV1SelectiveStructuralAtomSubject
// //     | VCV1SelectiveNodePropertyListSubject
// //     | VCV1SelectivePropertySubject
// //     | VCV1SelectiveMetaSubject
// //   >> = []

// //   const vcId = `urn:uuid:${uuid()}`
// //   const full = await buildVCV1SelectiveFullSubject({ credentialSubject: opts.credentialSubject, vcId })

// //   if (opts.includeStructuralFull || opts.includeStructuralAtom || opts.includeNodePropertyList || opts.includeProperties) {
// //     const issuanceDate = new Date().toISOString()

// //     vcs.push(
// //       (await buildVCV1<VCV1SelectiveFullSubject<Data>, R>({
// //         id: vcId,
// //         credentialSubject: full as VCV1SelectiveFullSubject<Data>,
// //         type: ['VerifiableCredential', 'SelectiveFullCredential', opts.baseType] as VCV1SelectiveFullType,
// //         issuer: opts.issuer,
// //         holder: opts.holder,
// //         issuanceDate,
// //         expirationDate: opts.expirationDate,
// //         context: [...opts.context, VCV1SelectiveFullContext],
// //       })) as VCV1SelectiveFull<Data>,
// //     )

// //     const structuralMaster = buildSelectiveStructuralMasterV1({
// //       full,
// //       includeNodeTypes: true,
// //       '@vcId': vcId,
// //       '@vcType': ['VerifiableCredential', opts.baseType],
// //       '@vcContext': opts.context,
// //       depth: 0,
// //     })

// //     const meta = await buildVCV1SelectiveMetaSubject({ structuralMaster })
// //     vcs.push(
// //       (await buildVCV1<VCV1SelectiveMetaSubject, R>({
// //         id: vcId,
// //         credentialSubject: meta as VCV1SelectiveMetaSubject,
// //         type: ['VerifiableCredential', 'SelectiveMetaCredential', opts.baseType] as VCV1SelectiveMetaType,
// //         issuer: opts.issuer,
// //         holder: opts.holder,
// //         issuanceDate,
// //         expirationDate: opts.expirationDate,
// //         context: [...opts.context, VCV1SelectiveMetaContext],
// //       })) as VCV1SelectiveMeta,
// //     )

// //     if (opts.includeStructuralFull || opts.includeStructuralAtom) {
// //       const structuralFull = buildVCV1SelectiveStructuralFullSubject({ structuralMaster })
// //       vcs.push(
// //         (await buildVCV1<VCV1SelectiveStructuralFullSubject, R>({
// //           id: vcId,
// //           credentialSubject: structuralFull as VCV1SelectiveStructuralFullSubject,
// //           type: ['VerifiableCredential', 'SelectiveStructuralFullCredential', opts.baseType] as VCV1SelectiveStructuralFullType,
// //           issuer: opts.issuer,
// //           holder: opts.holder,
// //           issuanceDate,
// //           expirationDate: opts.expirationDate,
// //           context: [...opts.context, VCV1SelectiveStructuralFullContext],
// //         })) as VCV1SelectiveStructuralFull,
// //       )

// //       if (opts.includeStructuralAtom) {
// //         const structuralAtomSubjects = await buildAllVCV1SelectiveStructuralAtomSubject({ structuralMaster })
// //         const structuralAtoms = await Promise.all(
// //           structuralAtomSubjects.map((structuralAtom: VCV1SelectiveStructuralAtomSubject) => {
// //             return buildVCV1<VCV1SelectiveStructuralAtomSubject, R>({
// //               id: vcId,
// //               credentialSubject: structuralAtom,
// //               type: ['VerifiableCredential', 'SelectiveStructuralAtomCredential', opts.baseType] as VCV1SelectiveStructuralAtomType,
// //               issuer: opts.issuer,
// //               holder: opts.holder,
// //               issuanceDate,
// //               expirationDate: opts.expirationDate,
// //               context: [...opts.context, VCV1SelectiveStructuralAtomContext],
// //             }) as Promise<VCV1SelectiveStructuralAtom>
// //           }),
// //         )
// //         vcs.concat(structuralAtoms)
// //       }
// //     }

// //     if (opts.includeNodePropertyList) {
// //       const nodePropertyLists = await Promise.all(
// //         (await buildAllVCV1SelectiveNodePropertyListSubject({ structuralMaster })).map(
// //           (nodePropertyList: VCV1SelectiveNodePropertyListSubject) =>
// //             buildVCV1<VCV1SelectiveNodePropertyListSubject, R>({
// //               id: vcId,
// //               credentialSubject: nodePropertyList as VCV1SelectiveNodePropertyListSubject,
// //               type: ['VerifiableCredential', 'SelectiveNodePropertyListCredential', opts.baseType] as VCV1SelectiveNodePropertyListType,
// //               issuer: opts.issuer,
// //               holder: opts.holder,
// //               issuanceDate,
// //               expirationDate: opts.expirationDate,
// //               context: [...opts.context, VCV1SelectiveNodePropertyListContext],
// //             }) as Promise<VCV1SelectiveNodePropertyList>,
// //         ),
// //       )
// //       vcs.concat(nodePropertyLists)
// //     }

// //     if (opts.includeProperties) {
// //       const partials = await Promise.all(
// //         (await buildAllVCV1SelectivePropertySubject({ structuralMaster })).map(
// //           (propertySubject: VCV1SelectivePropertySubject) =>
// //             buildVCV1<VCV1SelectivePropertySubject, R>({
// //               id: vcId,
// //               credentialSubject: propertySubject,
// //               type: ['VerifiableCredential', 'SelectivePropertyCredential', opts.baseType] as VCV1SelectivePropertyType,
// //               issuer: opts.issuer,
// //               holder: opts.holder,
// //               issuanceDate,
// //               expirationDate: opts.expirationDate,
// //               context: [...opts.context, VCV1SelectivePropertyContext],
// //             }) as Promise<VCV1SelectiveProperty>,
// //         ),
// //       )
// //       vcs.concat(partials)
// //     }
// //   } else {
// //   }

// //   return vcs
// // }

// // TODO: Add functions for building the VCs from the built credential subjects
// // Instead of returning an array above it'll probably be better to return an object that separate the different types of subjects
// // {
// //   full: VCV1SelectiveFullSubject
// //   stucturalFull?: StucturalVCV1SelectiveFullSubject
// //   stucturalAtoms?: StucturalVCV1SelectivePropertySubject[]
// //   nodePropertyLists?: VCV1SelectiveNodePropertyListSubject[]
// //   partials?: VCV1SelectivePropertySubject[]
// // }

// // export type Compact<T> = T extends object ? {[K in keyof T]: T[K]} : T

// /*
// // prettier-ignore
// export type RecursiveNodeId<T extends object> = Compact<
//   {
//     [P in keyof T]: T[P] extends object
//     ? RecursiveNodeId<T[P]>
//     : T[P] extends Array<object>
//     ? Array<RecursiveNodeId<T[P][0]>>
//     : T[P];
//   } & { '@nodeId': string }
// >;

// // prettier-ignore
// export type RecursiveNodeId<T extends any> = T extends Array<any>
//   ? RecursiveNodeIdI<T[0]>
//   : T extends {[k: string]: any}
//   ? {'@nodeId': string} & {[P in keyof T]: RecursiveNodeIdI<T[P]>}
//   : T
//   */

// type RecursiveNodeId<T> = T // Placeholder

// const assignNodeIds = (x: any): RecursiveNodeId<any> => {
//   if (Array.isArray(x)) {
//     return x.map(assignNodeIds)
//   } else if (typeof x === 'object') {
//     return { ...assignNodeIds(x), '@nodeId': uuid() }
//   } else {
//     return x
//   }
// }

// const addNodeToAccumulator = (
//   accumulator: SelectiveStructuralMaster,
//   sourceNode: ObjectGeneric,
//   item: ObjectGeneric,
//   property: string,
//   opts: AccumulateStructureOptions,
// ) => {
//   accumulator.edges.push({
//     '@type': 'SelectiveEdge',
//     '@nodeId': sourceNode['@nodeId'],
//     '@nodeType': sourceNode['@type'],
//     '@property': property,
//     '@targetNodeId': item['@nodeId'],
//     '@targetNodeType': item['@nodeType'],
//   })
//   accumulateStructure(accumulator, item, { ...opts, depth: opts.depth + 1 })
// }

// const addPropertiesToAccumulator = (
//   accumulator: SelectiveStructuralMaster,
//   node: ObjectGeneric,
//   key: string,
//   value: string | number | boolean,
// ) => {
//   accumulator.partials.push({
//     '@type': 'SelectiveProperty',
//     '@vcId': accumulator['@vcId'],
//     '@nodeType': node['@type'],
//     '@nodeId': node['@nodeId'],
//     property: key,
//     value,
//   })
// }

// const accumulateStructure = (
//   accumulator: SelectiveStructuralMaster,
//   node: ObjectGeneric,
//   opts: AccumulateStructureOptions,
// ) => {
//   const nodeProperties: Array<string> = []
//   Object.keys(node).forEach((key) => {
//     nodeProperties.push(key)
//     const value = node[key]
//     if (Array.isArray(value)) {
//       value.forEach((item) => {
//         if (Array.isArray(value)) {
//           // no-op - invalid
//         } else if (typeof item === 'object') {
//           addNodeToAccumulator(accumulator, node, item, key, opts)
//         } else {
//           addPropertiesToAccumulator(accumulator, node, key, item)
//         }
//       })
//     } else if (typeof value === 'object') {
//       addNodeToAccumulator(accumulator, node, value, key, opts)
//     } else {
//       addPropertiesToAccumulator(accumulator, node, key, value)
//     }
//   })
//   accumulator.nodes.push({
//     '@type': 'SelectiveNode',
//     '@nodeId': node['@nodeId'],
//     '@nodeType': node['@type'],
//     '@nodeIsRoot': opts.depth === 0,
//     '@nodeDepth': opts.depth,
//     ...(opts.includeNodeTypes && { '@type': node['@type'] }),
//   })
//   accumulator.nodePropertyLists.push({
//     '@vcId': accumulator['@vcId'],
//     '@type': 'SelectiveNodePropertyList',
//     '@nodeId': node['@nodeId'],
//     '@nodeType': node['@type'],
//     '@properties': nodeProperties,
//   })
// }
