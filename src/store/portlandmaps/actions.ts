import { ActionTree } from 'vuex';
import { CandidateState, AddressCandidate } from './types';
import { RootState } from '../types';

import axios from 'axios';

export const actions: ActionTree<CandidateState, RootState> = {
  clearCandidates({ commit }) {
    commit('setCandidates', undefined);
  },
  findCandidates({ commit, dispatch, rootState }, { search, searchType }) {
    axios
      .get(rootState.graphqlUrl, {
        params: {
          query: `
          {
            ${searchType}(search:"${search}", city:"portland") {
              id
              type
              name
              location {
                x
                y
                spatialReference {
                  wkid
                  latestWkid
                }
              }
              city
              state
            }
          }`.replace(/\s+/g, ' ')
        }
      })
      .then(res => {
        if (res.data.errors) {
          dispatch(
            'addMessage',
            { id: 'streets-zoom', type: 'info', text: 'Zoom in or search for an address to see available streets...' },
            { root: true }
          );
        }
        if (res.data.data[searchType]) {
          const data = res.data.data[searchType];
          if (data.length > 0) {
            commit(
              'setCandidates',
              data.map((address: AddressCandidate) => {
                return address;
              })
            );
          } else {
            dispatch(
              'addMessage',
              {
                id: 'address-not-found',
                type: 'warning',
                text: 'Could not find a match for that address.  Try entering a different or more specific address.',
                dismissible: true
              },
              { root: true }
            );
          }
        }
      })
      .catch(() => {
        dispatch(
          'addMessage',
          { id: 'portlandmaps-address-error', type: 'error', text: 'Error retrieving address!', dismissible: true },
          { root: true }
        );
      });
  }
};
