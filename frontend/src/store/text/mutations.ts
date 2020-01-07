import { MutationTree } from 'vuex';
import { TextState, TextSection } from './types';

export const mutations: MutationTree<TextState> = {
  setText(state, sections) {
    state.sections = sections;
  },
  setIndex(state, index: lunr.Index) {
    state.index = index;
  },
  setCandidates(state, candidates: TextSection[]) {
    state.candidates = candidates;
  }
};
