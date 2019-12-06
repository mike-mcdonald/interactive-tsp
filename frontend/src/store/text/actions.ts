import { ActionTree } from 'vuex';
import { TextState, TextSection } from './types';
import { RootState } from '../types';

import axios from 'axios';

function traverse(section: TextSection, sections: TextSection[]) {
  return sections.reduce((prev, curr) => {
    if (
      curr.depth == section.depth + 1 &&
      JSON.stringify(curr.tree) == JSON.stringify([...section.tree, section.number])
    ) {
      curr.sections = traverse(curr, sections).sort((a, b) => a.number - b.number);
      prev.push(curr);
    }
    return prev;
  }, new Array<TextSection>());
}

export const actions: ActionTree<TextState, RootState> = {
  findText({ commit, state, rootState }) {
    if (state.sections) {
      return;
    }

    axios
      .get(rootState.graphql_url, {
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
          let sections = res.data.data.sections
            .reduce((prev: TextSection[], curr: TextSection) => {
              if (curr.depth == 0) {
                curr.sections = traverse(curr, res.data.data.sections).sort((a, b) => a.number - b.number);
                prev.push(curr);
              }
              return prev;
            }, new Array<TextSection>())
            .sort((a: TextSection, b: TextSection) => a.number - b.number);

          commit('setText', sections);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving text!', { root: true });
      });
  }
};
