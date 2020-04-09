import { ActionTree } from 'vuex';
import { RootState, Message } from './types';

export const actions: ActionTree<RootState, RootState> = {
  clearMessages({ commit }) {
    commit('setMessages', []);
  },
  addMessage({ commit, state }, message: Message) {
    const i = state.messages?.findIndex(value => value.id === message.id);
    if (i === -1) state.messages?.push(message);
    commit('setMessages', [...state.messages]);
  },
  removeMessage({ commit, state }, id: string) {
    const i = state.messages?.findIndex(value => value.id === id);
    if (i !== -1) state.messages?.splice(i, 1);
    commit('setMessages', [...state.messages]);
  }
};
