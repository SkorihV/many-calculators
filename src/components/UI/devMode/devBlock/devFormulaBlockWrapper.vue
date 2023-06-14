<script setup>

import { computed } from "vue";
import {getArrayOnFormula, replaceSpecSymbols} from "@/servises/UtilityServices";
import devFormulaItem from "@/components/UI/devMode/devBlock/devFormulaItem.vue"

const props = defineProps({
  label: {
    type: String,
    default: null
  },
  formula: {
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

const localFormula = computed(() => {
  return replaceSpecSymbols(props.formula)
})
const localFormulaArray = computed(() => {
  return getArrayOnFormula(localFormula.value)
})

</script>

<template>
  <div
    class="calc__dev-block-element"
    v-if="localFormula?.length"
  >
    <div class="calc__dev-block-item-label">{{label}}</div>
     <div class="calc__dev-block-item-wrapper">
       <dev-formula-item
         v-for="(item, index) in localFormulaArray"
         :key="index"
         :formula-item="item"
         :isDependency="isDependency"
         :isResult="isResult"
       />
     </div>
  </div>
</template>
