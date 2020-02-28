import { ActionTree } from 'vuex';
import { ProjectState, Project, ViewModel } from './types';
import { RootState } from '../types';

import axios from 'axios';
import * as d3 from 'd3';
import { Extent } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import GroupLayer from 'esri/layers/GroupLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import lunr, { Builder, Token } from 'lunr';

import { esriGraphics, customStemming } from '../utils';

export const actions: ActionTree<ProjectState, RootState> = {
  async findProjects({ state, commit, dispatch, rootState }) {
    commit('setMessage', undefined, { root: true });

    if (state.list.length > 0) return;

    const extent = new Extent({
      spatialReference: { wkid: 102100 },
      xmin: -13678470.214582363,
      ymin: 5685553.212194719,
      xmax: -13629932.70162134,
      ymax: 5723122.011596833
    });

    let projects = new Array<Project>();

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
      projects = Array.from(res.data.data.projects);
      projects = projects.sort(function(a, b) {
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

      dispatch('analyzeProjects');
    }

    const idx = lunr(function() {
      this.ref('id');
      this.field('name');
      this.field('description');

      this.use(customStemming);

      projects.forEach(doc => {
        this.add(doc);
      });
    });

    commit('setIndex', idx);
  },
  analyzeProjects({ commit, state }) {
    commit(
      'setModels',
      state.list.reduce((prev, curr) => {
        const entry = prev.find(value => {
          return value.value === curr.estimatedTimeframe;
        });
        if (entry) {
          entry.count = entry.count + 1;
        }
        return prev;
      }, state.models)
    );
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
          dispatch('highlightProjects', { projects: data.project, move: true });
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving the selected street!', { root: true });
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
