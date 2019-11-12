import { Module } from 'vuex';
import { RootState } from '../types';
import { StreetState, Street } from './types';

import { actions } from './actions';
import { mutations } from './mutations';
import { getters } from './getters';

const namespaced: boolean = true;

const state: StreetState = {
  version: '1.0.0',
  list: new Array<Street>(),
  selected: undefined
};

export default {
  namespaced,
  state,
  getters,
  actions,
  mutations
} as Module<StreetState, RootState>;
