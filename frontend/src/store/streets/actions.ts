import { ActionTree } from 'vuex';
import { StreetState, Street, ViewModel } from './types';
import { RootState } from '../types';

import area from '@turf/area';
import bboxPolygon from '@turf/bbox-polygon';
import axios from 'axios';
import proj4 from 'proj4';
import { Extent } from 'esri/geometry';

import { esriGraphics } from '../utils';

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));

export const actions: ActionTree<StreetState, RootState> = {
  findStreets({ commit, dispatch, rootState }, extent: Extent) {
    let { xmin, ymin, xmax, ymax } = extent;

    if (extent.spatialReference.wkid != 4326) {
      [xmin, ymin] = proj4(extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmin, ymin]);
      [xmax, ymax] = proj4(extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmax, ymax]);
    }

    if (area(bboxPolygon([xmin, ymin, xmax, ymax])) > 5000000) {
      commit('setMessage', 'Zoom in or search for an address to see available streets...', { root: true });
      return;
    }

    commit('setMessage', undefined, { root: true });

    axios
      .get<{ errors?: any[]; data: { streets?: Street[] } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          streets(bbox:[${xmin},${ymin},${xmax},${ymax}], spatialReference:4326){
            id
            name
            block
            classifications {
              pedestrian
              bicycle
              transit
              freight
              design
              emergency
              traffic
              greenscape
            }
            geometry {
              type
              coordinates
            }
          }
        }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Zoom in or search for an address to see available streets...', { root: true });
        }
        if (res.data.data.streets) {
          commit('setList', []);
          dispatch('clearAnalysis');
          // sort by name then block number
          let streets = res.data.data.streets.sort(function(a, b) {
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
            return (a.block || Number.MAX_SAFE_INTEGER) - (b.block || Number.MIN_SAFE_INTEGER);
          });

          commit('setList', streets);
          dispatch('analyzeStreets', streets);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving streets!', { root: true });
      });
  },
  selectStreetById({ commit, dispatch, state }, id: string) {
    commit('setMessage', undefined, { root: true });
    let street: Street = { id };

    if (state.list) {
      street = Object.assign(
        street,
        state.list.find(street => {
          return street.id === id;
        })
      );
    }
    commit('setSelectedStreet', street);

    dispatch('selectStreet', street);
  },
  selectStreet({ commit, dispatch, rootState }, street: Street) {
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { street?: Street } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          street(id:"${street ? street.id : ''}"){
            id
            ${street.name ? '' : 'name'}
            ${street.block ? '' : 'block'}
            ${street.geometry ? '' : `geometry{ type coordinates }`}
            ${
              street.classifications
                ? ''
                : `classifications {
              pedestrian
              bicycle
              transit
              freight
              design
              emergency
              traffic
              greenscape
            }`
            }
            ${
              street.projects
                ? ''
                : `projects {
              id
              name
              number
              description
              estimatedCost
              estimatedTimeframe
            }`
            }
          }
        }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Some data may contain errors...', { root: true });
        }
        let data = res.data.data;
        if (data.street) {
          data.street = Object.assign(data.street, street);
          commit('setSelectedStreet', data.street);
          dispatch('highlightStreet', { street: data.street, move: true });
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving the selected street!', { root: true });
      });
  },
  highlightStreet({ commit }, { street, move }) {
    if (street.geometry) {
      const graphics = esriGraphics(street.geometry);
      commit('map/setGraphics', graphics, { root: true });
      if (move) commit('map/goTo', graphics, { root: true });
    }
  },
  clearAnalysis({ commit, state }) {
    commit(
      'setAnalysis',
      state.models?.map(a => {
        const { count, ...analysis } = a;
        return Object.assign(analysis, { count: 0 });
      })
    );
  },
  analyzeStreets({ commit, state }, streets: Array<Street>) {
    const models = Array.from(state.models || []);

    if (streets) {
      streets.forEach(street => {
        Object.keys(street.classifications || {}).forEach(c => {
          let entry = models.find(val => {
            if (!street.classifications) return false;
            return val.key === c && val.value === street.classifications[c];
          });

          if (entry) entry.count = entry.count + 1;
        });
      });
    }

    commit('setAnalysis', models);
  }
};
