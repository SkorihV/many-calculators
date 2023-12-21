<script setup>
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { useCheckedValueMinMax } from "@/components/UI/mainCalculated/UiRange/useCheckedValueMinMax";
import { computed, onMounted, ref, watch } from "vue";
import { decimalAdjust, getSignsAfterComma, roundingValueToInputNumber } from "@/servises/UtilityServices";

const emits = defineEmits(["plus", "minus", "update:dynamicValue"]);
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
  /**
   * шаг при нажатии на + / -
   */
  step: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  ...propsTemplate.getProps(["unit", "min", "max"]),
});

const nameTimer = ref(null);

const localStep = computed(() => {
  return parseFloat(props.step)
})

const signAfterComa = computed(() => {
  return getSignsAfterComma(localStep.value)
})

const { checkValidValueReturnNumber } = useCheckedValueMinMax(
  props.min,
  props.max
);
const localValue = ref(null);
const currentEmit = ref(null)
function plus() {
  currentEmit.value = 'plus'
  emitValue(parseFloat(localValue.value) + localStep.value, 'plus')
}

function minus() {
  currentEmit.value = 'minus'
  emitValue(parseFloat(localValue.value) - localStep.value, 'minus')
}

function updateValue() {
  currentEmit.value = 'updateValue'
  emitValue(localValue.value)
}

function processingFinalValue(value) {
  value = checkValidValueReturnNumber(value)
  value = roundingValueToInputNumber(value, localStep.value)
  return decimalAdjust(value, signAfterComa.value, 'round')
}

function emitValue(value, type) {
  value = value?.toString()
  if (value?.length && value.match(/\.|,|-/) !== null && (type !== 'minus' || type !== 'plus')) {
    value = value.replaceAll(",", ".")
      clearTimeout(nameTimer.value)

      localValue.value = value
      nameTimer.value = setTimeout(() => {
        localValue.value = processingFinalValue(value)
        emits("update:dynamicValue", localValue.value);
      }, 1000)
  } else {
    localValue.value = processingFinalValue(value)
    emits("update:dynamicValue", localValue.value);
  }
}

onMounted(() => {
  localValue.value = props.dynamicValue;
});

watch(
  () => props.dynamicValue,
  (newValue) => {
    currentEmit.value = "dynamicValue"
    localValue.value = processingFinalValue(newValue)
  }
);

watch(localValue, (newValue) => {
  if (['plus', 'minus', 'dynamicValue'].includes(currentEmit.value)) {
    localValue.value = processingFinalValue(newValue)
  } else {
    localValue.value = newValue
  }
  currentEmit.value = null;
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
