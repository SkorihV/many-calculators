import {createStore} from "vuex";

export default createStore({
  state() {
    return {
      vuexDataForDependencies: {}
    }
  },
  actions: {
      tryAddDependencyElement({commit}, data) {
        commit("addDependencyElement", data);
      }
  },
  mutations: {
    addDependencyElement(state, {name, value, isShow, displayValue, type}) {
      state.vuexDataForDependencies[name] = {
        name,
        value,
        isShow,
        displayValue,
        type,
      };
    }
  },
  getters: {
    globalDependenciesList(state) {
      return state.vuexDataForDependencies;
    }
  }
})
