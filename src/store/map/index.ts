import { Module } from 'vuex';

import Basemap from 'esri/Basemap';
import { Extent } from 'esri/geometry';
import TileLayer from 'esri/layers/TileLayer';
import Map from 'esri/Map';

import { RootState } from '../types';
import { actions } from './actions';
import { mutations } from './mutations';
import { MapState } from './types';

const basemap: Basemap = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color/MapServer',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Buildings/MapServer',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Taxlot_Labels/MapServer'
].reduce((prev: Basemap, url: string) => {
  if (prev.baseLayers.length == 0) {
    prev = new Basemap({
      baseLayers: [
        new TileLayer({
          url
        })
      ]
    });
  } else {
    prev.baseLayers.push(
      new TileLayer({
        url,
        minScale: 4513.988705
      })
    );
  }

  return prev;
}, new Basemap());

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
