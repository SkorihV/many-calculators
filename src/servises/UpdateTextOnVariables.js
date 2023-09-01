import { storeToRefs } from 'pinia'

import {REGEXP_VARIABLE_IN_TEXT_RESULT_COST, REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE} from "@/constants/regexp";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
import {useInnerVariablesStore} from "@/store/innerCustomVariableStore";

export function updateTextOnVariables(text){
  const {isElementDependency, getElementByNameInDependency} = storeToRefs(useDependencyListStore())
  const {isElementResult, getResultElementByName} = storeToRefs(useResultListStore())
  const {isExistInnerVariable, getInnerVariableByName} = storeToRefs(useInnerVariablesStore())

  text?.match(REGEXP_VARIABLE_IN_TEXT_RESULT_COST)?.map(item => {
    let name =  item.replace('{{','').replace('}}','')
    if (isElementResult.value(name)) {
      const pattern = new RegExp(`${item}`, 'g')
      const span = document.createElement('span')
      span.id = name
      span.innerHTML = getResultElementByName.value(name).cost
      text = text.replaceAll(pattern, span.outerHTML)
    }
  })
  text?.match(REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE)?.map(item => {
    let name =  item.replace('##','').replace('##','')

    if (isElementDependency.value(name)) {
      const pattern = new RegExp(`${item}`, 'g')
      const span = document.createElement('span')
      span.id = name
      span.innerHTML = getElementByNameInDependency.value(name).value
      text = text.replaceAll(pattern, span.outerHTML)
    }
    if (isExistInnerVariable.value(name)) {
      const pattern = new RegExp(`${item}`, 'g')
      const span = document.createElement('span')
      span.id = name
      span.innerHTML = getInnerVariableByName.value(name).value
      text = text.replaceAll(pattern, span.outerHTML)
    }
  })
  return text
}
