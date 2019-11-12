import { MutationTree } from 'vuex';
import { Street, StreetState } from './types';

export const mutations: MutationTree<StreetState> = {
  clearStreets(state) {
    state.list = new Array<Street>();
    state.selected = undefined;
  },
  addStreet(state, street) {
    if (!state.list) {
      state.list = new Array<Street>();
    }
    state.list.push(street);
  }
};