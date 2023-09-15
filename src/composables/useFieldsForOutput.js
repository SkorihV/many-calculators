import { REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE, REGEXP_VARIABLE_IN_TEXT_RESULT_COST } from "@/constants/regexp";
import { getPattern, isOtherOrGlobalSum } from "@/servises/UtilityServices";
import { useResultListStore } from "@/store/resultListStore";
import { useDependencyListStore } from "@/store/dependencyListStore";
import { useInnerVariablesStore } from "@/store/innerCustomVariableStore";

/**
 *
 * @param fields
 */
export function useFieldsForOutput(fields) {
  const resultStore = useResultListStore()
  const dependencyStore = useDependencyListStore()
  const innerStore = useInnerVariablesStore()

  let unitedVariables = []
  if (!("calcDataFields" in window)) {
    window.calcDataFields = {}
  }

  let variablesCostsComponents = fields?.match(REGEXP_VARIABLE_IN_TEXT_RESULT_COST)
  if (variablesCostsComponents !== null) {
    variablesCostsComponents = variablesCostsComponents.map(item => item.replaceAll(getPattern("{{|}}"),''))
    resultStore.setFieldsForOutputData(variablesCostsComponents)

    unitedVariables = [...variablesCostsComponents]
  }
  let variablesValueComponents = fields?.match(REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE)
  if (variablesValueComponents !== null) {
    variablesValueComponents = variablesValueComponents.map(item => item.replace(getPattern("##"),''))
    dependencyStore.setFieldsForOutputData(variablesValueComponents)

    unitedVariables = [...unitedVariables, ...variablesValueComponents]
  }

  unitedVariables = unitedVariables?.filter(value => isOtherOrGlobalSum(value))

  if (unitedVariables?.length) {
    innerStore.setFieldsForOutputData(unitedVariables)
  }


}
