import { ActionTree } from 'vuex';
import { ProjectState, Project } from './types';
import { RootState } from '../types';

import axios from 'axios';

import Graphic from 'esri/Graphic';
import { esriGraphics } from '../utils';

export const actions: ActionTree<ProjectState, RootState> = {
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
  routeStreetByRTree({ dispatch, state }, bbox: turf.BBox) {
    if (!state.rtree) {
      return undefined;
    }
    // find nearest street
    // buffer point by X meters
    let streets = state.rtree.search({
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3]
    });
    if (streets.length > 0) {
      const center = centroid(bboxPolygon(bbox));
      streets = streets.sort((a, b) => {
        if (!a.geometry || !b.geometry) {
          return Number.MAX_SAFE_INTEGER;
        }

        const nearestA = nearestPointOnLine(a.geometry, center, { units: 'meters' });
        const nearestB = nearestPointOnLine(b.geometry, center, { units: 'meters' });

        if (!nearestA.properties || !nearestB.properties) {
          return Number.MAX_SAFE_INTEGER;
        }

        return nearestA.properties.dist - nearestB.properties.dist;
      });
      router.push({ name: 'streets', params: { id: streets[0].id } });
      dispatch('selectStreetById', streets[0].id);
    }
  },
  selectProjects({ commit, dispatch, rootState }, project: Project) {
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { project?: Project[] } }>(rootState.graphql_url, {
        params: {
          query: `{
          project(id:"${project ? project.id : ''}"){
            id
            ${project.name ? '' : 'name'}
            ${project.geometry ? '' : 'geometry { type coordinates }'}
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
          dispatch('highlightProjects', data.project);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving the selected street!', { root: true });
      });
  },
  highlightProjects({ commit }, projects: Project[]) {
    const graphics = new Array<Graphic>();
    projects.forEach(project => {
      if (project.geometry) {
        graphics.push(...esriGraphics(project.geometry));
      }
    });
    commit('map/setGraphics', graphics, { root: true });
  }
};
