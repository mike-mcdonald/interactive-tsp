import { ActionTree } from 'vuex';
import { TextState, TextSection } from './types';
import { RootState } from '../types';

import axios from 'axios';
import lunr from 'lunr';
import { customStemming } from '../utils';

function strip(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export const actions: ActionTree<TextState, RootState> = {
  findText({ commit, dispatch, state, rootState }) {
    if (state.sections) {
      return;
    }

    dispatch('addMessage', { id: 'text-retrieving', type: 'info', text: 'Retrieving text...' }, { root: true });

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
          dispatch(
            'addMessage',
            { id: 'text-graphql-errors', type: 'warning', text: 'The text may contain errors...', dismissible: true },
            { root: true }
          );
        }
        if (res.data.data.document) {
          commit('setText', res.data.data.document);

          const idx = lunr(function() {
            this.ref('id');
            this.field('name');
            this.field('content');

            this.use(customStemming);

            res.data.data.document.forEach((doc: TextSection) => {
              const { id, name, content } = doc;
              this.add({
                id,
                name,
                content: strip(content)
              });
            });
          });

          commit('setIndex', idx);
        }
      })
      .catch(() => {
        commit('setMessages', [{ type: 'error', text: 'Error retrieving text!' }], { root: true });
      });

    dispatch('removeMessage', 'text-retrieving', { root: true });
  },
  searchIndex({ state, commit }, query) {
    const candidates = state.index?.search(query).map(val => {
      const s = state.sections?.find(sec => {
        return sec.id == val.ref;
      });

      if (s) {
        const { id, name, content } = s;

        return {
          id,
          name,
          content: strip(content)
            .replace(name, ' ')
            .split(' ')
            .slice(0, 30)
            .join(' ')
            .concat('...')
        };
      }

      return undefined;
    });

    commit('setCandidates', candidates);
  }
};
