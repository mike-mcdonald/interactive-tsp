import { Module } from 'vuex';
import { RootState } from '../types';

import { TextState } from './types';
import { actions } from './actions';
import { mutations } from './mutations';

const namespaced: boolean = true;

const state: TextState = {
  sections: undefined
};

export default {
  namespaced,
  state,
  actions,
  mutations
} as Module<TextState, RootState>;
