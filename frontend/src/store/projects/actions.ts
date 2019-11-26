import { ActionTree } from 'vuex';
import { ProjectState, Project } from './types';
import { RootState } from '../types';

import axios from 'axios';

import { Geometry } from '@turf/helpers';

import Graphic from 'esri/Graphic';
import { Point, Polygon, Polyline, Multipoint } from 'esri/geometry';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';

function esriGeometry(geometry: Geometry): __esri.Geometry | undefined {
  let esriProperties = { spatialReference: { wkid: 4326 } };

  switch (geometry.type) {
    case 'Point':
      esriProperties = Object.assign(esriProperties, { x: geometry.coordinates[0], y: geometry.coordinates[1] });
      break;
    case 'LineString':
      esriProperties = Object.assign(esriProperties, { paths: [geometry.coordinates] });
      break;
    case 'Polygon':
      esriProperties = Object.assign(esriProperties, { rings: geometry.coordinates });
      break;
    case 'MultiPoint':
      esriProperties = Object.assign(esriProperties, { points: geometry.coordinates });
      break;
    case 'MultiLineString':
      esriProperties = Object.assign(esriProperties, { paths: geometry.coordinates });
      break;
    case 'MultiPolygon':
      esriProperties = Object.assign(esriProperties, { rings: [geometry.coordinates] });
      break;
  }

  return esriProperties as __esri.Geometry;
}

function esriGraphics(geometry: Geometry) {
  switch (geometry.type) {
    case 'Point':
      return [
        new Graphic({
          geometry: new Point(esriGeometry(geometry)),
          symbol: new SimpleMarkerSymbol({
            color: '#bfe7eb',
            outline: {
              color: '#00484e',
              width: 2
            }
          })
        })
      ];
    case 'MultiPoint':
      return [
        new Graphic({
          geometry: new Multipoint(esriGeometry(geometry)),
          symbol: new SimpleMarkerSymbol({
            color: '#bfe7eb',
            outline: {
              color: '#00484e',
              width: 2
            }
          })
        })
      ];
    case 'LineString':
    case 'MultiLineString':
      return [
        new Graphic({
          geometry: new Polyline(esriGeometry(geometry)),
          symbol: new SimpleLineSymbol({
            color: '#00484e',
            width: 10
          })
        }),
        new Graphic({
          geometry: new Polyline(esriGeometry(geometry)),
          symbol: new SimpleLineSymbol({
            color: '#bfe7eb',
            width: 8
          })
        })
      ];
    case 'Polygon':
    case 'MultiPolygon':
      return [
        new Graphic({
          geometry: new Polygon(esriGeometry(geometry)),
          symbol: new SimpleFillSymbol({
            color: '#bfe7eb',
            outline: {
              color: '#00484e',
              width: 2
            }
          })
        })
      ];
    default:
      return undefined;
  }
}

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
    commit('setSelectedProject', project);
    dispatch('selectProject', project);
  },
  selectProject({ commit, dispatch, rootState }, project: Project) {
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { project?: Project[] } }>(rootState.graphql_url, {
        params: {
          query: `{
          project(id:"${project ? project.id : ''}"){
            id
            ${project.name ? '' : 'name'}
            ${project.geometry ? '' : 'geometry{ type coordinates }'}
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
          commit('setSelectedProject', data.project[0]);
          if (data.project[0].geometry) {
            dispatch('map/clearGraphics', undefined, { root: true });
            dispatch('highlightProject', data.project[0]);
          }
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving the selected street!', { root: true });
      });
  },
  highlightProject({ commit }, project: Project) {
    if (project.geometry) {
      commit('map/setGraphics', esriGraphics(project.geometry), { root: true });
    }
  }
};
