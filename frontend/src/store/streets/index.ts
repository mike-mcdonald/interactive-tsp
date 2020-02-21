import { Module } from 'vuex';
import { RootState } from '../types';
import { StreetState, Street, ClassificationAnalysisData } from './types';

import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import axios from 'axios';
import * as d3 from 'd3';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GroupLayer from 'esri/layers/GroupLayer';
import UniqueValueInfo from 'esri/renderers/support/UniqueValueInfo';

const namespaced: boolean = true;

const layers = [
  new GroupLayer({
    id: 'pedestrian',
    title: 'Pedestrian classifications',
    visibilityMode: 'inherited',
    visible: true,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/16',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15'
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
    title: 'Bicycle classifications',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/13',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12'
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
    title: 'Transit classifications',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/2',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/1',
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
    title: 'Freight classifications',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/20',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/18'
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
    title: 'Street design classifications',
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
    title: 'Emergency response classifications',
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
    title: 'Traffic classifications',
    url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4',
    visible: false,
    outFields: ['*']
  })
];

const analysis = new Array<ClassificationAnalysisData>();

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
        classification: key,
        classificationValue: info.value.toString(),
        label: info.label,
        color: d3.rgb(r, g, b, a),
        count: 0
      });
    });
  }
});

const state: StreetState = {
  layers,
  list: new Array<Street>(),
  selected: undefined,
  analysis
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
} as Module<StreetState, RootState>;
