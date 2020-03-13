import { Module } from 'vuex';

import Basemap from 'esri/Basemap';
import { Extent } from 'esri/geometry';
import TileLayer from 'esri/layers/TileLayer';
import Map from 'esri/Map';

import { RootState } from '../types';
import { actions } from './actions';
import { mutations } from './mutations';
import { MapState } from './types';

const basemaps: Basemap[] = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Complete/MapServer',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Gray_Complete/MapServer',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Complete_Aerial/MapServer'
].map(url => {
  const regexMatch = /Basemap_([a-zA-Z_]+)\//i.exec(url);
  let title = 'Unknown title';
  let id = 'uknown-id';

  if (regexMatch) {
    title = regexMatch[1].replace('_', ' ').replace('_', ' ');
    id = regexMatch[1]
      .replace('_', '-')
      .replace('_', '-')
      .toLowerCase();
  }

  return new Basemap({
    id,
    baseLayers: [
      new TileLayer({
        url
      })
    ],
    title
  });
});

const state: MapState = {
  map: new Map({
    basemap: basemaps[1]
  }),
  extent: new Extent({
    spatialReference: { wkid: 102100 },
    xmin: -13678470.214582363,
    ymin: 5685553.212194719,
    xmax: -13629932.70162134,
    ymax: 5723122.011596833
  }),
  basemaps: basemaps,
  zoom: {
    current: 6,
    focus: 11,
    max: 14,
    min: 4
  }
};

const namespaced: boolean = true;

export const map: Module<MapState, RootState> = {
  namespaced,
  state,
  actions,
  mutations
};
