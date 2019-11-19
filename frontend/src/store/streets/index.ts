import { Module } from 'vuex';
import { RootState } from '../types';
import { StreetState, Street } from './types';

import { actions } from './actions';
import { mutations } from './mutations';
import RBush from 'rbush';

const namespaced: boolean = true;

const state: StreetState = {
  list: new Array<Street>(),
  rtree: new RBush<Street>(),
  selected: undefined
};

export default {
  namespaced,
  state,
  actions,
  mutations
} as Module<StreetState, RootState>;
