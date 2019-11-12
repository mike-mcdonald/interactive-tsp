import { MutationTree } from 'vuex';
import { MapState, } from './types';

export const mutations: MutationTree<MapState> = {
  extentChanged(state, extent: any) {
    state.extent = extent;
  }
};
