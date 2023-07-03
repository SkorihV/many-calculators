import { computed } from "vue";
import {
  getArrayElementsFromFormula,
  getListVariablesMissedInFormula,
  getSummaVariablesInFormula,
  getListVariablesUsedInFormula
} from "@/servises/UtilityServices";

import {getBaseStoreGetters} from "@/composables/useBaseStore";

/**
 *
 * @param formula
 * @param viewDuplicator - искать только в элементах дупликатора
 * @param parentName - отфильтровывать элементы по указанному родителю ( для дупликатора )
 * @returns {{summaFreeVariables: ComputedRef<*>, variablesInFormula: ComputedRef<unknown>, baseDataForCalculate: ComputedRef<unknown[]>}}
 */
export function useGetOtherGlobalSum(formula = [], viewDuplicator = false, parentName = null) {
  const { getAllResultsElements} = getBaseStoreGetters()
  /**
   * Данные которые подходят для вывода или расчета
   * @returns {{length}|unknown[]|*[]}
   */
  const baseDataForCalculate = computed(() => {
    return Object.values(getAllResultsElements.value).filter(
      (item) => {
        if (!viewDuplicator) {
          return !Boolean(item?.isDuplicator)
        } else {
          return Boolean(item?.isDuplicator) && item.parentName === parentName
        }
      }
    );
  })
  /**
   * Разбиваем полученную формулу на массив с переменными и знаками.
   * Избавляемся от пустых элементов.
   * @returns {*[]|*}
   */
  const variablesInFormula = computed(() => {
    if (formula?.value) {
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

  const usedVariablesOutsideFormula = computed( () => {
    return getListVariablesUsedInFormula(
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
    freeVariablesOutsideFormula,
    summaFreeVariables,
    variablesInFormula,
    baseDataForCalculate,
    usedVariablesOutsideFormula
  }
}
