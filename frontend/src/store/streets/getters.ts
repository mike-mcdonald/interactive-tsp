import { GetterTree } from 'vuex';
import { StreetState } from './types';
import { RootState } from '../types';

export const getters: GetterTree<StreetState, RootState> = {
  classificationLabel: state => (type: string, value: string) => {
    return state.analysis?.find(val => {
      return val.classification === type && val.classificationValue === value;
    })?.label;
  }
};
