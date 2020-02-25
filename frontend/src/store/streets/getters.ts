import { GetterTree } from 'vuex';

import * as d3 from 'd3';

import { StreetState, Street } from './types';
import { RootState } from '../types';

export const getters: GetterTree<StreetState, RootState> = {
  classificationLabel: state => (type: string, value: string) => {
    return (
      state.displayInfo?.find(val => {
        return val.classification === type && val.classificationValue === value;
      })?.label || 'N/A'
    );
  },
  classificationColor: state => (type: string, value: string) => {
    const info = state.displayInfo?.find(val => {
      return val.classification === type && val.classificationValue === value;
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
