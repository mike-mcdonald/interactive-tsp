import { MutationTree } from 'vuex';
import { Street, StreetState, ViewModel } from './types';

export const mutations: MutationTree<StreetState> = {
  setList(state, streets: Array<Street>) {
    state.list = streets;
  },
  setSelectedStreet(state, street: Array<Street>) {
    state.selected = street;
  },
  setModels(state, models: Array<ViewModel>) {
    state.models = models;
  }
};
