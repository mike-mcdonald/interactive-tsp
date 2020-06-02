import { GetterTree } from 'vuex';

import Layer from 'esri/layers/Layer';

import { MasterStreetPlanState, MasterStreetPlan } from './types';
import { RootState } from '../types';

export const getters: GetterTree<MasterStreetPlanState, RootState> = {
  layers: state => {
    const layers = [...state.layers];

    if (state.selected && state.selected.features)
      layers.push(...state.selected.features.map(feature => feature.layer));

    return layers;
  }
};
