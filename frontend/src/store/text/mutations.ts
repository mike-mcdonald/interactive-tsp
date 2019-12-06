import { MutationTree } from 'vuex';
import { TextState } from './types';

export const mutations: MutationTree<TextState> = {
  setText(state, sections) {
    state.sections = sections;
  }
};
