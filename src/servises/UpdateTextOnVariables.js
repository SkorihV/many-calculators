import { storeToRefs } from 'pinia'

import {REGEXP_VARIABLE_IN_TEXT_RESULT_COST, REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE} from "@/constants/regexp";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
import {useInnerVariablesStore} from "@/store/innerCustomVariableStore";
import { getPattern, trimVariableCost, trimVariableValue } from "@/servises/UtilityServices";

/**
 * Проверить текст на наличие переменных и подставить реальные значения
 * @param text
 * @param options
 * @returns {*|string}
 */
export function updateTextOnVariables(text, options) {
  text = replaceCostsVariables(text, options)
  text = replaceValuesVariables(text, options)

  return text
}

function replaceCostsVariables(text, options) {
  const costsInText = text?.length ? text?.match(REGEXP_VARIABLE_IN_TEXT_RESULT_COST) : []
  if (costsInText == null) {
    return text
  }
  costsInText?.forEach(item => {
    let name = trimVariableCost(item)
    const element = getInnerSpan(name, options)
    text = replaceElementOrText(text, item, element)
  })

  costsInText?.forEach(item => {
    let name = trimVariableCost((item))
    const element= getCostSpan(name, options)
    text = replaceElementOrText(text, item, element)
  })
  return text ? text : ''
}

function replaceValuesVariables(text, options) {
  const valuesInText = text?.length ? text?.match(REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE) : []
  if (valuesInText == null) {
    return text
  }
  valuesInText?.forEach(item => {
    let name = trimVariableValue(item)
    const element = getInnerSpan(name, options)

    text = replaceElementOrText(text, item, element)
  })

  valuesInText?.forEach(item => {
    let name = trimVariableValue(item)
    const element = getValueSpan(name, options)

    text = replaceElementOrText(text, item, element)
  })
  return text ? text : ''
}

function replaceElementOrText(innerText, replaceableItem, element) {
  if (element?.innerText?.length) {
    innerText = innerText.replaceAll(getPattern(replaceableItem), element.outerHTML)
  } else if (element !== null && element.toString?.length) {
    innerText = innerText.replaceAll(getPattern(replaceableItem), element)
  }
  return innerText
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

function addIdAndClass(name, storeFuncForGetElement, nameGettingField = 'value', options) {
  let node = getSpan()
  let isPrueValue = Boolean(options?.prueValue)

  const value = getValueOrSpace(storeFuncForGetElement.value(name)[nameGettingField])

  if (isPrueValue) {
    return value
  }
  node.id = name
  node.classList.add(name)
  node.classList.add(`calcCustom${nameGettingField}`)
  node.dataset.data = value
  node.innerText = value
  return node
}

function getInnerSpan(name, options) {
  const {isInnerVariable, getInnerVariableByName} = storeToRefs(useInnerVariablesStore())
  let elem = null;

  const nameForDuplicator = getNameDuplicator(name, options?.index)
  const isExistInnerVariable = options?.isDuplicator && isInnerVariable.value(nameForDuplicator)

  if (isExistInnerVariable) {
    elem = addIdAndClass(nameForDuplicator, getInnerVariableByName, 'value', options)
  } else if (isInnerVariable.value(name)) {
    elem = addIdAndClass( name, getInnerVariableByName, 'value', options)
  }
  return elem
}

function getValueSpan(name, options) {
  const {isDependencyElement, getDependencyElementByName} = storeToRefs(useDependencyListStore())

  let elem = null
  const nameForDuplicator = getNameDuplicator(name, options?.index)
  const isExistDuplicatorVariable = options?.isDuplicator && isDependencyElement.value(nameForDuplicator)

  if (isExistDuplicatorVariable) {
    elem = addIdAndClass(nameForDuplicator, getDependencyElementByName, 'value', options)
  } else if (isDependencyElement.value(name)) {
    elem = addIdAndClass(name, getDependencyElementByName, 'value', options)
  }
  return elem
}

function getCostSpan(name, options) {
  const {isResultElement, getResultElementByName} = storeToRefs(useResultListStore())

  let elem = null
  const nameForDuplicator = getNameDuplicator(name, options?.index)

  const isExistDuplicatorVariable = options?.isDuplicator && isResultElement.value(nameForDuplicator)
  if (isExistDuplicatorVariable) {
    elem = addIdAndClass(nameForDuplicator, getResultElementByName, 'cost', options)
  } else if (isResultElement.value(name)) {
    elem = addIdAndClass(name, getResultElementByName, 'cost', options)
  }
  return elem
}
