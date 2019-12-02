import MapView from 'esri/views/MapView';

import { MutationTree } from 'vuex';
import { MapState } from './types';
import Layer from 'esri/layers/Layer';

export const mutations: MutationTree<MapState> = {
  setView(state, view: MapView) {
    state.view = view;
    view.map = state.map;
  },
  setLayers(state, layers) {
    state.layers = layers;
    state.map.layers = layers;
  },
  extentChanged(state, extent) {
    state.extent = extent;
  },
  goTo(state, target) {
    state.view?.goTo(target);
    state.zoom.current = target.zoom || state.zoom.current;
  },
  layerVisibilityChanged(state, { layerId, visible }) {
    const layer = state.layers.find(l => {
      return l.id === layerId;
    });

    if (layer) layer.visible = visible;
  },
  setGraphics(state, { graphics, move }) {
    if (state.view) {
      state.view.graphics.removeAll();
      state.view.graphics.addMany(graphics);
      if (move) state.view.goTo(graphics);
    }
  },
  addGraphic(state, graphic) {
    if (state.view) {
      state.view.graphics.add(graphic);
    }
  }
};
