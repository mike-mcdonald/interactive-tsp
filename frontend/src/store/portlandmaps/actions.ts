import { ActionTree } from 'vuex';
import { CandidateState, AddressCandidate } from './types';
import { RootState } from '../types';

import axios from 'axios';

export const actions: ActionTree<CandidateState, RootState> = {
  clearCandidates({ commit }) {
    commit('setCandidates', undefined);
  },
  findCandidates({ commit, rootState }, search) {
    axios
      .get(rootState.graphqlUrl, {
        params: {
          query: `
          {
            address(search:"${search}", city:"portland") {
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
          }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Zoom in or search for an address to see available streets...', { root: true });
        }
        if (res.data.data.address) {
          commit(
            'setCandidates',
            res.data.data.address.map((address: AddressCandidate) => {
              return address;
            })
          );
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving address!', { root: true });
      });
  }
};
