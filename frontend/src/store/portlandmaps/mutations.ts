import { MutationTree } from 'vuex';
import { CandidateState } from './types';

export const mutations: MutationTree<CandidateState> = {
  setCandidates(state, candidates) {
    state.candidates = candidates;
  }
};
