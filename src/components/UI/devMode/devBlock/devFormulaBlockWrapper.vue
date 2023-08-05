<script setup>
import { computed, ref } from "vue";
import {
  getArrayOnFormula,
  replaceSpecSymbols,
} from "@/servises/UtilityServices";
import devFormulaItem from "@/components/UI/devMode/devBlock/devFormulaItem.vue";
import { NAME_RESERVED_VARIABLE_SUM } from "@/constants/variables";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {storeToRefs} from "pinia";



const props = defineProps({
  label: {
    type: String,
    default: null,
  },
  formula: {
    type: String,
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
});

const typeData = ref("value");
const { getElementByNameInDependency } = storeToRefs(useDependencyListStore());
function switchTypeData() {
  if (typeData.value === "value") {
    typeData.value = "cost";
  } else if (typeData.value === "cost") {
    typeData.value = "value";
  }
}

const localFormula = computed(() => {
  return replaceSpecSymbols(props.formula);
});
const localFormulaArray = computed(() => {
  return getArrayOnFormula(localFormula.value);
});

const formulaArrayInOut = computed(() => {
  return localFormulaArray.value.map((item) => {
    if (isExistOtherSum(item)) {
      return getElementByNameInDependency.value(item);
    }
    return item;
  });
});

function isExistOtherSum(variable) {
  return variable.match(NAME_RESERVED_VARIABLE_SUM) !== null;
}
</script>

<template>
  <div class="calc__dev-block-element" v-if="localFormula?.length">
    <div class="calc__dev-block-item-label">
      {{ label
      }}
    </div>
    <div class="calc__dev-block-item-wrapper" v-if="isDependency">
      <dev-formula-item
        v-for="(item, index) in formulaArrayInOut"
        :key="index"
        :formula-item="item"
        :isDependency="isDependency"
        show-value
      />
    </div>
    <div class="calc__dev-block-item-main-wrapper" v-if="isResult">
      <button class="calc__dev-block-switcher" v-if="isResult" @click="switchTypeData">{{ typeData }}</button>
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
    </div>
  </div>
</template>
