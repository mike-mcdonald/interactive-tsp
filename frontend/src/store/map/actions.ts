import { ActionTree } from 'vuex';

import Graphic from 'esri/Graphic';

import { MapState } from './types';
import { RootState } from '../types';

export const actions: ActionTree<MapState, RootState> = {
  setExtent({ commit, dispatch }, extent): any {
    commit('setMessage', undefined, { root: true });
    commit('extentChanged', extent);
    dispatch('streets/findStreets', extent, { root: true });
  },
  setLayerVisibility({ commit }, { layerId, visible }) {
    commit('layerVisibilityChanged', { layerId, visible });
  },
  clearGraphics({ commit }) {
    commit('setGraphics', []);
  },
  addGraphic({ commit }, graphic: Graphic) {
    commit('addGraphic', graphic);
  }
};
