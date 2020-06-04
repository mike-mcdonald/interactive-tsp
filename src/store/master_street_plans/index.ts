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
      url: 'https://services.arcgis.com/quVN97tn06YNGj9s/ArcGIS/rest/services/Master_Street_Plans/FeatureServer/3',
      outFields: ['*']
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
