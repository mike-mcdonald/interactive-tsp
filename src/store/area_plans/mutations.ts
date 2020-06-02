import { MutationTree } from 'vuex';
import { AreaPlanState, AreaPlan } from './types';

export const mutations: MutationTree<AreaPlanState> = {
  setList(state, plans: Array<AreaPlan>) {
    state.list = plans;
  },
  setSelected(state, plan: AreaPlan) {
    state.selected = plan;
  }
};
