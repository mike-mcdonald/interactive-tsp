import { Module } from 'vuex';
import { RootState } from '../types';
import { StreetState, Street } from './types';

import { actions } from './actions';
import { mutations } from './mutations';
import RBush from 'rbush';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GroupLayer from 'esri/layers/GroupLayer';

const namespaced: boolean = true;

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
          url,
          outFields: ['*']
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
          url,
          outFields: ['*']
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
          url,
          outFields: ['*']
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
          url,
          outFields: ['*']
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
          url,
          outFields: ['*']
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
          url,
          outFields: ['*']
        })
    )
  }),
  new FeatureLayer({
    id: 'traffic-classifications',
    title: 'Traffic classes',
    url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4',
    visible: false,
    outFields: ['*']
  })
];

const state: StreetState = {
  layers,
  list: new Array<Street>(),
  selected: undefined
};

export default {
  namespaced,
  state,
  actions,
  mutations
} as Module<StreetState, RootState>;
