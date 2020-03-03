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
            enabled: false,
            label: info.label,
            color: rgb(r, g, b, a),
            count: 0,
            layer: new FeatureLayer({
              url,
              outFields: ['*'],
              definitionExpression: `${group} = '${info.value.toString()}'`,
              visible: false
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
