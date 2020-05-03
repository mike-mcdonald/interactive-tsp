import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState, Message } from './types';
import { map } from './map/index';
import streets from './streets/index';
import portlandmaps from './portlandmaps/index';
import projects from './projects/index';
import text from './text/index';

import { actions } from './actions';
import { mutations } from './mutations';

Vue.use(Vuex);

// following variable comes from webpack DefinePlugin
declare var GRAPHQL_URL: string;

var ua = window.navigator.userAgent;

const messages = new Array<Message>();

// Detect if IE <= 11, add message if detected
if (ua.indexOf('Trident/') > 0 || ua.indexOf('MSIE ') > 0) {
  messages.push({
    id: 'unsupported-browser',
    type: 'error',
    text:
      'You are using an unsupported browser. Features of this application will not function. Please use a different browser.',
    dismissible: false
  });
}

const store: StoreOptions<RootState> = {
  state: {
    messages,
    graphqlUrl: GRAPHQL_URL
  },
  actions,
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
