import { createLogger, createStore } from "vuex";

export default createStore({
  state() {
    return {
      dataListForDependencies: {},
      shownAllTooltips: false, //  показывать ошибки валидации для всех шаблонов
      validationsErrorsList: {}, // список элементов с ошибками валидации
    };
  },
  actions: {
    tryAddDependencyElement({ commit }, data) {
      commit("addDependencyElement", data);
    },
    showAllTooltipsOn({ commit }) {
      commit("toggleShowAllTooltips", true);
    },
    showAllTooltipsOff({ commit }) {
      commit("toggleShowAllTooltips", false);
    },
    /**
     * проверить данные и добавить / удалить ошибку в общий список
     * @param commit
     * @param data
     */
    checkValidationDataAndToggle({ commit }, data) {
      commit("addError", data);
    },
  },
  mutations: {
    addDependencyElement(
      state,
      { name, value, isShow, displayValue, type, parentName }
    ) {
      state.dataListForDependencies[name] = {
        name,
        value,
        isShow,
        displayValue,
        type,
        parentName,
      };
    },
    toggleShowAllTooltips(state, flag) {
      state.shownAllTooltips = flag;
    },
    addError(state, data) {
      state.validationsErrorsList[data.name] = data;
    },
  },
  getters: {
    globalDependenciesList: (state) => {
      return state.dataListForDependencies;
    },
    isCanShowAllTooltips: (state) => {
      return state.shownAllTooltips;
    },
    getValidationListOnParentName: (state) => (parentName) =>
      Object.values(state.validationsErrorsList).filter(
        (item) => item.parentName === parentName
      ),
    /**
     * Есть ли хоть один видимый элемент у родителя
     * @param state
     * @returns {function(*): boolean}
     */
    isValidationShowOnParentName: (state) => (parentName) =>
      Boolean(
        Object.values(state.validationsErrorsList).filter(
          (item) => item.parentName === parentName && item.isShow
        ).length
      ),
    /**
     * Есть ли хоть один элемент с ошибкой у родителя
     * @param state
     * @returns {function(*): boolean}
     */
    isValidationErrorOnParentName: (state) => (parentName) => {
      return Boolean(
        Object.values(state.validationsErrorsList).filter(
          (item) => item.parentName === parentName && item.error
        ).length

      )
    },
    isCheckedGlobalValidation: (state) =>
      Boolean(
        Object.values(state.validationsErrorsList).filter(
          (item) => item.error && item.isShow
        ).length
      ),
    validationList(state) {
      return state.validationsErrorsList;
    },
  },
});
