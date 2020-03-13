import { ActionTree } from 'vuex';
import { StreetState, Street, ViewModel } from './types';
import { RootState } from '../types';

import area from '@turf/area';
import bboxPolygon from '@turf/bbox-polygon';
import axios from 'axios';
import proj4 from 'proj4';
import { Extent } from 'esri/geometry';

import { esriGraphics } from '../utils';
import bbox from '@turf/bbox';

// ESRI maps use this wkid
proj4.defs('102100', proj4.defs('EPSG:3857'));

export const actions: ActionTree<StreetState, RootState> = {
  findStreets({ commit, dispatch, rootState }, extent: Extent) {
    let { xmin, ymin, xmax, ymax } = extent;

    if (extent.spatialReference.wkid != 4326) {
      [xmin, ymin] = proj4(extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmin, ymin]);
      [xmax, ymax] = proj4(extent.spatialReference.wkid.toString(), 'EPSG:4326', [xmax, ymax]);
    }

    if (area(bboxPolygon([xmin, ymin, xmax, ymax])) > 1250000) {
      commit('setMessages', [{ type: 'info', text: 'Zoom in or search for an address to see available streets...' }], {
        root: true
      });
      return;
    }

    commit('setMessages', [{ type: 'info', text: 'Retrieving streets...' }], { root: true });

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
        }`.replace(/\s+/g, ' ')
        }
      })
      .then(res => {
        commit('setMessages', undefined, { root: true });

        if (res.data.errors) {
          commit(
            'setMessages',
            [{ type: 'info', text: 'Zoom in or search for an address to see available streets...' }],
            { root: true }
          );
        }

        if (res.data.data.streets) {
          commit('setList', []);
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
        }
      })
      .catch(() => {
        commit('setMessages', [{ type: 'error', text: 'Error retrieving streets!' }], { root: true });
      });
  },
  selectStreetById({ commit, dispatch, state }, id: string) {
    commit('setMessages', undefined, { root: true });
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
    commit('setMessages', undefined, { root: true });
    dispatch('highlightStreet', { street, move: false });
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
        }`.replace(/\s+/g, ' ')
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessages', [{ type: 'warning', text: 'Some data may contain errors...' }], { root: true });
        }
        let data = res.data.data;
        if (data.street) {
          data.street = Object.assign(data.street, street);
          commit('setSelectedStreet', data.street);
          dispatch('highlightStreet', { street: data.street, move: false });
        }
      })
      .catch(() => {
        commit('setMessages', [{ type: 'error', text: 'Error retrieving the selected street!' }], { root: true });
      });
  },
  highlightStreet({ commit, rootState }, { street, move }: { street: Street; move: boolean }) {
    if (street.geometry) {
      const graphics = esriGraphics(street.geometry);
      commit('map/setGraphics', graphics, { root: true });
      if (move) {
        const target: any = { target: graphics };
        if (area(bboxPolygon(bbox(street.geometry))) < 5000) {
          //target.zoom = rootState.map?.zoom.focus;
        }
        commit('map/goTo', target, { root: true });
      }
    }
  }
};
