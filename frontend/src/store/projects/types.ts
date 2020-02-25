import { Geometry } from '@turf/helpers';
import Layer from 'esri/layers/Layer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GroupLayer from 'esri/layers/GroupLayer';
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

export interface ProjectFilter {
  extent?: __esri.Extent;
  timeframes?: Array<string>;
  text?: string;
}

export interface ProjectState {
  layers: Array<GroupLayer>;
  list: Array<Project>;
  filter: ProjectFilter;
  candidates: Array<Project> | undefined;
  index: Index | undefined;
  selected?: Array<Project>;
}
