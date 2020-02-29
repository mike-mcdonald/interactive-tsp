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
import UniqueValueInfo from 'esri/renderers/support/UniqueValueInfo';

const namespaced: boolean = true;

const layers = [
  new GroupLayer({
    id: 'pedestrian',
    title: 'Pedestrian classes',
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
    title: 'Bicycle classes',
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
    title: 'Transit classes',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/2',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/1'
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
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/20',
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
    title: 'Street design classes',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/9'
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
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/6'
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

const models = new Array<ViewModel>();

new Map([
  ['pedestrian', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15'],
  ['bicycle', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12'],
  ['transit', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3'],
  ['freight', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19'],
  ['design', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10'],
  ['emergency', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7'],
  ['traffic', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4']
]).forEach(async (url: string, group: string) => {
  const res = await axios.get(url, {
    params: {
      f: 'json'
    }
  });

  if (res.data) {
    models.push(
      ...res.data.drawingInfo.renderer.uniqueValueInfos.map(
        (json: any): ViewModel => {
          const info = UniqueValueInfo.fromJSON(json);
          const { r, g, b, a } = info.symbol.color;
          return {
            group,
            value: info.value.toString(),
            enabled: group === 'pedestrian',
            label: info.label,
            color: rgb(r, g, b, a),
            count: 0,
            layer: new FeatureLayer({
              url,
              outFields: ['*'],
              definitionExpression: `${group} = '${info.value.toString()}'`,
              visible: group === 'pedestrian'
            })
          };
        }
      )
    );
  }
});

models.push({
  group: 'greenscape',
  value: 'Y',
  enabled: false,
  label: 'Yes',
  color: rgb(255, 255, 255, 255),
  count: 0
});

models.push({
  group: 'greenscape',
  value: 'N',
  enabled: false,
  label: 'No',
  color: rgb(255, 255, 255, 255),
  count: 0
});

const state: StreetState = {
  list: new Array<Street>(),
  selected: undefined,
  models
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
} as Module<StreetState, RootState>;
