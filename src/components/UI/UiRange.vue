<template>
  <div class="calc__range-wrapper" v-if="rangeValue !== null">
    <div v-if="label" class="calc__range-label">
      {{ label }}<slot name="prompt"></slot>
      <div
        class="calc__range-current-wrapper"
        v-if="showDynamicValue || showStaticValue"
      >
        <div class="calc__range-current-static" v-if="showStaticValue">
          {{ localRangeValue }}
        </div>
        <input
          class="calc__range-current-dynamic"
          v-if="showDynamicValue"
          type="text"
          v-model="localRangeValue"
        />
        <div class="calc__range-unit" v-if="unit">
          {{unit}}
        </div>
      </div>
    </div>
    <input
      class="calc__range-item"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="localRangeValue"
      @input="tryChangeValue"
    />
    <div v-if="showSteps" class="calc__range-steps-wrapper">
      <div
        class="calc__range-steps-item"
        @click="changeValueStep(step)"
        v-for="(step, inx) in returnSteps"
        :key="inx"
      >
        <div
          class="calc__range-steps-item-content"
          :class="{
            'calc__range-steps-item-content_selected': step === localRangeValue,
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
  emits: ["changedValue"],
  props: {
    label: {
      type: String,
      default: null,
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
    unit: {
      type: String,
      default: null
    },
    cost: {
      type: Number,
      default: null,
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    //шаг на самом ползунке
    step: {
      type: [Number, String],
      default: 1,
    },
    //отобразить шаги шкалы подсказок
    showSteps: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    //Отобразить текущее значение статичное
    showStaticValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    showDynamicValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      }
    },
    // размер шага у шкалы с подсказками
    stepPrompt: {
      type: [Number, String],
      default: 1,
    },
  },
  mounted() {
    let timer = setInterval(() => {
      if (this.rangeValue !== null) {
        this.localRangeValue = this.rangeValue;
        clearInterval(timer);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(timer);
    }, 10000);
  },
  data() {
    return {
      localRangeValue: null,
    };
  },
  methods: {
    changeValueStep(step) {
      this.changeValue(step);
    },
    tryChangeValue(e) {
      let value = parseFloat(e.target.value);
      this.changeValue(value);
    },
    changeValue(value) {
      if (this.max) {
        value = parseFloat(value) > this.max ? this.max : value;
      }
      if (this.min) {
        value = parseFloat(value) < this.min ? this.min : value;
      }
      this.localRangeValue = value;
      this.$emit("changedValue", {
        value: parseFloat(value),
        name: this.elementName,
        type: "range",
        cost: this.cost,
        label: this.label,
      });
    },
  },
  watch: {
    inputValue(newValue, oldValue) {
      if (isNaN(Number(newValue))) {
        this.localRangeValue = oldValue;
      } else if (!newValue) {
        return false;
      } else {
        this.changeValue(newValue);
      }
    },
    rangeValue(newValue) {
      this.localRangeValue = newValue;
    }
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
