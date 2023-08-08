<script setup>
import { computed } from "vue";
import {storeToRefs} from "pinia";
import {useBaseStore} from "@/store/baseStore";
import {useResultListStore} from "@/store/resultListStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useDisplayComponentsStore} from "@/store/displayComponentsStore";
import {useElementNamesStore} from "@/store/elementNamesStore";

import { isVariable } from "@/validators/validators";
import { checkLogicAndReturnValue } from "@/servises/UtilityServices";
import goScrollToElement from "@/composables/goScrollToElement";

const baseStore = useBaseStore()
const resultStore = useResultListStore()
const {getElementByNameInDependency, isElementDependency} = storeToRefs(useDependencyListStore())
const { isShowComponent: isShowComponent, isExistComponent } = storeToRefs(useDisplayComponentsStore())
const { getResultElementByName, isElementResult } = storeToRefs(resultStore)
const {getAllNameListByArray} = storeToRefs(useElementNamesStore())


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

const isVariableParam = computed(() => {
  if (typeof props.formulaItem === "object") {
    return getAllNameListByArray.value.find(item => item.name === props.formulaItem.name)
  } else {
    return getAllNameListByArray.value.find(item => item.name === props.formulaItem)
  }
});

const isId = computed(() => {
  if (typeof props.formulaItem === "object") {
    return !isVariable(props.formulaItem.name);
  } else {
    return !isVariable(props.formulaItem);
  }
})

const itemDependencyData = computed(() => {
  const formula = props.formulaItem;
  if (
    props.isDependency &&
    isElementDependency.value(formula)
  ) {
    return getElementByNameInDependency.value(formula);
  }
  return formula;
});

const itemResultData = computed(() => {
  const formula = props.formulaItem;
  if (props.isResult && isElementResult.value(formula)) {
    return getResultElementByName.value(formula);
  }
  return formula;
});

const itemValue = computed(() => {
  if (props.isDependency) {
    if (itemDependencyData.value?.value !== undefined) {
      return itemDependencyData.value.value === null
        ? "null"
        : itemDependencyData.value.value;
    }
    return itemDependencyData?.value;
  } else if (props.isResult) {
    if (itemResultData.value?.value !== undefined) {
      return itemResultData.value.value === null
        ? "null"
        : itemResultData.value.value;
    }
    return itemResultData?.value;
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
  return itemResultData?.value;
});

const localName = computed(() => {
  if (props.onlyName) {
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
});

const isExist = computed(() => {
  if (!isVariableParam.value) {
    return true;
  }
  return (
      isExistComponent.value(props.formulaItem)
  );
});

const isHiddenElement = computed(() => {
  return isShowComponent.value(props.formulaItem) !== null &&
    isExist.value
    ? !isShowComponent.value(props.formulaItem)
    : false;
});

const title = computed(() => {
  if (isHiddenElement?.value && isExist.value) {
    return "Элемент скрыт";
  }
  if (!isExist.value) {
    return "Элемент не существует";
  }
  return null;
});

const classes = computed(() => {
  return [
    isVariableParam.value ? "is-variable" : "",
    isHiddenElement.value ? "is-hidden" : "",
    !isExist.value ? "is-not-exist" : "",
    !isHiddenElement.value && isExist.value && isVariableParam.value
      ? "is-pointer"
      : "",
  ];
});
function goToElement() {
  if (!isHiddenElement.value && isVariableParam.value) {
    if (!isId.value) {
      goScrollToElement(props.formulaItem, "center");
    }
    baseStore.setNameHighlightElement(props.formulaItem);
  }
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
    <template v-if="showValue">  {{ itemValue }}</template>
    <template v-if="showCost">   {{ itemCost }}</template>
  </div>
</template>

<style scoped></style>
