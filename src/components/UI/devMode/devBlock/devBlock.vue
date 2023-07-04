<script setup>
import {getBaseStoreGetters} from "@/composables/useBaseStore";
import { computed, ref } from "vue";
import {replaceSpecSymbols} from "@/servises/UtilityServices"
import devFormulaBlockWrapper from "@/components/UI/devMode/devBlock/devFormulaBlockWrapper.vue"

const {showInsideElementStatus} = getBaseStoreGetters('showInsideElementStatus')

const props = defineProps({
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
  typeElement: {
    default: null,
    type:String
  }
})
const isShowInnerData = ref(false)

const localFormula = computed(() => {
  return replaceSpecSymbols(props.formula)
})
</script>


<template>
  <div class="calc__dev-block-main-wrapper" v-if="showInsideElementStatus">
    <button
      class="calc__dev-block-button"
      v-if="showInsideElementStatus"
      @click="isShowInnerData = !isShowInnerData"
    >
      {{typeElement}}
      {{ isShowInnerData ? "скрыть" : "отобразить" }} :
      {{ label }}
    </button>
    <div class="calc__dev-block-wrapper" v-if="isShowInnerData">
      <div class="calc__dev-block-element" v-if="label?.length">
        Заголовок: {{ label }}
      </div>
      <div
        class="calc__dev-block-element calc__dev-block-element-name"
        v-if="elementName?.length"
      >
        Имя: {{ elementName }}
      </div>

      <dev-formula-block-wrapper
        v-if="dependencyFormulaDisplay?.length"
        :formula="dependencyFormulaDisplay"
        is-dependency
        label="Формула на отображение:"
      />
      <dev-formula-block-wrapper
        v-if="localFormula?.length"
        :formula="localFormula"
        is-result
        label="Формула расчета:"
      />

      <div
        class="calc__dev-block-element calc__dev-block-element-value"
        v-if="!hiddenValue"
      >
        Значение: {{ value === null ? "null" : value }}
      </div>
      <div
        class="calc__dev-block-element calc__dev-block-element-show"
        v-if="isVisibilityFromDependency !== null"
      >
        Виден: {{ isVisibilityFromDependency }}
      </div>
      <div
        class="calc__dev-block-element calc__dev-block-element-cost"
        v-if="!hiddenCost"
      >
        Стоимость: {{ localCost === null ? "null" : localCost }}
      </div>
    </div>
  </div>
</template>
