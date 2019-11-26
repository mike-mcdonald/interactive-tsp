import { MutationTree } from 'vuex';
import { ProjectState, Project } from './types';

export const mutations: MutationTree<ProjectState> = {
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
  }
};
