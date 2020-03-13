import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';
import { map } from './map/index';
import streets from './streets/index';
import portlandmaps from './portlandmaps/index';
import projects from './projects/index';
import text from './text/index';

import { mutations } from './mutations';

Vue.use(Vuex);

// following variable comes from webpack DefinePlugin
declare var GRAPHQL_URL: string;

const store: StoreOptions<RootState> = {
  state: {
    messages: undefined,
    graphqlUrl: GRAPHQL_URL
  },
  mutations,
  modules: {
    map,
    portlandmaps,
    projects,
    streets,
    text
  }
};

export default new Vuex.Store<RootState>(store);
