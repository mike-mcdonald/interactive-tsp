import Layer from 'esri/layers/Layer';
import { Geometry } from 'geojson';

export interface AreaPlan {
  id: number;
  name: string;
  manager: string;
  requirements: string;
  adopted: string;
  document: string;
  geometry: Geometry;
}

export interface AreaPlanState {
  list: Array<AreaPlan>;
  selected?: AreaPlan;
  layers: Array<Layer>;
}
