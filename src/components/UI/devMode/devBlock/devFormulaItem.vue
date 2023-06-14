<script setup>

import {getBaseStoreGetters, getBaseStoreAction} from "@/composables/useBaseStore";
import { computed } from "vue";
import { isSpecSymbol, isVariable } from "@/validators/validators";

const {getResultElementOnName, getDependencyElementOnName} = getBaseStoreGetters()
const {isElementDependency, isElementResult} = getBaseStoreAction(['isElementDependency', 'isElementResult'])

const props = defineProps({
  formulaItem: {
    type: String,
    default: null
  },
  isDependency: {
    type: Boolean,
    default: false
  },
  isResult: {
    type: Boolean,
    default: false
  }
})

const localIsVariable = computed(() => {
  return isVariable(props.formulaItem)
})

const localFormulaItem = computed(() => {
  const data = props.formulaItem;
  if (localIsVariable.value) {
    if (props.isDependency && isElementDependency(data)) {
      return getDependencyElementOnName.value(data)
    } else if (props.isResult && isElementResult(data)) {
      return getResultElementOnName.value(data)
    }
    return data;
  }
  return data
})

const localFormulaItemData = computed(() => {
  if (localFormulaItem.value?.value !== undefined) {
    return localFormulaItem.value.value === null ? 'null' : localFormulaItem.value.value
  }
  return localFormulaItem.value.replaceAll(/"|'/g, '')
})

const isHiddenElement = computed(() => {
  if (localIsVariable.value) {
    return !localFormulaItem.value.isShow
  }

  return false;
})

const isExist = computed(() => {

  if (!localIsVariable.value) {
    return true
  }

  return isElementDependency(props.formulaItem) || isElementResult(props.formulaItem)
})

const title = computed(() => {
  if (isHiddenElement.value) {
    return "Элемент скрыт"
  }

  if (!isExist.value) {
    return "Элемент не существует"
  }

  return null;
})

const classes = computed(() => {
  return [
    localIsVariable.value ? 'calc__dev-block-item-is-variable' : "" ,
    isHiddenElement.value ? 'calc__dev-block-item-is-hidden': "",
    !isExist.value ? 'calc__dev-block-item-not-exist': ""
  ]
})


</script>

<template>
  <div
    class="calc__dev-block-item"
    :title="title"
    :class="[...classes]"
  >{{localIsVariable ? formulaItem + " : " : null}}{{localFormulaItemData}}</div>
</template>

<style scoped>

</style>
