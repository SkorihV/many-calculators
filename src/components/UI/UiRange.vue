<template>
  <div class="calc__range-wrapper">
    <div v-if="label.length" class="calc__range-label">{{ label }}</div>
    <input
      class="calc__range-item"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="inputValue"
      @input="tryChangeValue"
    />
    <div v-if="showSteps" class="calc__range-steps-wrapper">
      <div
        class="calc__range-steps-item"
        @click="changeValueStep(step)"
        :class="{ 'calc__range-steps-item-selected': step === inputValue }"
        v-for="(step, inx) in returnSteps"
        :key="inx"
      >
        <div
          class="calc__range-steps-item-content"
          :class="{
            'calc__range-steps-item-content_selected': step === inputValue,
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
  props: {
    label: {
      type: String,
      default: "",
    },
    inputValue: {
      type: [Number, String],
      default: 0,
    },
    min: {
      type: [Number, String],
      default: 0,
    },
    max: {
      type: [Number, String],
      default: 10,
    },
    step: {
      type: [Number, String],
      default: 1,
    },
    showSteps: {
      type: Boolean,
    },
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
      this.$emit("changeValue", parseFloat(value));
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
