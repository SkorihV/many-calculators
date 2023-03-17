<template>
  <div
    class="calc__dev-block-wrapper"
    v-if="devMode && showInsideElementStatus"
  >
    <div class="calc__dev-block-element" v-if="label?.length">
      Заголовок элемента: {{ label }}
    </div>
    <div class="calc__dev-block-element calc__dev-block-element-name" v-if="elementName?.length">
      Имя элемента: {{ elementName }}
    </div>

    <div
      class="calc__dev-block-element"
      v-if="dependencyFormulaDisplay?.length"
    >
      Формула зависимости отображения: {{ dependencyFormulaDisplay }}
    </div>
    <div class="calc__dev-block-element" v-if="parsingFormulaVariables?.length">
      Формула зависимости отображения после обработки:
      {{ parsingFormulaVariables }}
    </div>

    <div
      class="calc__dev-block-element"
      v-if="leftDependencyFormulaDisplay?.length"
    >
      Формула зависимости отображения левой колонки:
      {{ leftDependencyFormulaDisplay }}
    </div>
    <div
      class="calc__dev-block-element"
      v-if="leftParsingFormulaVariables?.length"
    >
      Формула зависимости отображения левой колонки после обработки:
      {{ leftParsingFormulaVariables }}
    </div>

    <div
      class="calc__dev-block-element"
      v-if="rightDependencyFormulaDisplay?.length"
    >
      Формула зависимости отображения правой колонки:
      {{ rightDependencyFormulaDisplay }}
    </div>
    <div
      class="calc__dev-block-element"
      v-if="rightParsingFormulaVariables?.length"
    >
      Формула зависимости отображения правой колонки после обработки:
      {{ rightParsingFormulaVariables }}
    </div>

    <div class="calc__dev-block-element" v-if="formula?.length">
      Формула расчета: {{ formula }}
    </div>
    <div class="calc__dev-block-element" v-if="formulaVariables?.length">
      Формула расчета после обработки: {{ formulaVariables }}
    </div>

    <div class="calc__dev-block-element calc__dev-block-element-value" v-if="!hiddenValue">
      Значение элемента: {{ value === null ? "null" : value }}
    </div>
    <div
      class="calc__dev-block-element calc__dev-block-element-show"
      v-if="isVisibilityFromDependency !== null"
    >
      Элемент виден: {{ isVisibilityFromDependency }}
    </div>
    <div class="calc__dev-block-element calc__dev-block-element-cost" v-if="!hiddenCost">
      Текущая стоимость: {{ localCost === null ? "null" : localCost }}
    </div>
  </div>
</template>

<script>
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export default {
  name: "devBlock",
  props: {
    value: {},
    label: {
      type: String,
      default: null,
    },
    elementName: {
      type: String,
      default: null,
    },
    dependencyFormulaDisplay: {
      type: [String, Boolean],
      default: null,
    },
    parsingFormulaVariables: {
      type: [String, Boolean],
      default: null,
    },
    isVisibilityFromDependency: {
      type: Boolean,
      default: null,
    },
    localCost: {
      type: Number,
      default: null,
    },
    hiddenCost: {
      type: Boolean,
      default: false,
    },
    hiddenValue: {
      type: Boolean,
      default: false,
    },
    leftDependencyFormulaDisplay: {
      type: [String, Boolean],
      default: null,
    },
    leftParsingFormulaVariables: {
      type: [String, Boolean],
      default: null,
    },
    rightDependencyFormulaDisplay: {
      type: [String, Boolean],
      default: null,
    },
    rightParsingFormulaVariables: {
      type: [String, Boolean],
      default: null,
    },
    formula: {
      type: [String, Boolean],
      default: null,
    },
    formulaVariables: {
      type: [String, Boolean],
      default: null,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(useBaseStore, ["devMode", "showInsideElementStatus"]),
  },
};
</script>

<style scoped></style>
