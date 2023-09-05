import { storeToRefs } from 'pinia'

import {REGEXP_VARIABLE_IN_TEXT_RESULT_COST, REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE} from "@/constants/regexp";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
import {useInnerVariablesStore} from "@/store/innerCustomVariableStore";

export function updateTextOnVariables(text, options){
  const {isDependencyElement, getDependencyElementByName} = storeToRefs(useDependencyListStore())
  const {isResultElement, getResultElementByName} = storeToRefs(useResultListStore())
  const {isInnerVariable, getInnerVariableByName} = storeToRefs(useInnerVariablesStore())


  text?.match(REGEXP_VARIABLE_IN_TEXT_RESULT_COST)?.map(item => {
    let name =  item.replace('{{','').replace('}}','')
    const pattern = getPattern(item)
    const span = document.createElement('span')

    const nameForDuplicator = getNameDuplicator(name, options?.index)
    const isExistDuplicatorVariable = options?.isDuplicator && isResultElement.value(nameForDuplicator)
    if (isExistDuplicatorVariable) {
      span.id = nameForDuplicator
      span.innerText = getResultElementByName.value(nameForDuplicator).cost
    }

    if (isResultElement.value(name) && !isExistDuplicatorVariable) {
      span.id = name
      span.innerText = getResultElementByName.value(name).cost
    }
    if (span.innerText?.length) {
      text = text.replaceAll(pattern, span.outerHTML)
    }
  })
  text?.match(REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE)?.map(item => {
    let name =  item.replace('##','').replace('##','')
    const pattern = getPattern(item)
    const span = document.createElement('span')

    const nameForDuplicator = getNameDuplicator(name, options?.index)

    const isExistDuplicatorVariable = options?.isDuplicator && isDependencyElement.value(nameForDuplicator)
    if (isExistDuplicatorVariable) {
      span.id = nameForDuplicator
      span.innerText = getDependencyElementByName.value(nameForDuplicator).cost
    } else if (isDependencyElement.value(name)) {
      span.id = name
      span.innerText = getDependencyElementByName.value(name).value
    }


    const isExistInnerVariablea = options?.isDuplicator && isInnerVariable.value(nameForDuplicator)
    if (isExistInnerVariablea) {
      span.id = nameForDuplicator
      span.innerText = getInnerVariableByName.value(name).value
    } else if (isInnerVariable.value(name)) {
      span.id = name
      span.innerText = getInnerVariableByName.value(name).value
    }

    if (span.innerText?.length) {
      text = text.replaceAll(pattern, span.outerHTML)
    }
  })
  return text
}

function getPattern(name) {
  return new RegExp(`${name}`, 'g')
}

function getNameDuplicator(name, index) {
  return `${name}_${index}`
}
