import { Module } from 'vuex';
import { RootState } from '../types';
import { ProjectState, Project } from './types';

import { actions } from './actions';
import { mutations } from './mutations';

const namespaced: boolean = true;

const state: ProjectState = {
  list: new Array<Project>(),
  selected: undefined
};

export default {
  namespaced,
  state,
  actions,
  mutations
} as Module<ProjectState, RootState>;
