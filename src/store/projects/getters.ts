import { GetterTree } from 'vuex';

import Layer from 'esri/layers/Layer';

import { ProjectState, Project, ViewModel } from './types';
import { RootState } from '../types';

export const getters: GetterTree<ProjectState, RootState> = {
  mapLayers(state) {
    return state.models.reduce((prev, curr) => {
      prev.push(curr.mapLayer);
      return prev;
    }, new Array<Layer>());
  },
  filteredProjects: state => (text: string) => {
    let projects = state.list;

    const map = state.models.reduce((prev: Map<string, ViewModel>, curr: ViewModel) => {
      prev.set(curr.value, curr);
      return prev;
    }, new Map<string, ViewModel>());

    if (text && state.index) {
      projects = state.index
        .search(text)
        .map(val => {
          return (
            state.list.find(proj => {
              return proj.id == val.ref;
            }) || { id: val.ref }
          );
        })
        .reduce((prev, curr) => {
          if (curr.estimatedTimeframe && map.has(curr.estimatedTimeframe)) {
            prev.push(curr);
          }
          return prev;
        }, new Array<Project>());
    }

    return projects;
  }
};
