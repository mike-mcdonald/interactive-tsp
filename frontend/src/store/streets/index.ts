import { Module } from 'vuex';
import { RootState } from '../types';
import { StreetState, Street, ViewModel } from './types';

import axios from 'axios';
import { rgb } from 'd3';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GroupLayer from 'esri/layers/GroupLayer';

import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

const namespaced: boolean = true;

const layers = [
  new GroupLayer({
    id: 'pedestrian',
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
    id: 'bicycle',
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
    id: 'transit',
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
    id: 'freight',
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
    id: 'design',
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
    id: 'emergency',
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
    id: 'traffic',
    title: 'Traffic classes',
    url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4',
    visible: false,
    outFields: ['*']
  })
];

const analysis = new Array<ViewModel>();

new Map([
  ['transit', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3'],
  ['traffic', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4'],
  ['emergency', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7'],
  ['design', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10'],
  ['bicycle', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12'],
  ['pedestrian', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15'],
  ['freight', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19']
]).forEach(async (url: string, key: string) => {
  const res = await axios.get(url, {
    params: {
      f: 'json'
    }
  });

  if (res.data) {
    res.data.drawingInfo.renderer.uniqueValueInfos.map((info: any) => {
      const [r, g, b, a] = info.symbol.color;
      analysis.push({
        key,
        value: info.value.toString(),
        enabled: key === 'pedestrian',
        label: info.label,
        color: rgb(r, g, b, a),
        count: 0
      });
    });
  }
});

analysis.push({
  key: 'greenscape',
  value: 'Y',
  enabled: false,
  label: 'Yes',
  color: rgb(255, 255, 255, 255),
  count: 0
});

analysis.push({
  key: 'greenscape',
  value: 'N',
  enabled: false,
  label: 'No',
  color: rgb(255, 255, 255, 255),
  count: 0
});

const state: StreetState = {
  layers,
  list: new Array<Street>(),
  selected: undefined,
  models: analysis
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
} as Module<StreetState, RootState>;
