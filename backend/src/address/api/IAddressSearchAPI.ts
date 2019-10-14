import { AddressCandidate } from '../types';

export interface IAddressSearchAPI {
  search(query: string): Promise<AddressCandidate[]>;
}
