import GroupLayer from 'esri/layers/GroupLayer';
import Layer from 'esri/layers/Layer';
import { Geometry } from 'geojson';

export interface MasterStreetPlanFeature {
  name: string;
  label: string;
  count: number;
  enabled: boolean;
  layer: GroupLayer;
}

export interface MasterStreetPlan {
  id: number;
  name: string;
  label: string;
  document: string;
  features?: Array<MasterStreetPlanFeature>;
  geometry: Geometry;
}

export interface MasterStreetPlanState {
  list: Array<MasterStreetPlan>;
  selected?: MasterStreetPlan;
  layers: Array<Layer>;
}
