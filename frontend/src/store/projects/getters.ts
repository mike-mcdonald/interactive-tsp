import { GetterTree } from 'vuex';
import { ProjectState, Project } from './types';
import { RootState } from '../types';

export const getters: GetterTree<ProjectState, RootState> = {
  filteredProjects(state) {
    let projects = state.list;

    if (state.filter.text && state.index) {
      projects = state.index.search(state.filter.text).map(val => {
        return (
          state.list.find(proj => {
            return proj.id == val.ref;
          }) || { id: val.ref }
        );
      });
    }

    if (state.filter.timeframes) {
      projects = projects.reduce((acc, curr) => {
        if (
          curr.estimatedTimeframe &&
          state.filter.timeframes &&
          state.filter.timeframes.indexOf(curr.estimatedTimeframe) > -1
        )
          acc.push(curr);
        return acc;
      }, new Array<Project>());
    }

    return projects;
  }
};
