<script setup>
import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";

const emits = defineEmits(['plus', 'minus'])
const props = defineProps({
  /**
   * отобразить динамичное значение
   */
  showDynamicValue: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  isError: {
    type: Boolean,
    default: false,
    validator(value) {
      return value === false || value === true;
    },
  },
  ...propsTemplate.getProps(['unit'])
})
</script>

<template>
  <div
    class="calc__range-current-wrapper"
    v-if="showDynamicValue || unit?.length"
  >
    <input
      class="calc__range-current-dynamic"
      :class="{ isError: isClassError }"
      v-if="showDynamicValue"
      type="text"
      v-model="dynamicValue"
      @keydown.up="emits('plus')"
      @keydown.down="emits('minus')"
    />
    <div class="calc__range-unit" v-if="unit?.length">
      {{ unit }}
    </div>
  </div>
</template>
