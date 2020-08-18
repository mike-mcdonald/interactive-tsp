import { Module } from 'vuex';

import Basemap from 'esri/Basemap';
import { Extent } from 'esri/geometry';
import TileLayer from 'esri/layers/TileLayer';
import Map from 'esri/Map';

import { RootState } from '../types';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
import { MapState } from './types';

const basemap: Basemap = new Basemap({
  baseLayers: [
    new TileLayer({
      url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color/MapServer'
    })
  ]
});

export const defaultExtent = new Extent({
  spatialReference: { wkid: 102100 },
  xmin: -13674088.5469,
  ymin: 5689892.284199998,
  xmax: -13633591.503800001,
  ymax: 5724489.626800001
});

const state: MapState = {
  map: new Map({
    basemap
  }),
  extent: defaultExtent,
  zoom: {
    current: 6,
    focus: 13,
    max: 14,
    min: 4
  }
};

const namespaced = true;

export const map: Module<MapState, RootState> = {
  namespaced,
  state,
  actions,
  getters,
  mutations
};
