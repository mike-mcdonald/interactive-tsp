import * as turf from '@turf/helpers';
import RBush from 'rbush';

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
  name?: string;
  block?: number;
  classifications?: { [key: string]: string };
  projects?: Array<Project>;
  geometry?: turf.LineString;
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export interface StreetState {
  list?: Street[];
  rtree: RBush<Street>;
  selected?: Street;
}
