import { Geometry } from '@turf/helpers';
import Layer from 'esri/layers/Layer';

export interface Project {
  id: string;
  name?: string;
  geometry?: Geometry;
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

export interface ProjectState {
  layers: Array<Layer>;
  list: Array<Project>;
  selected?: Array<Project>;
}
