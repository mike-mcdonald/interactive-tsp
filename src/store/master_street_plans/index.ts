import { Module } from 'vuex';

import FeatureLayer from 'esri/layers/FeatureLayer';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import GroupLayer from 'esri/layers/GroupLayer';

import { RootState } from '../types';
import { MasterStreetPlanState, MasterStreetPlan } from './types';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

const namespaced = true;

const LAYER_URLS = [
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/29',
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/30'
];

const state: MasterStreetPlanState = {
  list: new Array<MasterStreetPlan>(),
  selected: undefined,
  layers: [
    new FeatureLayer({
      id: 'plan-areas',
      url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/31',
      outFields: ['TranPlanID']
    }),
    new GraphicsLayer({
      id: 'plan-selection'
    }),
    new GroupLayer({
      id: 'plan-features',
      visibilityMode: 'inherited',
      visible: false,
      layers: LAYER_URLS.map(url => {
        return new FeatureLayer({
          url,
          outFields: ['TranPlanID', 'Type', 'Alignment']
        });
      })
    })
  ]
};

export default {
  namespaced,
  state,
  actions,
  getters,
  mutations
} as Module<MasterStreetPlanState, RootState>;
