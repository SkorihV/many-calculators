import { defineStore } from "pinia";
import {useDependencyListStore} from "@/store/dependencyListStore";

export const useBaseStore = defineStore("base", {
  state: () => {
    return {
      dependencyStore: useDependencyListStore(),
      inputOptions: null,
      shownAllTooltips: false, //  показывать ошибки валидации для всех шаблонов
      validationsErrorsList: {}, // список элементов с ошибками валидации
      nameTemplatesForStructure: ["UiAccordion", "UiTab", "UiBlockSection"],
      globalResultsElements: {}, // список элементов которые будут участвовать в расчетах результата
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
        resultOutputMethod,
        eventType,
        unit,
        isShow,
        excludeFromCalculations,
        formulaProcessingLogic,
        position,
        zeroValueDisplayIgnore,
        isDuplicator,
        parentName,
      } = dataResultItem;

      this.globalResultsElements[name] = {
        name,
        type,
        label,
        cost,
        formOutputMethod,
        resultOutputMethod,
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
        parentName,
        isDuplicator: isDuplicator ? isDuplicator : false,
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
      if (Array.isArray(elementName)) {
        elementName.forEach((name) => {
          this.dependencyStore.deleteElementInDependencyList(name);
          this.deleteElementInResultsList(name);
          this.deleteElementInMountedList(name);
          this.deleteElementInValidationsErrorsList(name);
        });
      } else {
        this.dependencyStore.deleteElementInDependencyList(elementName);
        this.deleteElementInResultsList(elementName);
        this.deleteElementInMountedList(elementName);
        this.deleteElementInValidationsErrorsList(elementName);
      }
    },

    deleteElementInResultsList(elementName) {
      if (elementName in this.globalResultsElements) {
        delete this.globalResultsElements[elementName];
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
     *
     * @param nameItemList
     * @returns {boolean}
     */
    isElementResult(nameItemList = null) {
      if (!nameItemList) {
        return false;
      }
      return nameItemList in this.globalResultsElements;
    },
    isShowElement(elementName) {
      const item = this.getResultElementOnName(elementName);
      if (item !== null) {
        return item.isShow;
      }
      return null;
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
