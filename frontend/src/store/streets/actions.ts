import { ActionTree } from 'vuex';
import { StreetState, Street } from './types';
import { RootState } from '../types';

import axios from 'axios';

export const actions: ActionTree<StreetState, RootState> = {
  findStreets({ commit }, extent) {
    const { xmin, ymin, xmax, ymax } = extent;
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { streets?: Street[] } }>('http://localhost:4000/graphql', {
        params: {
          query: `{
          streets(bbox:[${xmin},${ymin},${xmax},${ymax}], spatialReference:${extent.spatialReference.wkid}){
            id
            name
            block
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
          commit('clearStreets');
          // sort by name then block number
          const streets = res.data.data.streets.sort(function (a, b) {
            var nameA = a.name.toUpperCase(); // ignore upper and lowercase
            var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return (a.block || Number.MAX_SAFE_INTEGER) - (b.block || Number.MIN_SAFE_INTEGER);
          });
          streets.forEach((street: Street) => {
            commit('addStreet', street);
          });
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving streets!', { root: true });
      });
  },
  selectStreet({ commit }, id) {
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { street?: Street } }>('http://localhost:4000/graphql', {
        params: {
          query: `{
          street(id:"${id}"){
            id
            name
            block
            centroid {
              coordinates
            }
            classifications {
              traffic
              transit
              bicycle
              pedestrian
              freight
              emergency
              design
              greenscape
            }
            projects {
              id
              name
              number
              location
              description
              agency
              estimatedCost
              estimatedTimeframe
              district
              patternArea
              fundingCategory
            }
          }
        }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Zoom in or search for an address to see available streets...', { root: true });
        }
        if (res.data.data.street) {
          // sort by name then block number
          commit('setSelectedStreet', res.data.data.street);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving street!', { root: true });
      });
  }
};
