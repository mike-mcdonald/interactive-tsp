export interface Location {
  x: number;
  y: number;
  spatialReference: any;
}

export interface AddressCandidate {
  location: Location;
  name: string;
  city?: string;
  zipCode?: number;
  state?: string;
  zip4?: number;
  id?: number;
  type?: string;
  county?: string;
}

export interface CandidateState {
  candidates?: AddressCandidate[];
}
