import { ActionTree } from 'vuex';

import Graphic from 'esri/Graphic';

import { MapState } from './types';
import { RootState } from '../types';
import { Location } from '../portlandmaps/types';
import { Point } from 'esri/geometry';

export const actions: ActionTree<MapState, RootState> = {
  setExtent({ commit, dispatch }, extent: __esri.Extent): any {
    commit('setMessage', undefined, { root: true });
    commit('extentChanged', extent);
  },
  setLayerVisibility({ commit }, { layerId, visible }) {
    commit('layerVisibilityChanged', { layerId, visible });
  },
  setZoom({ commit, state }, value: number) {
    if (state.view && value > 0) {
      if (value >= state.zoom.min && value <= state.zoom.max) {
        commit('goTo', {
          center: state.view.center,
          zoom: value
        });
      }
    }
  },
  setLocation({ commit, state }, location: Location | __esri.Point) {
    commit('goTo', {
      center: new Point({
        x: location.x,
        y: location.y,
        spatialReference: location.spatialReference.wkid
      }),
      zoom: state.zoom.focus
    });
  },
  clearGraphics({ commit }) {
    commit('setGraphics', { graphics: [] });
  },
  addGraphic({ commit }, graphic: Graphic) {
    commit('addGraphic', graphic);
  }
};
