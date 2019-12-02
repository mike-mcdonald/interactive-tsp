import { MutationTree } from 'vuex';
import { Street, StreetState } from './types';

export const mutations: MutationTree<StreetState> = {
  clearStreets(state) {
    state.list = new Array<Street>();
  },
  addStreets(state, streets: Street[]) {
    if (!state.list) {
      state.list = new Array<Street>();
    }
    state.list.push(...streets);
  },
  setSelectedStreet(state, street: Street) {
    state.selected = street;
  }
};
