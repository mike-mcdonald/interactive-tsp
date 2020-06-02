import { Module } from 'vuex';

import GraphicsLayer from 'esri/layers/GraphicsLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';

import { RootState } from '../types';
import { AreaPlanState, AreaPlan } from './types';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

const namespaced: boolean = true;

const LAYER_URLS = [
  'https://services.arcgis.com/quVN97tn06YNGj9s/ArcGIS/rest/services/TSP_Area_Plans_Map5_WFL1/FeatureServer/2',
  'https://services.arcgis.com/quVN97tn06YNGj9s/ArcGIS/rest/services/TSP_Area_Plans_Map5_WFL1/FeatureServer/0',
  'https://services.arcgis.com/quVN97tn06YNGj9s/ArcGIS/rest/services/TSP_Area_Plans_Map5_WFL1/FeatureServer/1'
];

const state: AreaPlanState = {
  list: new Array<AreaPlan>(),
  selected: undefined,
  layers: [
    ...LAYER_URLS.map(
      url =>
        new FeatureLayer({
          url,
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
  getters,
  mutations
} as Module<AreaPlanState, RootState>;
