<script setup>
import { computed } from "vue";
import {storeToRefs} from "pinia";
import {useBaseStore} from "@/store/baseStore";
import {useResultListStore} from "@/store/resultListStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useDisplayComponentsStore} from "@/store/displayComponentsStore";
import {useElementNamesStore} from "@/store/elementNamesStore";
import {useInnerVariablesStore} from "@/store/innerCustomVariableStore";

import { isNumber, isSign, isVariable } from "@/validators/validators";
import { checkLogicAndReturnValue, isOtherOrGlobalSum } from "@/servises/UtilityServices";
import goScrollToElement from "@/composables/goScrollToElement";
import { REGEXP_NUMBERS } from "@/constants/regexp";

const baseStore = useBaseStore()
const resultStore = useResultListStore()
const  {isExistInnerVariable, getInnerVariableByName} = storeToRefs(useInnerVariablesStore())
const {getElementByNameInDependency, isElementDependency} = storeToRefs(useDependencyListStore())
const { isShowComponent, isExistComponent } = storeToRefs(useDisplayComponentsStore())
const { getResultElementByName, isElementResult } = storeToRefs(resultStore)
const { isExistName } = storeToRefs(useElementNamesStore())


const props = defineProps({
  formulaItem: {
    type: [String, Object],
    default: null,
  },
  isDependency: {
    type: Boolean,
    default: false,
  },
  isResult: {
    type: Boolean,
    default: false,
  },
  showValue: {
    type: Boolean,
    default: false,
  },
  showCost: {
    type: Boolean,
    default: false,
  },
  onlyName: {
    type: Boolean,
    default: false,
  },
});

const isExistNameVariable = computed(() => {
    return isExistName.value(props.formulaItem)
});

const isNameParams = computed(() => {
  return isVariable(props.formulaItem)
})

const isNotExist = computed(() => {
  return  isNameParams.value && !isExistNameVariable.value && !isOtherOrGlobalSum(props.formulaItem) && !isSingVariable.value && !isId.value
})

const isSingVariable = computed(() => {
  return isSign(props.formulaItem)
})

const isId = computed(() => {
  return isNumber(props.formulaItem)
})

const itemDependencyData = computed(() => {
  const variable = props.formulaItem;

  if (isInnerVariable(variable)) {
    return getInnerVariableByName.value(variable)
  }

  if (
    props.isDependency &&
    isElementDependency.value(variable)
  ) {
    return getElementByNameInDependency.value(variable);
  }
  return variable;
});

const itemResultData = computed(() => {
  const variable = props.formulaItem;

  if (isInnerVariable(variable)) {
    return getInnerVariableByName.value(variable)
  }

  if (props.isResult && isElementResult.value(variable)) {
    return getResultElementByName.value(variable);
  }
  return variable;
});

const itemValue = computed(() => {
  if (props.isDependency) {
    return String(itemDependencyData?.value?.value);
  } else if (props.isResult) {
    return String(itemResultData?.value?.value);
  }
});

const itemCost = computed(() => {
  if (!props.isResult) {
    return null;
  }
  if (itemResultData.value?.cost !== undefined) {
    return checkLogicAndReturnValue(itemResultData.value) === null
      ? "null"
      : checkLogicAndReturnValue(itemResultData.value);
  }
  return String(itemResultData?.value);
});

const localName = computed(() => {
  if (props.onlyName || !isExistNameVariable.value) {
    return props.formulaItem
  }

  if (props.isDependency) {
    return typeof itemDependencyData.value === "object"
      ? itemDependencyData.value?.name + " : "
      : null;
  } else if (props.isResult) {
    return typeof itemResultData.value === "object"
      ? itemResultData.value?.name + " : "
      : null;
  }
  return props.formulaItem
});

const isHiddenElement = computed(() => {
  return isShowComponent.value(props.formulaItem) !== null &&
    isExistNameVariable.value
    ? !isShowComponent.value(props.formulaItem)
    : false;
});

const title = computed(() => {
  if (!isId.value && !isExistNameVariable.value) {
    return null
  }

  if (isHiddenElement?.value) {
    return "Элемент скрыт";
  }
  if (!isExistNameVariable.value) {
    return "Элемент не существует";
  }
  return null;
});

const classes = computed(() => {
  return [
    isExistNameVariable.value ? "is-variable" : "",
    isHiddenElement.value ? "is-hidden" : "",
    isNotExist.value  ? "is-not-exist" : "",
    !isHiddenElement.value && !isSingVariable.value
      ? "is-pointer"
      : "",
  ];
});

const isShowValue = computed(() => {
  return props.showValue && (isExistNameVariable.value || isId.value)
})

const isShowCost = computed(() => {
  return props.showCost && (isExistNameVariable.value || isId.value)
})

function goToElement() {
  if (!isHiddenElement.value && isExistNameVariable.value && !isSingVariable.value) {
    if (!isId.value) {
      goScrollToElement(props.formulaItem, "center");
    }
    baseStore.setNameHighlightElement(props.formulaItem);
  }
}

function isInnerVariable (variable) {
  return isOtherOrGlobalSum(variable) && isExistInnerVariable.value(variable)
}

</script>

<template>
  <div
    class="calc__dev-block-item"
    :title="title"
    :class="[...classes]"
    @click="goToElement"
  >
    <span>{{ isId ? 'Без имени: ' : localName }}</span>
    <template v-if="isShowValue">  {{ itemValue }}</template>
    <template v-if="isShowCost">   {{ itemCost }}</template>
  </div>
</template>

<style scoped></style>
