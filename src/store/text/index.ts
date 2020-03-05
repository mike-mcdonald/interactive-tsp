import { Module } from 'vuex';
import { RootState } from '../types';

import { TextState } from './types';
import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';

const namespaced: boolean = true;

const state: TextState = {
  sections: undefined,
  index: undefined,
  candidates: undefined
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
} as Module<TextState, RootState>;
