import { MutationTree } from 'vuex';
import { MasterStreetPlanState, MasterStreetPlan } from './types';

export const mutations: MutationTree<MasterStreetPlanState> = {
  setList(state, list: Array<MasterStreetPlan>) {
    state.list = list;
  },
  setSelected(state, plan: MasterStreetPlan) {
    state.selected = plan;
  }
};
