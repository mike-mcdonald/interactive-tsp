import { Module } from 'vuex';

import GraphicsLayer from 'esri/layers/GraphicsLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';

import { RootState } from '../types';
import { MasterStreetPlanState, MasterStreetPlan } from './types';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

const namespaced: boolean = true;

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
