import { ActionTree } from 'vuex';
import { TextState, TextSection } from './types';
import { RootState } from '../types';

import axios from 'axios';
import lunr from 'lunr';
import { customStemming } from '../utils';

function strip(html: string) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export const actions: ActionTree<TextState, RootState> = {
  findText({ commit, state, rootState }) {
    if (state.sections) {
      return;
    }

    commit('setMessages', [{ type: 'info', text: 'Retrieving text...' }], { root: true });

    axios
      .get(rootState.graphqlUrl, {
        params: {
          query: `{
            document(name:"transportation-system-plan") {
              id
              name
              number
              tree
              depth
              content
            }
          }`.replace(/\s+/g, ' ')
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessages', [{ type: 'warning', text: 'The text may contain errors...' }], { root: true });
        }
        if (res.data.data.document) {
          commit('setText', res.data.data.document);

          const idx = lunr(function () {
            this.ref('id');
            this.field('name');
            this.field('content');

            this.use(customStemming);

            res.data.data.document.forEach((doc: TextSection) => {
              let { content, ...d } = doc;
              content = strip(content);
              this.add(Object.assign(d, { content }));
            });
          });

          commit('setIndex', idx);

          commit('setMessages', undefined, { root: true });
        }
      })
      .catch(() => {
        commit('setMessages', [{ type: 'error', text: 'Error retrieving text!' }], { root: true });
      });
  },
  searchIndex({ state, commit }, query) {
    let candidates = state.index?.search(query).map(val => {
      const s = state.sections?.find(sec => {
        return sec.id == val.ref;
      });
      if (s) {
        const { number, tree, depth, sections, ...c } = s;
        c.content = strip(c.content)
          .replace(c.name, ' ')
          .split(' ')
          .slice(0, 30)
          .join(' ')
          .concat('...');
        return c;
      }
      return undefined;
    });

    commit('setCandidates', candidates);
  }
};
