import { defineStore } from "pinia";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
export const useBaseStore = defineStore("base", {
  state: () => {
    return {
      inputOptions: null,
      shownAllTooltips: false, //  показывать ошибки валидации для всех шаблонов
      validationsErrorsList: {}, // список элементов с ошибками валидации
      nameTemplatesForStructure: ["UiAccordion", "UiTab", "UiBlockSection"],
      devModeEnabled: false,
      showInsideElementStatusData: false,
      elementsIsMounted: {},
      tooltipOn: true,
      methodBeginningCalculation: "no",
      initEnabledSendForm: false,
      allowShowResultBlock: false,
      someElementChangedSelfVisibilityState: 0,
      nameHighlightElement: null,
    };
  },
  getters: {
    checkInitEnabledSendForm({ initEnabledSendForm }) {
      return initEnabledSendForm;
    },
    checkAllowShowResultBlock({ allowShowResultBlock }) {
      return allowShowResultBlock;
    },
    /**
     *
     * @returns {string}
     */
    getMethodBeginningCalculation({ inputOptions }) {
      return inputOptions?.methodBeginningCalculation
        ? inputOptions?.methodBeginningCalculation
        : "no";
    },
    methodBeginningCalculationIsButton() {
      return this.getMethodBeginningCalculation === "useButton";
    },
    methodBeginningCalculationIsAutomatic() {
      return this.getMethodBeginningCalculation === "useAutomatic";
    },
    /**
     *
     * @returns {string|string|*}
     */
    getCurrency: ({ inputOptions }) => {
      return Boolean(inputOptions?.resultOptions?.currency)
        ? inputOptions?.resultOptions?.currency
        : "руб";
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
     * игнорировать скрытые элементы
     * @param state
     * @returns {boolean}
     */

    isExistGlobalErrorsValidationIgnoreHiddenElement: ({
      validationsErrorsList,
    }) =>
      Boolean(
        Object.values(validationsErrorsList).filter(
          (item) => item.error && item.isShow
        ).length
      ),
    /**
     * Есть ли во всем калькуляторе элементы с ошибками валидации
     * учитывать скрытые элементы
     * @param state
     * @returns {boolean}
     */
    isExistGlobalErrorsValidationTakeIntoHiddenElement: ({
      validationsErrorsList,
    }) =>
      Boolean(
        Object.values(validationsErrorsList).filter((item) => item.error).length
      ),

    devMode: ({ devModeEnabled }) => devModeEnabled,
    showInsideElementStatus: ({ showInsideElementStatusData }) =>
      showInsideElementStatusData,
    getImageDir: () => (window?.imageDir ? window.imageDir : ""),
    appIsMounted: ({ elementsIsMounted }) =>
      !Boolean(
        Object.values(elementsIsMounted).filter((value) => !value).length
      ),
    isTooltipOn: ({ tooltipOn }) => tooltipOn,
    checkedIsStructureTemplate:
      ({ nameTemplatesForStructure }) =>
      (templateName) =>
        nameTemplatesForStructure.includes(templateName),
    /**
     *
     * @returns {number}
     */
    getSignAfterDot({ inputOptions }) {
      let sing = parseInt(inputOptions?.resultOptions?.signAfterDot);
      if (!isNaN(sing) && typeof sing === "number") {
        return sing;
      } else {
        return 0;
      }
    },
    getRoundOffType({ inputOptions }) {
      let type = inputOptions?.resultOptions?.roundOffType;
      return type ? type : "round";
    },
    getTitleSum({ inputOptions }) {
      return inputOptions?.resultOptions?.titleSumma?.length
        ? inputOptions?.resultOptions?.titleSumma
        : "";
    },
    getSomeElementChangedSelfVisibilityState({
      someElementChangedSelfVisibilityState,
    }) {
      return someElementChangedSelfVisibilityState;
    },
    getNameHighlightElement({ nameHighlightElement }) {
      return nameHighlightElement;
    },


    /*****************************************/

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


  },
  actions: {

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
    setTooltipOn(dataOptions) {
      this.tooltipOn = !Boolean(dataOptions?.tooltipOff);
    },
    setInitEnabledSendForm(flag) {
      this.initEnabledSendForm = flag;
    },
    setAllowShowResultBlock(flag) {
      this.allowShowResultBlock = flag;
    },
    setInputOptions(inputOptions) {
      this.inputOptions = inputOptions;
    },
    /**
     *
     * @param elementName
     */
    tryDeleteAllDataOnStoreForElementName(elementName) {
      const dependencyStore = useDependencyListStore()
      const resultStore = useResultListStore()
      if (Array.isArray(elementName)) {
        elementName.forEach((name) => {
          dependencyStore.deleteElementInDependencyList(name);
          resultStore.deleteElementInResultsList(name);
          this.deleteElementInMountedList(name);
          this.deleteElementInValidationsErrorsList(name);
        });
      } else {
        dependencyStore.deleteElementInDependencyList(elementName);
        resultStore.deleteElementInResultsList(elementName);
        this.deleteElementInMountedList(elementName);
        this.deleteElementInValidationsErrorsList(elementName);
      }
    },

    deleteElementInMountedList(elementName) {
      if (elementName in this.elementsIsMounted) {
        delete this.elementsIsMounted[elementName];
      }
    },
    deleteElementInValidationsErrorsList(elementName) {
      if (elementName in this.validationsErrorsList) {
        delete this.validationsErrorsList[elementName];
      }
    },
    initSomeElementChangedSelfVisibilityState() {
      this.someElementChangedSelfVisibilityState =
        this.someElementChangedSelfVisibilityState + 1;
    },


    /**
     * Подсветить указанный элемент по его имени
     * @param elementName
     */
    setNameHighlightElement(elementName) {
      this.nameHighlightElement = elementName;
      setTimeout(() => {
        this.nameHighlightElement = null;
      }, 2000);
    },
  },
});
