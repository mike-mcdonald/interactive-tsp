import Layer from 'esri/layers/Layer';
import { Geometry } from 'geojson';

export interface MasterStreetPlanFeature {
  id: string;
  type: string;
  alignment: string;
  count: number;
  enabled: boolean;
}

export interface MasterStreetPlan {
  id: number;
  name: string;
  description: string;
  manager: string;
  adopted: string;
  document: string;
  features?: Array<MasterStreetPlanFeature>;
  geometry: Geometry;
}

export interface MasterStreetPlanState {
  list: Array<MasterStreetPlan>;
  selected?: MasterStreetPlan;
  layers: Array<Layer>;
}
