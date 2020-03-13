import { Module } from 'vuex';
import { RootState } from '../types';
import { ProjectState, Project, ViewModel } from './types';

import axios from 'axios';
import { rgb } from 'd3-color';
import GroupLayer from 'esri/layers/GroupLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';

import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

const namespaced: boolean = true;

const LAYER_URLS = new Array<string>(
  ...[
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
    'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24'
  ]
);

const map = new Map<string, string>([
  ['1-10_YRS', 'projects-10'],
  ['11-20_YRS', 'projects-20'],
  ['NA', 'projects-NA']
]);

const models = new Array<ViewModel>();

LAYER_URLS.some(async url => {
  const res = await axios.get(url, {
    params: {
      f: 'json'
    }
  });

  if (res.data) {
    models.push(
      ...res.data.drawingInfo.renderer.uniqueValueInfos.map((info: any) => {
        const [r, g, b, a] = info.symbol.color;

        const key = map.get(info.value.toString());

        if (key) {
          const model: ViewModel = {
            key,
            value: info.value.toString(),
            label: info.label,
            color: rgb(r, g, b, a),
            enabled: true,
            count: 0,
            mapLayer: new GroupLayer({
              id: key,
              title: info.label,
              visibilityMode: 'inherited',
              visible: true,
              layers: LAYER_URLS.map(
                (url: string) =>
                  new FeatureLayer({
                    url,
                    outFields: ['*'],
                    definitionExpression: `estimatedTimeFrame = '${info.value.toString()}'`
                  })
              )
            })
          };

          return model;
        }
      })
    );
  }

  return true;
});

const state: ProjectState = {
  models,
  list: new Array<Project>(),
  candidates: undefined,
  index: undefined,
  selected: undefined
};

export default {
  namespaced,
  state,
  actions,
  getters,
  mutations
} as Module<ProjectState, RootState>;
