import { defineStore } from "pinia";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
import {useMountedListStore} from "@/store/mountedListStore";
import {useValidationListStore} from "@/store/validationListStore";
export const useBaseStore = defineStore("base", {
  state: () => {
    return {
      inputOptions: null,
      shownAllTooltips: false, //  показывать ошибки валидации для всех шаблонов
      nameTemplatesForStructure: ["UiAccordion", "UiTab", "UiBlockSection"],
      devModeEnabled: false,
      showInsideElementStatusData: false,
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
    devMode: ({ devModeEnabled }) => devModeEnabled,
    showInsideElementStatus: ({ showInsideElementStatusData }) =>
      showInsideElementStatusData,
    getImageDir: () => (window?.imageDir ? window.imageDir : ""),

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

    /**
     * разрешить отображение подсказок с ошибками
     */
    showAllTooltipsOn() {
      this.shownAllTooltips = true;
    },

    tryToggleDevMode(flag) {
      this.devModeEnabled = flag;
    },
    tryToggleShowInsideElementStatus(flag) {
      this.showInsideElementStatusData = flag;
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
      const mountedStore = useMountedListStore()
      const validationStore = useValidationListStore()
      if (Array.isArray(elementName)) {
        elementName.forEach((name) => {
          dependencyStore.deleteElementInDependencyList(name);
          resultStore.deleteElementInResultsList(name);
          mountedStore.deleteElementInMountedList(name);
          validationStore.deleteElementInValidationsErrorsList(name);
        });
      } else {
        dependencyStore.deleteElementInDependencyList(elementName);
        resultStore.deleteElementInResultsList(elementName);
        mountedStore.deleteElementInMountedList(elementName);
        validationStore.deleteElementInValidationsErrorsList(elementName);
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
