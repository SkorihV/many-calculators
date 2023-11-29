import { computed } from "vue";
import { getArrayElementsFromFormula } from "@/servises/UtilityServices";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import errorMessage from "@/servises/devErrorMessage";


export const getIsShowOutput = (formula, constructLocalListElementDependencyInFormula, localDependencyList) => {
  const dependencyFormulaOutputArray = computed(() => {
    if (!formula?.length) {
      return []
    }
    return getArrayElementsFromFormula(formula)
  })

  const isShowOutput = computed(() => {
    constructLocalListElementDependencyInFormula(dependencyFormulaOutputArray.value)
    const formula = processingVariablesOnFormula(dependencyFormulaOutputArray.value, localDependencyList)

    if (!formula?.toString()?.length) {
      return true
    }
    try {
      return(eval(formula))
    } catch (e) {
      errorMessage([e.message, formula], 'error')
    }
  })

  return {
    isShowOutput
  }
}
