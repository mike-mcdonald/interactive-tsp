import { MutationTree } from 'vuex';
import { Street, StreetState, ViewModel } from './types';

export const mutations: MutationTree<StreetState> = {
  setList(state, streets: Array<Street>) {
    state.list = streets;
  },
  setSelectedStreet(state, street: Street) {
    state.selected = street;
  },
  setAnalysis(state, models: Array<ViewModel>) {
    state.models = models;
  }
};
