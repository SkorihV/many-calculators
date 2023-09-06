import { storeToRefs } from 'pinia'

import {REGEXP_VARIABLE_IN_TEXT_RESULT_COST, REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE} from "@/constants/regexp";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
import {useInnerVariablesStore} from "@/store/innerCustomVariableStore";

export function updateTextOnVariables(text, options) {
  text = replaceCostsVariables(text, options)
  text = replaceValuesVariables(text, options)

  return text
}

function replaceCostsVariables(text, options) {
  const costsInText = text?.match(REGEXP_VARIABLE_IN_TEXT_RESULT_COST)

  costsInText?.forEach(item => {
    let name = item.replaceAll(getPattern("{{|}}"),'')
    const span = getInnerSpan(name, options)

    if (span.innerText?.length) {
      text = text.replaceAll(getPattern(item), span.outerHTML)
    }
  })

  costsInText?.forEach(item => {
    let name = item.replaceAll(getPattern("{{|}}"),'')
    const span= getCostSpan(name, options)

    if (span.innerText?.length) {
      text = text.replaceAll(getPattern(item), span.outerHTML)
    }
  })
  return text
}

function replaceValuesVariables(text, options) {
  const valuesInText = text?.match(REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE)

  valuesInText?.forEach(item => {
    let name = item.replaceAll('##','')
    const span = getInnerSpan(name, options)

    if (span.innerText?.length) {
      text = text.replaceAll(getPattern(item), span.outerHTML)
    }
  })

  valuesInText?.forEach(item => {
    let name = item.replaceAll('##','')
    const span = getValueSpan(name, options)

    if (span.innerText?.length) {
      text = text.replaceAll(getPattern(item), span.outerHTML)
    }
  })
  return text
}

function getPattern(text) {
  return new RegExp(`${text}`, 'g')
}

function getNameDuplicator(name, index) {
  return `${name}_${index}`
}

function getSpan() {
  return document.createElement('span')
}

function getValueOrSpace(data) {
  return data !== null ? data : ' '
}

function addIdAndClass(div, name) {
  div.id = name
  div.classList.add(name)
  return div
}

function getInnerSpan(name, options) {
  const {isInnerVariable, getInnerVariableByName} = storeToRefs(useInnerVariablesStore())

  let span = getSpan()
  const nameForDuplicator = getNameDuplicator(name, options?.index)
  const isExistInnerVariable = options?.isDuplicator && isInnerVariable.value(nameForDuplicator)

  if (isExistInnerVariable) {
    span = addIdAndClass(span, nameForDuplicator)
    const value = getInnerVariableByName.value(nameForDuplicator).value
    span.innerText = getValueOrSpace(value)
  } else if (isInnerVariable.value(name)) {
    span = addIdAndClass(span, name)
    const value = getInnerVariableByName.value(name).value
    span.innerText = getValueOrSpace(value)
  }
  return span
}

function getValueSpan(name, options) {
  const {isDependencyElement, getDependencyElementByName} = storeToRefs(useDependencyListStore())

  let span = getSpan()
  const nameForDuplicator = getNameDuplicator(name, options?.index)

  const isExistDuplicatorVariable = options?.isDuplicator && isDependencyElement.value(nameForDuplicator)
  if (isExistDuplicatorVariable) {
    span = addIdAndClass(span, nameForDuplicator)
    const value = getDependencyElementByName.value(nameForDuplicator).value
    span.innerText = getValueOrSpace(value)
  } else if (isDependencyElement.value(name)) {
    span = addIdAndClass(span, name)
    const value = getDependencyElementByName.value(name).value
    span.innerText =  getValueOrSpace(value)
  }
  return span
}

function getCostSpan(name, options) {
  const {isResultElement, getResultElementByName} = storeToRefs(useResultListStore())

  let span = getSpan()
  const nameForDuplicator = getNameDuplicator(name, options?.index)

  const isExistDuplicatorVariable = options?.isDuplicator && isResultElement.value(nameForDuplicator)
  if (isExistDuplicatorVariable) {
    span = addIdAndClass(span, nameForDuplicator)
    const cost = getResultElementByName.value(nameForDuplicator).cost
    span.innerText = getValueOrSpace(cost)
  } else if (isResultElement.value(name)) {
    span = addIdAndClass(span, name)
    const cost = getResultElementByName.value(name).cost
    span.innerText = getValueOrSpace(cost)
  }
  return span
}
