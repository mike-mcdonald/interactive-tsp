import { ActionTree } from 'vuex';
import { ProjectState, Project } from './types';
import { RootState } from '../types';

import axios from 'axios';
import Graphic from 'esri/Graphic';
import lunr from 'lunr';

import { esriGraphics } from '../utils';

export const actions: ActionTree<ProjectState, RootState> = {
  async findProjects({ state, commit, dispatch, rootState }, { extent }: { extent?: __esri.Extent }) {
    commit('setMessage', undefined, { root: true });
    let projects = state.list;
    if (extent) {
      const { xmin, ymin, xmax, ymax } = extent;
      const res = await axios.get<{ errors?: any[]; data: { projects?: Project[] } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          projects(bbox:[${xmin},${ymin},${xmax},${ymax}], spatialReference:${extent.spatialReference.wkid}){
            id
            name
            description
            estimatedTimeframe
            estimatedCost
            geometry {
              type
              coordinates
            }
          }
        }`.replace(/\s+/g, ' ')
        }
      });
      if (res.data.errors) {
        commit('setMessage', 'Error retrieving projects...', { root: true });
      }
      if (res.data.data.projects) {
        commit('clearProjects');
        // sort by name then block number
        projects = res.data.data.projects.sort(function (a, b) {
          var nameA = a.name?.toUpperCase(); // ignore upper and lowercase
          var nameB = b.name?.toUpperCase(); // ignore upper and lowercase

          if (!nameA || !nameB) {
            return Number.MAX_SAFE_INTEGER;
          }
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        });

        commit('addProjects', projects);
      }
    }

    const idx = lunr(function () {
      this.ref('id');
      this.field('name');
      this.field('description');

      projects.forEach(doc => {
        this.add(doc);
      });
    });

    commit('setIndex', idx);
  },
  selectProjectById({ commit, dispatch, state }, id: string) {
    commit('setMessage', undefined, { root: true });

    let project: Project = { id };

    if (state.list) {
      project = Object.assign(
        state.list.find(project => {
          return project.id === id;
        }) || {},
        project
      );
    }
    commit('setSelectedProjects', [project]);
    dispatch('selectProjects', project);
  },
  selectProjects({ commit, dispatch, rootState }, project: Project) {
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { project?: Project[] } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          project(id:"${project ? project.id : ''}"){
            id
            name
            geometry { type coordinates }
            number
            location
            description
            agency
            estimatedCost
            estimatedTimeframe
            district
            facilityOwner
            patternArea
            fundingCategory
          }
        }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Some data may contain errors...', { root: true });
        }
        let data = res.data.data;
        if (data.project) {
          commit('setSelectedProjects', data.project);
          dispatch('map/clearGraphics', undefined, { root: true });
          dispatch('highlightProjects', { projects: data.project, move: false });
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving the selected project!', { root: true });
      });
  },
  highlightProjects({ commit }, { projects, move }: { projects: Project[]; move: boolean }) {
    const graphics = new Array<Graphic>();
    projects.forEach(project => {
      if (project.geometry) {
        graphics.push(...esriGraphics(project.geometry));
      }
    });
    commit('map/setGraphics', graphics, { root: true });
    if (move) commit('map/goTo', graphics, { root: true });
  }
};
