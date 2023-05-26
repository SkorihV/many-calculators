import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

import {
  getBaseStoreGetters,
  getBaseStoreAction,
} from "@/composables/useBaseStore";
import {computed, isReactive, reactive, toRef, unref, watch} from "vue";
import { useUtilityServices } from "@/composables/useUtilityServices";

export function useProcessingFormula(dataObject) {
  const dependencyFormulaDisplay = toRef(
    dataObject,
    "formula"
  );
  const parentIsShow = toRef(dataObject, "parentIsShow");
  const localDependencyList = dataObject.localDependencyList;
  const constructLocalListElementDependencyInFormula = toRef(
    dataObject,
    "constructLocalListElementDependencyInFormula"
  );

  const { devMode } = getBaseStoreGetters();
  const initSomeElementChangedSelfVisibilityState = getBaseStoreAction(
    "initSomeElementChangedSelfVisibilityState"
  );
  const { getArrayElementsFromFormula } = useUtilityServices();

  /**
   *
   * @param value
   * @returns {boolean}
   */
  const checkedValueOnVoid = (value) => {
    return value?.length !== 0 && value !== undefined && value !== null;
  };
  /**
   * Обработать список цен на подходящее условие и вернуть итоговую цену или null
   * @param dataObject
   * @returns {*|{item: null, cost: null}}
   */
  const costAfterProcessingDependencyPrice = (dataObject) => {
    let dependencyArrayItems = toRef(dataObject, "dependencyArrayItems");
    let formulaFieldName = toRef(dataObject, "formulaFieldName");
    let templateName = toRef(dataObject, "templateName");
    let localInputValue = toRef(dataObject, "localInputValue");
    let resultValue = toRef(dataObject, "resultValue");

    if (
      dependencyArrayItems.value === null ||
      formulaFieldName.value === undefined
    ) {
      return { item: null, cost: null };
    }

    let result = dependencyArrayItems.value?.reduce(
      (resultReduce, item) => {
        const notExistFormula =
          item?.disabledFormula ||
          typeof item[formulaFieldName].value === "undefined" ||
          !Boolean(item[formulaFieldName].value.toString().length);
        if (notExistFormula) {
          return resultReduce;
        }

        let formula = getArrayElementsFromFormula(item[formulaFieldName].value);

        if (templateName.value === "UiInput") {
          formula = formula.map((item) =>
            item.toLowerCase() === "_self_" ? localInputValue.value : item
          );
        }
        if (templateName.value === "UiRange") {
          formula = formula.map((item) =>
            item.toLowerCase() === "_self_" ? resultValue.value : item
          );
        }

        constructLocalListElementDependencyInFormula.value(formula);
        formula = processingVariablesOnFormula(formula, localDependencyList);

        try {
          if (eval(formula)) {
            resultReduce.item = item;
            resultReduce.cost = item?.cost ? item.cost : 0;
          }
        } catch (e) {
          if (devMode.value) {
            console.error(e.message, formula);
          }
        }
        return resultReduce;
      },
      { item: null, cost: null }
    );
    return result;
  };

  /**
   * Отобразить поле
   * @returns {boolean}
   */
  const isDependencyElementVisibility = computed(() => {
    return Boolean(dependencyFormulaDisplay.value?.length);
  });

  /**
   * Преобразовать строку формулы в массив переменных со знаками
   * @returns {string|boolean}
   */
  const parsingFormulaVariables = computed(() => {
    if (!isDependencyElementVisibility.value) {
      return false;
    }

    let formula = getArrayElementsFromFormula(dependencyFormulaDisplay.value);

    constructLocalListElementDependencyInFormula.value(formula);
    return formula;
  });

  /**
   * Формула после замены переменных на их значения
   * @returns {string}
   */
  const formulaAfterProcessingVariables = computed(() => {
    return processingVariablesOnFormula(
      parsingFormulaVariables,
      localDependencyList
    );
  });

  /**
   * Отобразить текущий элемент
   * @returns {boolean|any}
   */
  const isVisibilityFromDependency = computed(() => {
    if (isDependencyElementVisibility.value && parentIsShow.value) {
      try {

        return eval(formulaAfterProcessingVariables?.value);
      } catch (e) {
        if (devMode.value) {
          console.error(e.message, formulaAfterProcessingVariables?.value);
        }
        return false;
      }
    }
    return parentIsShow.value;
  });
  watch(isVisibilityFromDependency, () => {
    initSomeElementChangedSelfVisibilityState();
  });

  return {
    isVisibilityFromDependency,
    checkedValueOnVoid,
    costAfterProcessingDependencyPrice,
    formulaAfterProcessingVariables,
  };
}
