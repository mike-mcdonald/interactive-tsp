import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import axios from 'axios';
import { Polygon } from 'esri/geometry';
import Graphic from 'esri/Graphic';
import lunr from 'lunr';

import { ActionTree } from 'vuex';

import { defaultExtent } from '../map';
import { RootState } from '../types';
import { customStemming, esriGeometry, esriGraphics } from '../utils';
import { Project, ProjectState } from './types';

export const actions: ActionTree<ProjectState, RootState> = {
  async findProjects({ state, commit, dispatch, rootState }) {
    if (state.list.length > 0) return;

    dispatch('addMessage', { id: 'projects-retrieving', type: 'info', text: 'Retrieving projects...' }, { root: true });

    let projects = new Array<Project>();

    const extent = defaultExtent;

    const { xmin, ymin, xmax, ymax } = extent;

    const res = await axios
      .get<{ errors?: any[]; data: { projects?: Project[] } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          projects(bbox:[${xmin},${ymin},${xmax},${ymax}], spatialReference:${extent.spatialReference.wkid}){
            id
            name
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
            geometry { type coordinates }
          }
        }`.replace(/\s+/g, ' ')
        }
      })
      .catch(err => {
        dispatch(
          'addMessage',
          { id: 'projects-find-error', type: 'error', text: 'Error retrieving projects...', dismissible: true },
          { root: true }
        );
        throw err;
      });

    if (res.data.errors) {
      dispatch(
        'addMessage',
        {
          id: 'project-graphql-error',
          type: 'warning',
          text: 'Some projects may contain errors...',
          dismissible: true
        },
        { root: true }
      );
    }

    if (res.data.data.projects) {
      commit('setProjects', []);
      // sort by name then block number
      projects = Array.from(res.data.data.projects).sort(function(a, b) {
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

      commit('setProjects', projects);

      dispatch('analyzeProjects');

      dispatch('removeMessage', 'projects-retrieving', { root: true });
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
  async highlightProject({ commit, dispatch, state }, { project, move }: { project: Project; move: boolean }) {
    let p = project;

    if (!project.geometry) {
      await dispatch('findProjects');
      p = state.list.find(value => value.id === project.id)!;
    }

    if (p.geometry) {
      const graphics = new Array<Graphic>();
      graphics.push(...esriGraphics(p.geometry));
      commit('map/setGraphics', graphics, { root: true });

      if (move) {
        const extent = new Polygon(esriGeometry(bboxPolygon(bbox(p.geometry)).geometry));
        commit('map/goTo', extent, { root: true });
      }
    }
  }
};
