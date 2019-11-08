import { Module } from 'vuex';
import { actions } from './actions';
import { mutations } from './mutations';
import { MapState } from './types';
import { RootState } from '../types';

export const state: MapState = {
  extent: {
    spatialReference: { wkid: 102100 },
    xmin: -13657201.014297701,
    ymin: 5702628.527716513,
    xmax: -13656122.535601832,
    ymax: 5703856.29748324
  },
  layers: new Map<string, any>(),
  basemaps: new Map<string, any>()
};

const namespaced: boolean = true;

export const profile: Module<MapState, RootState> = {
  namespaced,
  state,
  actions,
  mutations
};