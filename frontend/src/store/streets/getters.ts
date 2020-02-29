import { GetterTree } from 'vuex';

import * as d3 from 'd3';

import { StreetState, Street } from './types';
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
    return info?.color || d3.rgb(255, 255, 255, 0);
  },
  filteredStreets: state => {
    let streets = state.list;

    if (streets) {
      streets = streets.reduce((acc, curr) => {
        return acc;
      }, new Array<Street>());
    }

    return streets;
  }
};
