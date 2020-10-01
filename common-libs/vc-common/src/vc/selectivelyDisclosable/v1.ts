import { SimpleThing } from '../v1'
import { VCV1, VCV1Subject, VCV1Type } from '../v1'
import { TContext } from '../../shared'

export const VCV1SelectiveFullContext = 'VCV1SelectiveFullContext'
export const VCV1SelectiveStructuralFullContext = 'VCV1SelectiveStructuralFullContext'
export const VCV1SelectiveStructuralAtomContext = 'VCV1SelectiveStructuralAtomContext'
export const VCV1SelectiveNodePropertyListContext = 'VCV1SelectiveNodePropertyListContext'
export const VCV1SelectivePropertyContext = 'VCV1SelectivePropertyContext'
export const VCV1SelectiveMetaContext = 'VCV1SelectiveMetaContext'

/////////////////////////////////////////////////
// Generic
/////////////////////////////////////////////////
export type ObjectGeneric = { [k: string]: any }

/////////////////////////////////////////////////
// Primitives
/////////////////////////////////////////////////
export type SelectiveStructureComponent = 'nodes' | 'edges'

export type SelectiveNode = {
  '@type': 'SelectiveNode'
  // Originates that node is the root node of the object graph.  Technically optional but strongly recommended for prescribed schema compliance & object reconstruction
  '@nodeIsRoot': boolean
  // Depth of node, technically optional but strongly recommended for prescribed schema compliance & object reconstruction
  '@nodeDepth'?: number
  // UUID assigned to node
  '@nodeId': string
  // UUID assigned to node
  '@nodeType': string
}

export type SelectiveNodeR = Required<SelectiveNode>

export type SelectiveEdge = {
  '@type': 'SelectiveEdge'
  // Origin node @nodeId
  '@nodeId': string
  // Origin node @type, aliased to prevent conflict with '@type': 'SelectiveEdge'
  '@nodeType': string
  // Property on origin node hosting relationship
  '@property': string
  // Target/child node @nodeId
  '@targetNodeId': string
  // Target/child node @type
  '@targetNodeType': string
}

export type SelectiveNodePropertyList = {
  '@type': 'SelectiveNodePropertyList'
  // Original VC ID
  '@vcId': string
  // ID of node
  '@nodeId': string
  // ID of node
  '@nodeType': string
  // Properties/keys of node
  '@properties': Array<string>
}

// Similar to but incompatible with schema.org PropertyValue
export type SelectiveProperty = {
  '@type': 'SelectiveProperty'
  // Original VC ID
  '@vcId': string
  // @nodeId assigned to node
  '@nodeId': string
  // @type assigned to node
  '@nodeType'?: string

  // Property and value from original node
  property: string
  value: string | number | boolean | null | undefined
}

export type SelectiveMeta = {
  '@type': 'SelectiveMeta'
  // Original VC ID
  '@vcId': string
  // Top-level "type" of original VC
  '@vcType': VCV1Type
  // Top-level "@context" of original VC
  '@vcContext'?: TContext
}

/////////////////////////////////////////////////
// Credential subjects and types
/////////////////////////////////////////////////
export type SelectiveNodeWrapper = { nodes: [SelectiveNode] }
export type SelectiveEdgeWrapper = { edges: [SelectiveEdge] }
export type VCV1SelectiveStructuralAtomSubjectData = {
  // Original VC ID
  '@vcId': string
  '@type': 'SelectiveStructure'
} & (SelectiveNodeWrapper | SelectiveEdgeWrapper)

export type VCV1SelectiveStructuralFullSubjectData = {
  // Original VC ID
  '@vcId': string
  '@type': 'SelectiveStructuralFull'
  nodes: Array<SelectiveNode>
  edges: Array<SelectiveEdge>
}

// Full node, identical to primitive VC with added constraint that every object contained within the CredentialSubject has a @nodeId property specified
export type VCV1SelectiveFullType = [VCV1Type[0], 'SelectiveFullCredential', ...string[]]
export type VCV1SelectiveFullSubject<T extends SimpleThing> = VCV1Subject<T & { '@vcId': string }>

// SelectiveStructuralFull: Metadata of all nodes and edges
export type VCV1SelectiveStructuralFullType = [VCV1Type[0], 'SelectiveStructuralFullCredential', ...string[]]
export type VCV1SelectiveStructuralFullSubject = VCV1Subject<VCV1SelectiveStructuralFullSubjectData>

// SelectiveStructuralAtom: Metadata of single node or edge
export type VCV1SelectiveStructuralAtomType = [VCV1Type[0], 'SelectiveStructuralAtomCredential', ...string[]]
export type VCV1SelectiveStructuralAtomSubject = VCV1Subject<VCV1SelectiveStructuralAtomSubjectData>

// SelectiveNodePropertyList: Manifest of properties for node
export type VCV1SelectiveNodePropertyListType = [VCV1Type[0], 'SelectiveNodePropertyListCredential', ...string[]]
export type VCV1SelectiveNodePropertyListSubject = VCV1Subject<SelectiveNodePropertyList>

// SelectivePropertySubject: VC for single property of node
export type VCV1SelectivePropertyType = [VCV1Type[0], 'SelectivePropertyCredential', ...string[]]
export type VCV1SelectivePropertySubject = VCV1Subject<SelectiveProperty>

// SelectiveTypeSubject: VC for single property of node
export type VCV1SelectiveMetaType = [VCV1Type[0], 'SelectiveMetaCredential', ...string[]]
export type VCV1SelectiveMetaSubject = VCV1Subject<SelectiveMeta>

export type VCV1SelectiveSubjectAny<T extends SimpleThing = any> =
  | VCV1SelectiveFullSubject<T>
  | VCV1SelectiveStructuralFullSubject
  | VCV1SelectiveStructuralAtomSubject
  | VCV1SelectiveNodePropertyListSubject
  | VCV1SelectivePropertySubject
  | VCV1SelectiveMetaSubject
export type VCV1SelectiveTypeAny =
  | VCV1SelectiveFullType
  | VCV1SelectiveStructuralFullType
  | VCV1SelectiveStructuralAtomType
  | VCV1SelectiveNodePropertyListType
  | VCV1SelectivePropertyType
  | VCV1SelectiveMetaType

/////////////////////////////////////////////////
// Fully constructed VCs
/////////////////////////////////////////////////
export type VCV1SelectiveFull<T extends SimpleThing> = VCV1<VCV1SelectiveFullSubject<T>, VCV1SelectiveFullType>
export type VCV1SelectiveStructuralFull = VCV1<VCV1SelectiveStructuralFullSubject, VCV1SelectiveStructuralFullType>
export type VCV1SelectiveStructuralAtom = VCV1<VCV1SelectiveStructuralAtomSubject, VCV1SelectiveStructuralAtomType>
export type VCV1SelectiveNodePropertyList = VCV1<
  VCV1SelectiveNodePropertyListSubject,
  VCV1SelectiveNodePropertyListType
>
export type VCV1SelectiveProperty = VCV1<VCV1SelectivePropertySubject, VCV1SelectivePropertyType>
export type VCV1SelectiveMeta = VCV1<VCV1SelectiveMetaSubject, VCV1SelectiveMetaType>
