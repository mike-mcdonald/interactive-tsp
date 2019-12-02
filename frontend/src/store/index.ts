import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';
import { map } from './map/index';
import streets from './streets/index';
import portlandmaps from './portlandmaps/index';
import projects from './projects/index';

import { mutations } from './mutations';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    message: undefined,
    graphql_url: 'http://localhost:4000/graphql'
  },
  mutations,
  modules: {
    map,
    portlandmaps,
    projects,
    streets
  }
};

export default new Vuex.Store<RootState>(store);
