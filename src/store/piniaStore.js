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
      devModeEnabled: false,
      showInsideElementStatusData: false,
      elementsIsMounted: {},
      tooltipOn: true,
    };
  },
  getters: {
    /**
     * Получить весь список элементов результата
     * @param globalResultsElements
     * @returns {undefined}
     */
    getAllResultsElements: ({ globalResultsElements }) => globalResultsElements,
    /**
     * Получить элемент из списка по его имени
     * @param globalResultsElements
     * @returns {function(*): *|null}
     */
    getResultElementOnName:
      ({ globalResultsElements }) =>
      (name) =>
        globalResultsElements[name] ? globalResultsElements[name] : null,
    /**
     * Массив со всеми зависимостями и значениями
     * @param state
     * @returns {{}}
     */
    globalDependenciesList: ({ dataListForDependencies }) => {
      return dataListForDependencies;
    },
    /**
     * Активирует возможность показывать всплывающие подсказки с ошибками
     * @param state
     * @returns {boolean}
     */
    isCanShowAllTooltips: ({ shownAllTooltips }) => {
      return shownAllTooltips;
    },
    /**
     * Показать все данные с ошибками по заданному родителю
     *
     * @param state
     * @returns {function(*): unknown[]}
     */
    getValidationListOnParentName:
      ({ validationsErrorsList }) =>
      (parentName) =>
        Object.values(validationsErrorsList).filter(
          (item) => item.parentName === parentName
        ),
    /**
     * Есть ли хоть один видимый элемент-ребенок у родителя
     * @param state
     * @returns {function(*): boolean}
     */
    isValidationShowOnParentName:
      ({ validationsErrorsList }) =>
      (parentName) =>
        Boolean(
          Object.values(validationsErrorsList).filter(
            (item) => item.parentName === parentName && item.isShow
          ).length
        ),
    /**
     * Есть ли хоть один элемент-ребенок с ошибкой, у родителя
     * @param state
     * @returns {function(*): boolean}
     */
    isValidationErrorOnParentName:
      ({ validationsErrorsList }) =>
      (parentName) => {
        return Boolean(
          Object.values(validationsErrorsList).filter(
            (item) => item.parentName === parentName && item.error
          ).length
        );
      },
    /**
     * Есть ли во всем калькуляторе элементы с ошибками валидации
     * @param state
     * @returns {boolean}
     */
    isCheckedGlobalValidation: ({ validationsErrorsList }) =>
      Boolean(
        Object.values(validationsErrorsList).filter(
          (item) => item.error && item.isShow
        ).length
      ),
    /**
     * Список элементов с информацией о валидации
     * @param state
     * @returns {{}}
     */
    validationList: ({ validationsErrorsList }) => validationsErrorsList,
    /**
     * название спецпеременной служащей для суммирования в себе всех значений
     * @param state
     * @returns {string}
     */
    getNameReserveVariable: ({ reserveVariableForOtherSumma }) =>
      reserveVariableForOtherSumma,
    getSpecSymbols: ({ specSymbols }) => specSymbols,
    devMode: ({ devModeEnabled }) => devModeEnabled,
    showInsideElementStatus: ({ showInsideElementStatusData }) =>
      showInsideElementStatusData,
    getImageDir: () => (window?.imageDir ? window.imageDir : ""),
    appIsMounted: ({ elementsIsMounted }) =>
      !Boolean(
        Object.values(elementsIsMounted).filter((value) => !value).length
      ),
    isTooltipOn: ({ tooltipOn }) => tooltipOn,
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
        position,
        zeroValueDisplayIgnore,
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
        position,
        zeroValueDisplayIgnore,
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
     */
    tryAddDependencyElement({ name, value, isShow, displayValue, type }) {
      this.dataListForDependencies[name] = {
        name,
        value,
        isShow,
        displayValue,
        type,
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
      this.devModeEnabled = flag;
    },
    tryToggleShowInsideElementStatus(flag) {
      this.showInsideElementStatusData = flag;
    },
    tryToggleElementIsMounted(name, flag) {
      this.elementsIsMounted[name] = flag;
    },
    setTooltipOn(flag) {
      this.tooltipOn = !flag;
    },
  },
});
