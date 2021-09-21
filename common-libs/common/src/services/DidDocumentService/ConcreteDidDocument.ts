import { DidResolver } from '../../shared/DidResolver'

export interface ConcreteDidDocument<T extends { id: string } = { id: string }> {
  getMyDid(): string
  getKeyId(): string
  buildDidDocument(didResolver?: DidResolver): Promise<T>
}
