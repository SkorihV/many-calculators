<script setup>

import { computed, ref, watch } from "vue";
import {getArrayOnFormula, replaceSpecSymbols} from "@/servises/UtilityServices";
import devFormulaItem from "@/components/UI/devMode/devBlock/devFormulaItem.vue"
import { NAME_RESERVED_VARIABLE_SUM } from "@/constants/variables";
import {useGetOtherGlobalSum} from "@/composables/useGetOtherGlobalSum";
import {getBaseStoreGetters} from "@/composables/useBaseStore";


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

const typeData = ref('value')
const {getDependencyElementOnName} = getBaseStoreGetters()
function switchTypeData() {
  if (typeData.value === 'value') {
    typeData.value = 'cost'
  } else if (typeData.value === 'cost') {
    typeData.value = 'value'
  }
}

const localFormula = computed(() => {
  return replaceSpecSymbols(props.formula)
})
const localFormulaArray = computed(() => {
  return getArrayOnFormula(localFormula.value)
})

const isExistOtherSum = computed(() => {
  return localFormulaArray.value.includes(NAME_RESERVED_VARIABLE_SUM)
})

const formulaArrayInOut = computed(() => {
  if (isExistOtherSum.value) {
    const otherSum = getDependencyElementOnName.value(NAME_RESERVED_VARIABLE_SUM)
   return localFormulaArray.value.map(item => item !== NAME_RESERVED_VARIABLE_SUM ? item : otherSum)
  }
  return localFormulaArray.value
})

</script>

<template>
  <div
    class="calc__dev-block-element"
    v-if="localFormula?.length"
  >
    <div class="calc__dev-block-item-label">{{label}}<button v-if="isResult" @click="switchTypeData">{{typeData}}</button></div>
     <div class="calc__dev-block-item-wrapper" v-if="isDependency">
       <dev-formula-item
         v-for="(item, index) in formulaArrayInOut"
         :key="index"
         :formula-item="item"
         :isDependency="isDependency"
         show-value
       />
     </div>
    <template v-if="isResult">
      <div class="calc__dev-block-item-wrapper" v-if="typeData === 'value'">
        <dev-formula-item
          v-for="(item, index) in formulaArrayInOut"
          :key="index"
          :formula-item="item"
          :isResult="isResult"
          show-value
        />
      </div>
      <div class="calc__dev-block-item-wrapper" v-if="typeData === 'cost'">
        <dev-formula-item
          v-for="(item, index) in formulaArrayInOut"
          :key="index"
          :formula-item="item"
          :isResult="isResult"
          show-cost
        />
      </div>
    </template>
  </div>
</template>
