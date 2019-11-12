import MapView from 'esri/views/MapView';

import { MutationTree } from 'vuex';
import { MapState } from './types';

export const mutations: MutationTree<MapState> = {
  setView(state, view: MapView) {
    state.view = view;
  },
  extentChanged(state, extent) {
    state.extent = extent;
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
