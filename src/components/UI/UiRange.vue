<template>
  <div class="calc__range-wrapper" v-if="rangeValue !== null">
    <div v-if="label.length" class="calc__range-label">
      {{ label }}<slot name="prompt"></slot><div class="calc__range-current-value" v-if="showValue">{{rangeValue}}</div>
    </div>
    <input
      class="calc__range-item"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="rangeValue"
      @input="tryChangeValue"
    />
    <div v-if="showSteps" class="calc__range-steps-wrapper">
      <div
        class="calc__range-steps-item"
        @click="changeValueStep(step)"
        :class="{ 'calc__range-steps-item-selected': step === rangeValue }"
        v-for="(step, inx) in returnSteps"
        :key="inx"
      >
        <div
          class="calc__range-steps-item-content"
          :class="{
            'calc__range-steps-item-content_selected': step === rangeValue,
          }"
        >
          {{ step }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UiRange",
  emits:["changedValue"],
  props: {
    label: {
      type: String,
      default: "",
    },
    rangeValue: {
      type: [Number, String],
      default: null,
    },
    min: {
      type: [Number, String],
      default: 0,
    },
    max: {
      type: [Number, String],
      default: 10,
    },
    rangeName: {
      type: String,
      default: Math.random().toString()
    },
    //шаг на самом ползунке
    step: {
      type: [Number, String],
      default: 1,
    },
    //отобразить шаги шкалы подсказок
    showSteps: {
      type: Boolean,
    },
    //Отобразить текущее значение
    showValue: {
      type: Boolean
    },
    // размер шага у шкалы с подсказками
    stepPrompt: {
      type: [Number, String],
      default: 1,
    },
  },
  data() {
    return {
      value: 0,
    };
  },
  methods: {
    changeValueStep(step) {
      this.changeValue(step);
    },
    tryChangeValue(e) {
      this.value = e.target.value;
      this.changeValue(e.target.value);
    },
    changeValue(value) {
      this.$emit("changedValue", {value: parseFloat(value), name: this.rangeName, type: "range"});
    },
  },
  computed: {
    returnSteps() {
      let steps = [];
      const min = parseFloat(this.min);
      const max = parseFloat(this.max);
      const step = parseFloat(this.stepPrompt);

      if (!this.showSteps && !min && !max && step < 1) {
        return steps;
      }

      for (let i = min; i <= max; i += step) {
        steps.push(i);
      }
      return steps;
    },
  },
};
</script>

<style scoped></style>
