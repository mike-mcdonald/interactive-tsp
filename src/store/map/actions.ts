import { ActionTree } from 'vuex';

import Graphic from 'esri/Graphic';

import { defaultExtent } from './index';
import { MapState } from './types';
import { RootState } from '../types';
import { Location } from '../portlandmaps/types';
import { Point } from 'esri/geometry';

export const actions: ActionTree<MapState, RootState> = {
  resetExtent({ commit }) {
    commit('goTo', {
      target: defaultExtent
    });
    commit('setExtent', defaultExtent);
  },
  setExtent({ commit }, extent: __esri.Extent) {
    commit('setExtent', extent);
  },
  setLayerVisibility({ commit }, { layerId, visible }) {
    commit('layerVisibilityChanged', { layerId, visible });
  },
  setZoom({ commit, dispatch, state }, { value, move }: { value: number; move: boolean }) {
    if (state.view && value > 0) {
      if (value < state.zoom.min) {
        return dispatch('setZoom', { value: state.zoom.min, move: true });
      } else if (value > state.zoom.max) {
        return dispatch('setZoom', { value: state.zoom.max, move: false });
      } else {
        commit('changeZoom', value);
        if (move) {
          commit('goTo', {
            center: state.view.center,
            zoom: value
          });
        }
      }
    }
  },
  setLocation({ commit, state }, location: Location | __esri.Point) {
    commit('goTo', {
      target: new Point({
        x: location.x,
        y: location.y,
        spatialReference: location.spatialReference
      }),
      zoom: state.zoom.focus
    });
  },
  clearGraphics({ commit }) {
    commit('setGraphics', []);
  },
  addGraphic({ commit }, graphic: Graphic) {
    commit('addGraphic', graphic);
  }
};
