<script setup>
import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";
import {useCheckedValueMinMax} from "@/components/UI/mainCalculated/UiRange/useCheckedValueMinMax";
import { onMounted, ref, watch } from "vue";

const emits = defineEmits(['plus', 'minus', 'update:dynamicValue'])
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
  dynamicValue: {
    type: [String, Number],
    default: null,
  },
  ...propsTemplate.getProps(['unit','min','max',])
})

const {checkValidValueReturnNumber} = useCheckedValueMinMax(props.min, props.max)
const localValue = ref(null)
function plus() {
  localValue.value = checkValidValueReturnNumber(localValue.value + 1)
  emits("update:dynamicValue", localValue.value)
}

function minus() {
  localValue.value = checkValidValueReturnNumber(localValue.value - 1)
  emits("update:dynamicValue", localValue.value)
}

function updateValue(e) {
  localValue.value = checkValidValueReturnNumber(localValue.value)
  emits("update:dynamicValue", localValue.value)
}

onMounted(() => {
  localValue.value = props.dynamicValue
})

watch(() => props.dynamicValue, (newValue) => {
  localValue.value = newValue
})

</script>

<template>
  <div
    class="calc__range-current-wrapper"
    v-if="showDynamicValue || unit?.length"
  >
    <input
      class="calc__range-current-dynamic"
      :class="{ isError: isError }"
      v-if="showDynamicValue"
      type="text"
      v-model="localValue"
      @input="updateValue"
      @keydown.up="plus"
      @keydown.down="minus"
    />
    <div class="calc__range-unit" v-if="unit?.length">
      {{ unit }}
    </div>
  </div>
</template>
