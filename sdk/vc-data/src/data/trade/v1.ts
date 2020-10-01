import { VCV1, VCV1Subject } from '@affinidi/vc-common'

import { PersonEV1, OrganizationEV1, getBaseV1ContextEntries } from '../base/v1'
import {
  CreateThing,
  ExtendThing,
  Type,
  ExpandThing,
  MaybeArray,
  createContextEntry,
  createVCContextEntry,
  CreateExpandedThing,
} from '../util'

// Helper Types

type ProductEV1Mixn = CreateThing<
  'ProductE',
  {
    hasValue?: MaybeArray<CreateExpandedThing<'MonetaryAmount'>>
  }
>

export type ProductEV1 = ExtendThing<ProductEV1Mixn, CreateThing<'Product'>>

type PortV1Mixin = CreateThing<'Port'>

export type PortV1 = ExtendThing<PortV1Mixin, CreateThing<'Place'>>

export type ShipmentV1 = CreateThing<
  'Shipment',
  {
    hasValue?: MaybeArray<CreateExpandedThing<'MonetaryAmount'>>
    shippedOn?: string // Date ISO 8601
    originAddress?: CreateExpandedThing<'PostalAddress'>
    deliveryAddress?: CreateExpandedThing<'PostalAddress'>
    orderedItem?: MaybeArray<ExpandThing<ProductEV1>>
  }
>

export type CargoReceiptV1 = CreateThing<
  'CargoReceipt',
  {
    shipper?: ExpandThing<PersonEV1> | ExpandThing<OrganizationEV1>
    recipient?: ExpandThing<PersonEV1> | ExpandThing<OrganizationEV1>
    shipment?: ShipmentV1
    portLoading?: ExpandThing<PortV1>
    portUnloading?: ExpandThing<PortV1>
  }
>

const getHelperContextEntries = () => {
  const productEEntry = createContextEntry<ProductEV1Mixn>({
    type: 'ProductE',
    typeIdBase: 'affSchema',
    fields: {
      hasValue: 'affSchema',
    },
    vocab: 'schema',
  })

  const portEntry = createContextEntry<PortV1Mixin>({
    type: 'Port',
    typeIdBase: 'affSchema',
    fields: {},
    vocab: 'schema',
  })

  const shipmentEntry = createContextEntry<ShipmentV1>({
    type: 'Shipment',
    typeIdBase: 'affSchema',
    fields: {
      hasValue: 'affSchema',
      shippedOn: 'affSchema',
      originAddress: 'affSchema',
      deliveryAddress: 'affSchema',
      orderedItem: 'affSchema',
    },
  })

  const cargoReceiptEntry = createContextEntry<CargoReceiptV1>({
    type: 'CargoReceipt',
    typeIdBase: 'affSchema',
    fields: {
      shipper: 'affSchema',
      recipient: 'affSchema',
      shipment: 'affSchema',
      portLoading: 'affSchema',
      portUnloading: 'affSchema',
    },
  })

  return [productEEntry, portEntry, shipmentEntry, cargoReceiptEntry]
}

// Cargo Receipt Related

export type VCSCargoReceiptV1 = VCV1Subject<ExpandThing<CargoReceiptV1>>

export type VCCargoReceiptV1 = VCV1<VCSCargoReceiptV1, Type<'CargoReceiptCredentialV1'>>

export const getVCCargoReceiptV1Context = () => {
  return createVCContextEntry<VCCargoReceiptV1>({
    type: 'CargoReceiptCredentialV1',
    typeIdBase: 'affSchema',
    entries: [...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}

// Bill Of Lading Related

type BillOfLadingV1Mixin = CreateThing<'BillOfLading'>

export type BillOfLadingV1 = ExtendThing<BillOfLadingV1Mixin, CargoReceiptV1>

export type VCSBillOfLadingV1 = VCV1Subject<ExpandThing<BillOfLadingV1>>

export type VCBillOfLadingV1 = VCV1<VCSBillOfLadingV1, Type<'BillOfLadingCredentialV1'>>

export const getVCBillOfLadingV1Context = () => {
  const billOfLadingEntry = createContextEntry<BillOfLadingV1Mixin, CargoReceiptV1>({
    type: 'BillOfLading',
    typeIdBase: 'affSchema',
    fields: {},
  })

  return createVCContextEntry<VCBillOfLadingV1>({
    type: 'BillOfLadingCredentialV1',
    typeIdBase: 'affSchema',
    entries: [billOfLadingEntry, ...getHelperContextEntries(), ...getBaseV1ContextEntries()],
    vocab: 'schema',
  })
}
