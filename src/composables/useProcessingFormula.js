import { computed, toRef, watch } from "vue";
import {useBaseStore} from "@/store/baseStore";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

import { getArrayElementsFromFormula } from "@/servises/UtilityServices";
import errorMessage from "@/servises/devErrorMessage";

export function useProcessingFormula(dataObject) {
  const baseStore = useBaseStore()

  const dependencyFormulaDisplay = toRef(dataObject, "formula");
  const parentIsShow = toRef(dataObject, "parentIsShow");
  const localDependencyList = dataObject.localDependencyList;
  const constructLocalListElementDependencyInFormula = toRef(
    dataObject,
    "constructLocalListElementDependencyInFormula"
  );

  /**
   * Обработать список цен на подходящее условие и вернуть итоговую цену или null
   * dependencyArrayItems - название массива в котором хранятся все данные с вариантами
   * formulaFieldName - имя поля с формулой
   * templateName - имя шаблона не обязательно. нужно только для: UiInput, UiRange
   * value - необходимо только для передачи текущего значения : UiInput, UiRange
   * @param dataObject
   * @returns {*|{item: null, cost: null}}
   */
  const costAfterProcessingDependencyPrice = (dataObject) => {
    const dependencyArrayItems = toRef(dataObject, "dependencyArrayItems");
    const formulaFieldName = toRef(dataObject, 'formulaFieldName');
    const templateName = toRef(dataObject, "templateName");
    const value = toRef(dataObject, "value");

    // let localInputValue = toRef(dataObject, "localInputValue");
    // let resultValue = toRef(dataObject, "resultValue");

    if (!dependencyArrayItems.value || !formulaFieldName.value) {
      return { item: null, cost: null };
    }

    let result = dependencyArrayItems.value?.reduce(
      (resultReduce, item) => {
        const notExistFormula =
          item?.disabledFormula ||
          typeof item[formulaFieldName.value] === "undefined" ||
          !Boolean(item[formulaFieldName.value].toString().length);

        if (notExistFormula) {
          return resultReduce;
        }

        let formula = getArrayElementsFromFormula(item[formulaFieldName.value]);

        if (
          templateName.value === "UiInput" ||
          templateName.value === "UiRange"
        ) {
          formula = formula.map((item) =>
            item.toLowerCase() === "_self_" ? value.value : item
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
          errorMessage([e.message, formula], "error")
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
        errorMessage([e.message, formulaAfterProcessingVariables?.value], "error")
      }
    }
    return parentIsShow.value;
  });
  watch(isVisibilityFromDependency, () => {
    baseStore.initSomeElementChangedSelfVisibilityState();
  },
      {deep: true});

  return {
    isVisibilityFromDependency,
    costAfterProcessingDependencyPrice,
    formulaAfterProcessingVariables,
  };
}
