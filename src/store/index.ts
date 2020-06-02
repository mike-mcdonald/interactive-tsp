import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import { actions } from './actions';
import areaPlans from './area_plans/index';
import { map } from './map/index';
import masterStreetPlans from './master_street_plans/index';
import { mutations } from './mutations';
import portlandmaps from './portlandmaps/index';
import projects from './projects/index';
import streets from './streets/index';
import text from './text/index';
import { Message, RootState } from './types';

Vue.use(Vuex);

// following variable comes from webpack DefinePlugin
declare var GRAPHQL_URL: string;

var ua = window.navigator.userAgent;

const alerts = new Array<Message>();

// Detect if IE <= 11, add message if detected
if (ua.indexOf('Trident/') > 0 || ua.indexOf('MSIE ') > 0) {
  alerts.push({
    id: 'unsupported-browser',
    type: 'error',
    text:
      'You are using an unsupported browser. Features of this application will not function. Please use a different browser.',
    dismissible: false
  });
}

const store: StoreOptions<RootState> = {
  state: {
    alerts,
    messages: [],
    graphqlUrl: GRAPHQL_URL
  },
  actions,
  mutations,
  modules: {
    areaPlans,
    map,
    masterStreetPlans,
    portlandmaps,
    projects,
    streets,
    text
  }
};

export default new Vuex.Store<RootState>(store);
