import { GetterTree } from 'vuex';

import { rgb } from 'd3-color';

import { StreetState } from './types';
import { RootState } from '../types';

export const getters: GetterTree<StreetState, RootState> = {
  classificationLabel: state => (type: string, value: string) => {
    return (
      state.models?.find(val => {
        return val.group === type && val.value === value;
      })?.label || 'N/A'
    );
  },
  classificationColor: state => (type: string, value: string) => {
    const info = state.models?.find(val => {
      return val.group === type && val.value === value;
    });
    return info?.symbol?.value || rgb(255, 255, 255, 0);
  }
};
