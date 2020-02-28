import { MutationTree } from 'vuex';
import { ProjectState, Project, ViewModel } from './types';

export const mutations: MutationTree<ProjectState> = {
  setModels(state, models: Array<ViewModel>) {
    state.models = models;
  },
  clearProjects(state) {
    state.list = new Array<Project>();
  },
  addProjects(state, projects: Project[]) {
    if (!state.list) {
      state.list = new Array<Project>();
    }
    state.list.push(...projects);
  },
  setSelectedProjects(state, projects: Project[]) {
    state.selected = projects;
  },
  setIndex(state, index: lunr.Index) {
    state.index = index;
  }
};
