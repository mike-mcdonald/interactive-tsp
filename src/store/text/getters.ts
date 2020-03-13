import { GetterTree } from 'vuex';
import { TextState, TextSection } from './types';
import { RootState } from '../types';

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

export const getters: GetterTree<TextState, RootState> = {
  sectionTree(state) {
    if (state.sections) {
      return state.sections
        ?.reduce((prev: TextSection[], curr: TextSection) => {
          if (curr.depth == 0) {
            if (state.sections) {
              curr.sections = traverse(curr, state.sections).sort((a, b) => a.number - b.number);
            }
            prev.push(curr);
          }
          return prev;
        }, new Array<TextSection>())
        .sort((a: TextSection, b: TextSection) => a.number - b.number);
    }

    return undefined;
  }
};
