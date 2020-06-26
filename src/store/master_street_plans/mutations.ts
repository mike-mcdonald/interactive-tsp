import { MutationTree } from 'vuex';
import { MasterStreetPlanState, MasterStreetPlan, MasterStreetPlanFeature } from './types';

export const mutations: MutationTree<MasterStreetPlanState> = {
  setList(state, list: Array<MasterStreetPlan>) {
    state.list = list;
  },
  setSelected(state, plan: MasterStreetPlan) {
    state.selected = plan;
  },
  setFeatures(state, features: Array<MasterStreetPlanFeature>) {
    if (state.selected) state.selected.features = features;
  }
};
