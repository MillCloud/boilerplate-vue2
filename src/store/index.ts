import Vue from 'vue';
import Vuex from 'vuex';
import { createStore } from 'vue2-helpers/vuex';

Vue.use(Vuex);

export type TUser = Partial<{
  id: number;
}>;

export interface RootState {
  user: TUser;
}

export default createStore<RootState>({
  strict: process.env.NODE_ENV === 'development',
  state: {
    user: {},
  },
  mutations: {
    setUser(state, { user = {} as TUser } = {}) {
      state.user = {
        ...state.user,
        ...user,
      };
    },
  },
});
