import debounce from 'lodash-es/debounce';
import Layer from 'esri/layers/Layer';
import MapView from 'esri/views/MapView';

import { MutationTree } from 'vuex';
import { MapState } from './types';

export const mutations: MutationTree<MapState> = {
  setView(state, view: MapView) {
    state.view = view;
    view.map = state.map;
  },
  setLayers: debounce(function (state: MapState, layers: Array<Layer>) {
    state.layers = layers;
    state.map.layers.removeAll();
    state.map.layers.addMany(layers);
  }, 10),
  extentChanged(state, extent) {
    state.extent = extent;
  },
  changeZoom(state, zoom) {
    state.zoom.current = zoom;
  },
  goTo(state, target) {
    state.view?.goTo(target, {
      animate: true,
      duration: 500,
      easing: 'easeOutCubic'
    });
  },
  layerVisibilityChanged(state, { layerId, visible }) {
    const layer = state.layers.find(l => {
      return l.id === layerId;
    });

    if (layer) layer.visible = visible;
  },
  setGraphics(state, graphics) {
    if (state.view) {
      state.view.graphics.removeAll();
      state.view.graphics.addMany(graphics);
    }
  },
  addGraphic(state, graphic) {
    if (state.view) {
      state.view.graphics.add(graphic);
    }
  }
};
