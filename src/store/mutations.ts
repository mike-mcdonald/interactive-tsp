import { MutationTree } from 'vuex';
import { RootState } from './types';

export const mutations: MutationTree<RootState> = {
  setMessage(state, message) {
    state.message = message;
  }
};
