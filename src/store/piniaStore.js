import { defineStore } from "pinia";

export const useBaseStore = defineStore("base", {
  state: () => {
    return {
      dataListForDependencies: {},
      shownAllTooltips: false, //  показывать ошибки валидации для всех шаблонов
      validationsErrorsList: {}, // список элементов с ошибками валидации
      reserveVariableForOtherSumma: "_otherSum_", // зарезервированная переменная в которую попадают сумма всех полей не учавствующих в формуле
      specSymbols: Object.entries({
        "&gt;": ">",
        "&lt;": "<",
        "&amp;": "&",
        "&quot;": '"',
      }),
      globalResultsElements: {}, // список элементов которые будут участвовать в расчетах результата
      devModeData: false,
      showInsideElementStatusData: false,
      elementsIsMounted: {},
      tooltipOn: true
    };
  },
  getters: {
    /**
     * Получить весь список элементов результата
     * @param state
     * @returns {{}}
     */
    getAllResultsElements: (state) => state.globalResultsElements,
    /**
     * Получить элемент из списка по его имени
     * @param state
     * @returns {function(*): *|null}
     */
    getResultElementOnName: (state) => (name) =>
      state?.globalResultsElements[name]
        ? state.globalResultsElements[name]
        : null,
    /**
     * Массив со всеми зависимостями и значениями
     * @param state
     * @returns {{}}
     */
    globalDependenciesList: (state) => {
      return state.dataListForDependencies;
    },
    /**
     * Активирует возможность показывать всплывающие подсказки с ошибками
     * @param state
     * @returns {boolean}
     */
    isCanShowAllTooltips: (state) => {
      return state.shownAllTooltips;
    },
    /**
     * Показать все данные с ошибками по заданному родителю
     *
     * @param state
     * @returns {function(*): unknown[]}
     */
    getValidationListOnParentName: (state) => (parentName) =>
      Object.values(state.validationsErrorsList).filter(
        (item) => item.parentName === parentName
      ),
    /**
     * Есть ли хоть один видимый элемент-ребенок у родителя
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
     * Есть ли хоть один элемент-ребенок с ошибкой, у родителя
     * @param state
     * @returns {function(*): boolean}
     */
    isValidationErrorOnParentName: (state) => (parentName) => {
      return Boolean(
        Object.values(state.validationsErrorsList).filter(
          (item) => item.parentName === parentName && item.error
        ).length
      );
    },
    /**
     * Есть ли во всем калькуляторе элементы с ошибками валидации
     * @param state
     * @returns {boolean}
     */
    isCheckedGlobalValidation: (state) =>
      Boolean(
        Object.values(state.validationsErrorsList).filter(
          (item) => item.error && item.isShow
        ).length
      ),
    /**
     * Список элементов с информацией о валидации
     * @param state
     * @returns {{}}
     */
    validationList: (state) => state.validationsErrorsList,
    /**
     * название спецпеременной служащей для суммирования в себе всех значений
     * @param state
     * @returns {string}
     */
    getNameReserveVariable: (state) => state.reserveVariableForOtherSumma,
    getSpecSymbols: (state) => state.specSymbols,
    devMode: (state) => state.devModeData,
    showInsideElementStatus: (state) => state.showInsideElementStatusData,
    getImageDir: () => (window?.imageDir ? window.imageDir : ""),
    appIsMounted: (state) => !Boolean(Object.values(state.elementsIsMounted).filter(value => !value).length),
    isTooltipOn: (state) => state.tooltipOn,
  },
  actions: {
    tryAddResultElement(dataResultItem) {
      const {
        name,
        type,
        label,
        cost,
        value,
        displayValue,
        formOutputMethod,
        eventType,
        unit,
        isShow,
        excludeFromCalculations,
        formulaProcessingLogic,
        mode,
        position,
      } = dataResultItem;

      this.globalResultsElements[name] = {
        name,
        type,
        label,
        cost,
        formOutputMethod,
        value,
        summ: cost,
        displayValue,
        unit: unit ? unit : null,
        isShow,
        excludeFromCalculations,
        eventType,
        formulaProcessingLogic,
        mode: mode ? mode : null,
        position,
      };
    },
    /**
     *
     * Модифицировать поле из результирующего списка новыми данными
     * @param elementName
     * @param modifiedFieldName
     * @param newData
     */
    tryModifiedResultElement({ elementName, modifiedFieldName, newData }) {
      this.globalResultsElements[elementName][modifiedFieldName] = newData;
    },
    /**
     * Добавить элемент зависимости в общий массив данных
     * @param name
     * @param value
     * @param isShow
     * @param displayValue
     * @param type
     * @param parentName
     */
    tryAddDependencyElement({
      name,
      value,
      isShow,
      displayValue,
      type,
      parentName,
    }) {
      this.dataListForDependencies[name] = {
        name,
        value,
        isShow,
        displayValue,
        type,
        parentName,
      };
    },
    /**
     * удалить элемент зависимости из общего массива данных по имени
     * @param elementName
     */
    tryDeleteDependencyElementOnName(elementName) {
      if (this.dataListForDependencies.hasOwnProperty(elementName)) {
        delete this.dataListForDependencies[elementName];
      }
    },
    /**
     * разрешить отображение подсказок с ошибками
     */
    showAllTooltipsOn() {
      this.shownAllTooltips = true;
    },
    /**
     *  добавить/обновить ошибку в общий список
     * @param data
     */
    checkValidationDataAndToggle(data) {
      this.validationsErrorsList[data.name] = data;
    },
    tryToggleDevMode(flag) {
      this.devModeData = flag;
    },
    tryToggleShowInsideElementStatus(flag) {
      this.showInsideElementStatusData = flag;
    },
    tryToggleElementIsMounted(name, flag) {
      this.elementsIsMounted[name] = flag;
    },
    setTooltipOn(flag){
      this.tooltipOn = !flag;
    }
  },
});
