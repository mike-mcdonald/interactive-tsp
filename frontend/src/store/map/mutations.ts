import MapView from 'esri/views/MapView';

import { MutationTree } from 'vuex';
import { MapState } from './types';

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
  changeZoom(state, zoom) {
    state.zoom.current = zoom;
  },
  goTo(state, target) {
    const zoom = (state.zoom.current = target.zoom || state.zoom.focus);
    state.view?.goTo({
      target,
      zoom
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
