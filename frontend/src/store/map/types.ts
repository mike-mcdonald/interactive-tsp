import Basemap from 'esri/Basemap';
import Extent from 'esri/geometry/Extent';
import Layer from 'esri/layers/Layer';
import MapView from 'esri/views/MapView';

export interface MapState {
  view?: MapView;
  extent: Extent;
  basemaps: Basemap[];
  layers: Layer[];
  zoom: {
    current?: number;
    focus: number;
    max: number;
    min: number;
  };
}
