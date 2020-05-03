import { GetterTree } from 'vuex';

import { MapState } from './types';
import { RootState } from '../types';

export const getters: GetterTree<MapState, RootState> = {
  focusLevel: state => {
    return state.zoom.focus;
  }
};
