import { MutationTree } from 'vuex';
import { ProjectState, Project, ProjectFilter } from './types';

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
  setFilter(state, filter: ProjectFilter) {
    state.filter = filter;
  },
  addTimeframe(state, timeframe: string) {
    const idx = state.filter.timeframes?.indexOf(timeframe);
    if (idx && idx == -1) {
      state.filter.timeframes?.push(timeframe);
    }
  },
  removeTimeframe(state, timeframe: string) {
    const idx = state.filter.timeframes?.indexOf(timeframe);
    if (idx && idx > -1) {
      state.filter.timeframes?.splice(idx, 1);
    }
  },
  setSelectedProjects(state, projects: Project[]) {
    state.selected = projects;
  },
  setIndex(state, index: lunr.Index) {
    state.index = index;
  }
};
