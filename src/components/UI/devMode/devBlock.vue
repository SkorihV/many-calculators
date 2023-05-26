<template>
  <div class="calc__dev-block-main-wrapper" v-if="showInsideElementStatus">
    <button
      class="calc__dev-block-button"
      v-if="showInsideElementStatus"
      @click="isShowInnerData = !isShowInnerData"
    >
      {{ isShowInnerData ? "Скрыть" : "Отобразить" }} внутреннее состояние:
      {{ label }}
    </button>
    <div class="calc__dev-block-wrapper" v-if="isShowInnerData">
      <div class="calc__dev-block-element" v-if="label?.length">
        Заголовок элемента: {{ label }}
      </div>
      <div
        class="calc__dev-block-element calc__dev-block-element-name"
        v-if="elementName?.length"
      >
        Имя элемента: {{ elementName }}
      </div>

      <div
        class="calc__dev-block-element"
        v-if="dependencyFormulaDisplay?.length"
      >
        Формула зависимости отображения: {{ dependencyFormulaDisplay }}
      </div>
      <div
        class="calc__dev-block-element"
        v-if="parsingFormulaVariables?.length"
      >
        Формула зависимости отображения после обработки:
        {{ parsingFormulaVariables }}
      </div>
      <div class="calc__dev-block-element" v-if="formula?.length">
        Формула расчета: {{ formula }}
      </div>
      <div class="calc__dev-block-element" v-if="formulaVariables?.length">
        Формула расчета после обработки: {{ formulaVariables }}
      </div>

      <div
        class="calc__dev-block-element calc__dev-block-element-value"
        v-if="!hiddenValue"
      >
        Значение элемента: {{ value === null ? "null" : value }}
      </div>
      <div
        class="calc__dev-block-element calc__dev-block-element-show"
        v-if="isVisibilityFromDependency !== null"
      >
        Элемент виден: {{ isVisibilityFromDependency }}
      </div>
      <div
        class="calc__dev-block-element calc__dev-block-element-cost"
        v-if="!hiddenCost"
      >
        Текущая стоимость: {{ localCost === null ? "null" : localCost }}
      </div>
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
    formula: {
      default: null,
    },
    formulaVariables: {
      default: null,
    },
  },
  data() {
    return {
      isShowInnerData: false,
    };
  },
  computed: {
    ...mapState(useBaseStore, ["showInsideElementStatus"]),
  },
};
</script>

<style scoped></style>
