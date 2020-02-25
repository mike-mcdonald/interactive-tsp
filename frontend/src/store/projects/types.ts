import { Geometry } from '@turf/helpers';
import { RGBColor } from 'd3';
import { Index } from 'lunr';

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
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export interface ViewModel {
  key: string;
  value: string;
  label: string;
  color: RGBColor;
  enabled: boolean;
  mapLayer: any;
  count: number;
}

export interface ProjectState {
  models: Array<ViewModel>;
  list: Array<Project>;
  candidates: Array<Project> | undefined;
  index: Index | undefined;
  selected?: Array<Project>;
}
