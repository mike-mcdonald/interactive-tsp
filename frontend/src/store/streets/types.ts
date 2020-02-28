import * as turf from '@turf/helpers';
import { RGBColor, HSLColor } from 'd3';
import Layer from 'esri/layers/Layer';

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

export interface ViewModel {
  key: string;
  value: string;
  enabled: boolean;
  label: string;
  count: number;
  color: RGBColor | HSLColor | null;
}

export interface StreetState {
  layers: Layer[];
  list?: Street[];
  selected?: Street;
  models?: Array<ViewModel>;
}
