

import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";


import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

import {getBaseStoreFields} from "@/composables/useBaseStore";
import { computed, toRef, unref, watch } from "vue";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList"
import { useUtilityServices } from "@/composables/useUtilityServices"


export function useProcessingFormula(dataObject) {
  const dependencyFormulaDisplay = toRef(dataObject, 'dependencyFormulaDisplay');
  const parentIsShow = toRef(dataObject, 'parentIsShow');
  const localDependencyList = toRef(dataObject, 'localDependencyList');
  const constructLocalListElementDependencyInFormula = toRef(dataObject, 'constructLocalListElementDependencyInFormula');

  const { devMode,initSomeElementChangedSelfVisibilityState} = getBaseStoreFields();
  const {getArrayElementsFromFormula} = useUtilityServices();

  /**
   *
   * @param value
   * @returns {boolean}
   */
  const checkedValueOnVoid = (value) => {
    return value?.length !== 0 && value !== undefined && value !== null;
  }
  /**
   * Обработать список цен на подходящее условие и вернуть итоговую цену или null
   * @param dataObject
   * @returns {*|{item: null, cost: null}}
   */
  const costAfterProcessingDependencyPrice = (dataObject) => {
    let dependencyArrayItems = unref(toRef(dataObject, 'dependencyArrayItems'));
    let formulaFieldName = unref(toRef(dataObject, 'formulaFieldName'));
    let templateName = unref(toRef(dataObject, 'templateName'));
    let localInputValue = unref(toRef(dataObject, 'localInputValue'));
    let resultValue = unref(toRef(dataObject, 'resultValue'));

    if (dependencyArrayItems === null || formulaFieldName === undefined) {
      return { item: null, cost: null };
    }

    let result = dependencyArrayItems?.reduce(
      (resultReduce, item) => {
        const notExistFormula =
          item?.disabledFormula ||
          typeof item[formulaFieldName] === "undefined" ||
          !Boolean(item[formulaFieldName].toString().length);
        if (notExistFormula) {
          return resultReduce;
        }

        let formula = getArrayElementsFromFormula(
          item[formulaFieldName]
        );

        if (templateName === "UiInput") {
          formula = formula.map((item) =>
            item.toLowerCase() === "_self_" ? localInputValue : item
          );
        }
        if (templateName === "UiRange") {
          formula = formula.map((item) =>
            item.toLowerCase() === "_self_" ? resultValue : item
          );
        }

        unref(constructLocalListElementDependencyInFormula)(formula);
        formula = processingVariablesOnFormula(
          formula,
          unref(localDependencyList)
        );

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
  }


  /**
   * Отобразить текущий элемент
   * @returns {boolean|any}
   */
  const isVisibilityFromDependency = computed(() => {
      if (isDependencyElementVisibility.value && parentIsShow.value) {
      try {
        return eval(formulaAfterProcessingVariables.value);
      } catch (e) {
        if (devMode.value) {
          console.error(e.message, formulaAfterProcessingVariables.value);
        }
        return false;
      }
    }
    return parentIsShow.value;
  })
  watch(() => isVisibilityFromDependency.value, ()=> {
    initSomeElementChangedSelfVisibilityState.value()
  })

  /**
   * Отобразить поле
   * @returns {boolean}
   */
 const isDependencyElementVisibility = computed(()=> {
    return Boolean(dependencyFormulaDisplay.value?.length);
  })

  /**
   * Преобразовать строку формулы в массив переменных со знаками
   * @returns {string|boolean}
   */
 const parsingFormulaVariables = computed(() => {
    if (!isDependencyElementVisibility.value) {
      return false;
    }

    let formula = getArrayElementsFromFormula(
      dependencyFormulaDisplay.value
    );

    unref(constructLocalListElementDependencyInFormula)(formula);
    return formula;
  })

  /**
   * Формула после замены переменных на их значения
   * @returns {string}
   */
  const formulaAfterProcessingVariables = computed(() => {
    return processingVariablesOnFormula(
      unref(parsingFormulaVariables),
      unref(localDependencyList)
    );
  })

  return {
    checkedValueOnVoid,
    costAfterProcessingDependencyPrice
  }
}

