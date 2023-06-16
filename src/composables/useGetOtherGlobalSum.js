import { computed } from "vue";
import {
  getArrayElementsFromFormula,
  getListVariablesMissedInFormula,
  getSummaVariablesInFormula
} from "@/servises/UtilityServices";

import {getBaseStoreGetters} from "@/composables/useBaseStore";


export function useGetOtherGlobalSum(formula) {
  const { getAllResultsElements} = getBaseStoreGetters()

  /**
   * Данные которые подходят для вывода или расчета
   * @returns {{length}|unknown[]|*[]}
   */
  const baseDataForCalculate = computed(() => {
    return Object.values(getAllResultsElements.value).filter(
      (item) => !Boolean(item?.isDuplicator)
    );
  })
  /**
   * Разбиваем полученную формулу на массив с переменными и знаками.
   * Избавляемся от пустых элементов.
   * @returns {*[]|*}
   */
  const variablesInFormula = computed(() => {
    if (formula.value) {
      return getArrayElementsFromFormula(formula.value);
    }
    return [];
  })

  /**
   * Список переменных не используемых в формуле
   * @returns {[]}
   */
  const freeVariablesOutsideFormula = computed(() => {
    return getListVariablesMissedInFormula(
      baseDataForCalculate.value,
      variablesInFormula.value
    );
  })

  /**
   * сумма всех не используемых в формуле переменных
   * @returns {*}
   */
  const summaFreeVariables = computed(() => {
    return getSummaVariablesInFormula(freeVariablesOutsideFormula.value);
  })

  return {
    summaFreeVariables,
    variablesInFormula,
    baseDataForCalculate,
  }
}
