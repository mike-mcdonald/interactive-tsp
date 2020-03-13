import { MutationTree } from 'vuex';
import { RootState, Message } from './types';

export const mutations: MutationTree<RootState> = {
  setMessages(state, messages: Array<Message>) {
    state.messages = messages;
  }
};
