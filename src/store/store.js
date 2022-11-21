import {createStore} from "vuex";

export default createStore({
  state() {
    return {
      dataListForDependencies: {},
      shownAllTooltips: false,  //  показывать ошибки валидации для всех шаблонов
    }
  },
  actions: {
      tryAddDependencyElement({commit}, data) {
        commit("addDependencyElement", data);
      },
      showAllTooltipsOn({commit}) {
        commit("toggleShowAllTooltips", true);
      },
      showAllTooltipsOff({commit}) {
        commit("toggleShowAllTooltips", false);
      },
  },
  mutations: {
    addDependencyElement(state, {name, value, isShow, displayValue, type}) {
      state.dataListForDependencies[name] = {
        name,
        value,
        isShow,
        displayValue,
        type,
      };
    },
    toggleShowAllTooltips(state, flag) {
      state.shownAllTooltips = flag;
    }
  },
  getters: {
    globalDependenciesList(state) {
      return state.dataListForDependencies;
    },
    isCanShowAllTooltips(state) {
      return state.shownAllTooltips;
    }
  }
})
