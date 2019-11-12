import Extent from 'esri/geometry/Extent';
import Layer from 'esri/layers/Layer';

export interface MapState {
  extent: Extent;
  layers: Map<string, Layer>;
  basemaps: Map<string, any>;
}
