import { Module } from 'vuex';

import GraphicsLayer from 'esri/layers/GraphicsLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';

import { RootState } from '../types';
import { AreaPlanState, AreaPlan } from './types';
import { actions } from './actions';
import { mutations } from './mutations';

const namespaced = true;

const LAYER_URLS = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/26',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/27'
];

const state: AreaPlanState = {
  list: new Array<AreaPlan>(),
  selected: undefined,
  layers: [
    ...LAYER_URLS.map(
      url =>
        new FeatureLayer({
          url,
          outFields: ['TranPlanID'],
          opacity: 0.5
        })
    ),
    new GraphicsLayer({
      id: 'plan-selection'
    })
  ]
};

export default {
  namespaced,
  state,
  actions,
  mutations
} as Module<AreaPlanState, RootState>;
