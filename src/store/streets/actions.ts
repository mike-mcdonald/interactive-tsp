import { ActionTree } from 'vuex';
import { StreetState, Street } from './types';
import { RootState } from '../types';

import area from '@turf/area';
import bboxPolygon from '@turf/bbox-polygon';
import length from '@turf/length';
import axios from 'axios';
import proj4 from 'proj4';
import { Extent } from 'esri/geometry';
import { v4 as uuidv4 } from 'uuid';

import { esriGraphics, hash } from '../utils';
import { feature } from '@turf/helpers';

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
      dispatch(
        'addMessage',
        {
          id: 'streets-zoom-in',
          type: 'info',
          text: 'Zoom in or search for an address to see available streets...'
        },
        {
          root: true
        }
      );
      return;
    }

    dispatch('removeMessage', 'streets-zoom-in', {
      root: true
    });

    dispatch(
      'addMessage',
      { id: 'streets-retrieving', type: 'info', text: 'Retrieving streets...' },
      {
        root: true
      }
    );

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
        dispatch('clearMessages', undefined, { root: true });

        if (res.data.errors) {
          dispatch(
            'addMessage',
            {
              id: 'streets-graphql-error',
              type: 'warning',
              text: 'Some data may contain errors...',
              dismissible: true
            },
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

          streets.forEach(street => {
            street.uuid = uuidv4();
          });

          commit('setList', streets);
        }
      })
      .catch(() => {
        dispatch(
          'addMessage',
          { id: 'streets-error-retrieving', type: 'error', text: 'Error retrieving streets!', dismissible: true },
          { root: true }
        );
      });
  },
  selectStreet({ commit, dispatch, rootState }, street: Street) {
    dispatch(
      'addMessage',
      { id: 'streets-retrieving-street', type: 'info', text: `Retrieving street ${street.id}...` },
      { root: true }
    );
    commit('setSelectedStreet', undefined);
    axios
      .get<{ errors?: any[]; data: { street?: Array<Street> } }>(rootState.graphqlUrl, {
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
            ${street.masterStreetPlans ? '' : `masterStreetPlans { id label }`}
            ${street.areaPlans ? '' : `areaPlans { id name description }`}
          }
        }`.replace(/\s+/g, ' ')
        }
      })
      .then(res => {
        dispatch('clearMessages', undefined, { root: true });
        if (res.data.errors) {
          dispatch(
            'addMessage',
            {
              id: 'streets-graphql-error',
              type: 'warning',
              text: 'Some data may contain errors...',
              dismissible: true
            },
            { root: true }
          );
        }

        let streets = res.data.data.street;

        if (streets) {
          dispatch('highlightStreet', { street: streets[0], move: true });
          commit('setSelectedStreet', streets);
        }
      })
      .catch(() => {
        dispatch(
          'addMessage',
          {
            id: 'streets-error-retrieving',
            type: 'error',
            text: 'Error retrieving the selected street!',
            dismissible: true
          },
          { root: true }
        );
      });
  },
  highlightStreet({ commit, rootGetters }, { street, move }: { street: Street; move: boolean }) {
    if (street.geometry) {
      let graphics = esriGraphics(street.geometry);
      commit('map/setGraphics', graphics, { root: true });
      if (move) {
        const target: any = {
          target: graphics
        };
        // for small features, don't zoom in too close
        const l = length(feature(street.geometry), { units: 'meters' });
        if (l < 200) {
          target.zoom = rootGetters['map/focusLevel'];
        }
        commit('map/goTo', target, { root: true });
      }
    }
  }
};
