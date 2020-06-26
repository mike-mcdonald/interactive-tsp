import debounce from 'lodash-es/debounce';
import Layer from 'esri/layers/Layer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import TileLayer from 'esri/layers/TileLayer';
import MapView from 'esri/views/MapView';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';

import { MutationTree } from 'vuex';
import { MapState } from './types';
export const mutations: MutationTree<MapState> = {
  setView(state, view: MapView) {
    state.view = view;
    view.map = state.map;
  },
  setLayers: debounce(function(state: MapState, layers: Array<Layer>) {
    state.layers = layers;
    state.map.layers.removeAll();
    state.map.layers.addMany(layers);
    state.map.layers.push(
      new TileLayer({
        url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Basemap_Color_Labels/MapServer'
      })
    );
  }, 10),
  setExtent(state, extent) {
    state.extent = extent;
  },
  changeZoom(state, zoom) {
    state.zoom.current = zoom;
  },
  goTo(state, target) {
    if (target.zoom && state.zoom.current && target.zoom < state.zoom.current) {
      target.zoom = state.zoom.current;
    }
    state.view?.goTo(target, {
      animate: true,
      duration: 800,
      easing: 'easeOutCubic'
    });
  },
  layerVisibilityChanged(state, { layerId, visible }) {
    const layer = state.layers?.find(l => {
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
  },
  setFilter(state, { layer, filter }: { layer: FeatureLayer; filter: FeatureFilter }) {
    state.view?.whenLayerView(layer).then(layerView => {
      layerView.filter = filter;
    });
  }
};
