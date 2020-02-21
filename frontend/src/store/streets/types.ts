import * as turf from '@turf/helpers';
import RBush from 'rbush';
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
  classifications?: { [key: string]: string | undefined };
  projects?: Array<Project>;
  geometry?: turf.LineString;
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export interface ClassificationAnalysisData {
  classification: string;
  classificationValue: string;
  label: string;
  count: number;
  color: d3.RGBColor | d3.HSLColor | null;
}

export interface StreetState {
  layers: Layer[];
  list?: Street[];
  selected?: Street;
  analysis?: Array<ClassificationAnalysisData>;
}
