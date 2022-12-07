import { defineStore } from "pinia";
import {ref, reactive} from "vue"

export const useStore = defineStore('piniaStore', {
  state: () => ({
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
    devMode: false,
    showInsideElementStatus: false,
  }),
  actions: {

  },
  getters: {
    /**
     * Получить весь список элементов результата
     * @returns {{}}
     */
    getAllResultsElements: () => this.globalResultsElements,
    /**
     * Получить элемент из списка по его имени
     * @returns {function(*): *|null}
     */
    getResultElementOnName: () => (name) =>
      this?.globalResultsElements[name]
        ? this.globalResultsElements[name]
        : null,
    /**
     * Массив со всеми зависимостями и значениями
     * @returns {{}}
     */
    globalDependenciesList: () => {
      return this.dataListForDependencies;
    },
    /**
     * Активирует возможность показывать всплывающие подсказки с ошибками
     * @returns {boolean}
     */
    isCanShowAllTooltips: () => {
      return this.shownAllTooltips;
    },
    /**
     * Показать все данные с ошибками по заданному родителю
     *
     * @returns {function(*): unknown[]}
     */
    getValidationListOnParentName: () => (parentName) =>
      Object.values(this.validationsErrorsList).filter(
        (item) => item.parentName === parentName
      ),
    /**
     * Есть ли хоть один видимый элемент-ребенок у родителя
     * @returns {function(*): boolean}
     */
    isValidationShowOnParentName: () => (parentName) =>
      Boolean(
        Object.values(this.validationsErrorsList).filter(
          (item) => item.parentName === parentName && item.isShow
        ).length
      ),
    /**
     * Есть ли хоть один элемент-ребенок с ошибкой, у родителя
     * @returns {function(*): boolean}
     */
    isValidationErrorOnParentName: () => (parentName) => {
      return Boolean(
        Object.values(this.validationsErrorsList).filter(
          (item) => item.parentName === parentName && item.error
        ).length
      );
    },
    /**
     * Есть ли во всем калькуляторе элементы с ошибками валидации
     * @returns {boolean}
     */
    isCheckedGlobalValidation: () =>
      Boolean(
        Object.values(this.validationsErrorsList).filter(
          (item) => item.error && item.isShow
        ).length
      ),
    /**
     * Список элементов с информацией о валидации
     * @returns {{}}
     */
    validationList: () => state.validationsErrorsList,
    /**
     * название спецпеременной служащей для суммирования в себе всех значений
     * @returns {string}
     */
    getNameReserveVariable: () => this.reserveVariableForOtherSumma,
    getSpecSymbols: () => this.specSymbols,
    devMode: () => this.devMode,
    showInsideElementStatus: () => this.showInsideElementStatus,
    getImageDir: () => window?.imageDir ? window.imageDir : "",
  }
})
