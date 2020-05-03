import * as turf from '@turf/helpers';
import { RGBColor, HSLColor } from 'd3-color';
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
  uuid: string;
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

export interface Symbol {
  type: 'color' | 'image';
  value: RGBColor | HSLColor | string | null;
}

export interface ImageSymbol extends Symbol {
  mime: string;
  value: string;
}

export interface ViewModel {
  value: string;
  group: string;
  enabled: boolean;
  label: string;
  symbol?: Symbol | ImageSymbol;
  layer?: Layer;
}

export interface StreetState {
  list?: Street[];
  selected?: Array<Street>;
  models?: Array<ViewModel>;
}
