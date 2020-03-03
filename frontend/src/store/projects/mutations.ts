import { MutationTree } from 'vuex';
import { ProjectState, Project, ViewModel } from './types';

export const mutations: MutationTree<ProjectState> = {
  setModels(state, models: Array<ViewModel>) {
    state.models = models;
  },
  setProjects(state, projects: Array<Project>) {
    state.list = projects;
  },
  setSelected(state, projects: Array<Array<Project>>) {
    state.selected = projects;
  },
  setIndex(state, index: lunr.Index) {
    state.index = index;
  }
};
