import { ActionTree } from 'vuex';
import { TextState, TextSection } from './types';
import { RootState } from '../types';

import axios from 'axios';
import lunr, { Builder, Token } from 'lunr';
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

    axios
      .get(rootState.graphqlUrl, {
        params: {
          query: `{
            sections {
              id
              name
              number
              tree
              depth
              content
            }
          }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'The text may contain errors...', { root: true });
        }
        if (res.data.data.sections) {
          commit('setText', res.data.data.sections);

          const idx = lunr(function() {
            this.ref('id');
            this.field('name');
            this.field('content');

            this.use(customStemming);

            res.data.data.sections.forEach((doc: TextSection) => {
              let { content, ...d } = doc;
              content = strip(content);
              this.add(Object.assign(d, { content }));
            });
          });

          commit('setIndex', idx);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving text!', { root: true });
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
