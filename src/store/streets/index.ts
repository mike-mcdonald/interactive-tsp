import { Module } from 'vuex';
import { RootState } from '../types';
import { StreetState, Street, ViewModel } from './types';

import axios from 'axios';
import { rgb } from 'd3-color';
import FeatureLayer from 'esri/layers/FeatureLayer';
import UniqueValueInfo from 'esri/renderers/support/UniqueValueInfo';

import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

const namespaced: boolean = true;

const models = new Array<ViewModel>();

const districts = new Map([
  ['pedestrian', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/16'],
  ['bicycle', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/13'],
  ['freight', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/20']
]);

const classifications = new Map([
  ['pedestrian', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15'],
  ['bicycle', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12'],
  ['transit', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3'],
  ['freight', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19'],
  ['design', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10'],
  ['emergency', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7'],
  ['traffic', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4']
]);

Promise.all(
  Array.from(districts).map(async value => {
    const res = await axios.get(value[1], {
      params: {
        f: 'json'
      }
    });

    if (res.data) {
      const layer = res.data;
      models.push({
        group: value[0],
        value: 'undefined',
        enabled: false,
        label: layer.name,
        layer: new FeatureLayer({
          url: value[1],
          visible: false
        })
      });
    }
  })
).then(() => {
  Array.from(classifications).map(async value => {
    const res = await axios.get(value[1], {
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
              group: value[0],
              value: info.value.toString(),
              enabled: false,
              label: info.label,
              color: rgb(r, g, b, a),
              layer: new FeatureLayer({
                url: value[1],
                outFields: ['*'],
                definitionExpression: `${value[0]} = '${info.value.toString()}'`,
                visible: false
              })
            };
          }
        )
      );
    }
  });
});

models.push({
  group: 'greenscape',
  value: 'Y',
  enabled: false,
  label: 'Yes'
});

models.push({
  group: 'greenscape',
  value: 'N',
  enabled: false,
  label: 'No'
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
