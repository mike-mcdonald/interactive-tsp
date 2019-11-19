import { MutationTree } from 'vuex';
import { Street, StreetState } from './types';

export const mutations: MutationTree<StreetState> = {
  clearStreets(state) {
    state.list = new Array<Street>();
    state.rtree.clear();
  },
  addStreets(state, streets: Street[]) {
    if (!state.list) {
      state.list = new Array<Street>();
    }
    state.list.push(...streets);
    state.rtree.load(
      streets.map(
        (street: Street): Street => {
          const { id, name, block, geometry, minX, minY, maxX, maxY } = street;
          return { id, name, block, geometry, minX, minY, maxX, maxY };
        }
      )
    );
  },
  setSelectedStreet(state, street: Street) {
    state.selected = street;
  }
};
