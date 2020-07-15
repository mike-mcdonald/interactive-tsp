import { Module } from 'vuex';
import { RootState } from '../types';
import { CandidateState } from './types';

import { actions } from './actions';
import { mutations } from './mutations';

const namespaced = true;

const state: CandidateState = {
  candidates: undefined
};

export default {
  namespaced,
  state,
  actions,
  mutations
} as Module<CandidateState, RootState>;
