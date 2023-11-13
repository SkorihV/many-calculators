<script setup>
import { computed } from "vue";
import { checkedValueOnVoid, decimalAdjust, getSignsAfterComma } from "@/servises/UtilityServices";

const emits = defineEmits(["update:modelValue",]);
const props = defineProps({
  modelValue: {
    value: {
      type: [String, Number],
    },
  },
  /**
   * отобразить ленту с шагами под ползунком
   */
  showSteps: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  localMin: {
    type: [String, Number],
    default: null,
  },
  localMax: {
    type: [String, Number],
    default: null,
  },
  /**
   * Шаг деления в ленте
   */
  stepPrompt: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  elementWidth: {
    type: Number,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
});

const localStepPrompt = computed(() => {
  return checkedValueOnVoid(props.stepPrompt)
    ? parseFloat(props.stepPrompt)
    : 1;
});

const isHidePromptSteps = computed(() => {
  return (
    !props.showSteps &&
    !props.localMin &&
    !props.localMax &&
    localStepPrompt.value < 1
  );
});

const returnSteps = computed(() => {
  let steps = [];

  if (isHidePromptSteps.value) {
    return steps;
  }
  for (
    let i = props.localMin;
    i <= props.localMax;
    i += localStepPrompt.value
  ) {
    steps.push(decimalAdjust(i, numberSignsAfterCommaForStepPrompt.value, 'round'));
  }
  return steps;
});

const amountSteps = computed(() => {
  return (props.localMax - props.localMin) / localStepPrompt.value;
});

const pointsForStepsLine = computed(() => {
  const rightShiftElementWidth = 21;
  const firstPointPosition = 12;
  let points = [];
  const width = props.elementWidth - rightShiftElementWidth;

  points.push(firstPointPosition);
  let i = 1;
  for (i; i <= amountSteps.value; i++) {
    const percent =
      (localStepPrompt.value * i) / (props.localMax - props.localMin);
    let position = 0;
    if (returnSteps.value[i].toString().length === 1) {
      position = width * percent + 11;
    } else {
      position = width * percent + 10;
    }

    points.push(decimalAdjust(position, -4, 'round'));
  }
  return points;
});

const isShowStepLine = computed(() => {
  return props.showSteps && props.elementWidth > 220;
});


const numberSignsAfterCommaForStepPrompt = computed(() => {
  return getSignsAfterComma(props.stepPrompt)
});

function changeValueStep(step) {
  emits("update:modelValue", step);
}

</script>

<template>
  <div v-if="isShowStepLine" class="calc__range-steps-wrapper">
    <div
      class="calc__range-steps-item"
      @click="changeValueStep(step)"
      v-for="(step, inx) in returnSteps"
      :style="{ left: pointsForStepsLine[inx] + 'px' }"
      :key="inx"
      :class="{ 'calc__range-steps-item_selected': step === modelValue }"
    >
      <div class="calc__range-steps-item-value">{{ step }}</div>
    </div>
  </div>
</template>
