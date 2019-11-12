import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';
import { map } from './map/index';
import streets from './streets/index';

import { mutations } from './mutations';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    message: undefined
  },
  mutations,
  modules: {
    map,
    streets
  }
};

export default new Vuex.Store<RootState>(store);
