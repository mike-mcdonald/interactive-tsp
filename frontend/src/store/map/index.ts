import { Module } from 'vuex';

import Basemap from 'esri/Basemap';
import { Extent } from 'esri/geometry';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GroupLayer from 'esri/layers/GroupLayer';
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

const layers = [
  new GroupLayer({
    id: 'pedestrian-classifications',
    title: 'Pedestrian classes',
    visibilityMode: 'inherited',
    visible: true,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/16'
    ].map(
      url =>
        new FeatureLayer({
          url
        })
    )
  }),
  new GroupLayer({
    id: 'bicycle-classifications',
    title: 'Bicycle classes',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/13'
    ].map(
      url =>
        new FeatureLayer({
          url
        })
    )
  }),
  new GroupLayer({
    id: 'transit-classifications',
    title: 'Transit classes',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/1',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/2',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3'
    ].map(
      url =>
        new FeatureLayer({
          url
        })
    )
  }),
  new GroupLayer({
    id: 'freight-classifications',
    title: 'Freight classes',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/18',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/20'
    ].map(
      url =>
        new FeatureLayer({
          url
        })
    )
  }),
  new GroupLayer({
    id: 'street-design-classifications',
    title: 'Street design classes',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/9',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10'
    ].map(
      url =>
        new FeatureLayer({
          url
        })
    )
  }),
  new GroupLayer({
    id: 'emergency-classifications',
    title: 'Emergency response classes',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/6',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7'
    ].map(
      url =>
        new FeatureLayer({
          url
        })
    )
  }),
  new FeatureLayer({
    id: 'traffic-classifications',
    title: 'Traffic classes',
    url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4',
    visible: false
  }),
  new GroupLayer({
    id: 'projects',
    title: 'Projects',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24'
    ].map(
      url =>
        new FeatureLayer({
          url
        })
    )
  })
];

const state: MapState = {
  map: new Map({
    basemap: basemaps[1],
    layers
  }),
  extent: new Extent({
    spatialReference: { wkid: 102100 },
    xmin: -13678470.214582363,
    ymin: 5685553.212194719,
    xmax: -13629932.70162134,
    ymax: 5723122.011596833
  }),
  basemaps: basemaps,
  layers,
  zoom: {
    current: 6,
    focus: 12,
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
