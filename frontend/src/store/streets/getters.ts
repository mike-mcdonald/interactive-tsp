import { GetterTree } from 'vuex';
import { StreetState, Street } from './types';
import { RootState } from '../types';

export const getters: GetterTree<StreetState, RootState> = {
  streets(state): Street[] | undefined {
    if (!state.list) return undefined;
    return state.list.map(street => {
      return street;
    });
  }
};
