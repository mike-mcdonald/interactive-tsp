import * as turf from '@turf/helpers';

export interface Classification {
  [key: string]: string;
  traffic: string;
  transit: string;
  bicycle: string;
  pedestrian: string;
  freight: string;
  emergency: string;
  design: string;
  greenscape: string;
}

export interface Project {
  id: string;
  name: string;
  number?: number;
  location?: string;
  description?: string;
  agency?: string;
  estimatedCost?: number;
  estimatedTimeframe?: string;
  district?: string;
  facilityOwner?: string;
  patternArea?: string;
  fundingCategory?: string;
}

export interface Street {
  id: string;
  name: string;
  block?: number;
  classifications: Classification;
  projects?: Array<Project>;
  geometry: turf.LineString;
}

export interface StreetState {
  version: string;
  list?: Street[];
  selected?: Street;
}
