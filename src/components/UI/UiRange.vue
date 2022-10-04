<template>
  <div class="calc__range-wrapper" v-if="rangeValue !== null">
    <div v-if="label" class="calc__range-label">
      {{ label }}<slot name="prompt"></slot>
      <div
        class="calc__range-current-wrapper"
        v-if="showDynamicValue || showStaticValue"
      >
        <div class="calc__range-current-static" v-if="showStaticValue">
          {{localRangeValue}}
        </div>
        <input
          class="calc__range-current-dynamic"
          v-if="showDynamicValue"
          type="text"
          v-model="localRangeValue"
        />
        <div class="calc__range-unit" v-if="unit">
          {{ unit }}
        </div>
      </div>
    </div>
    <input
      class="calc__range-item"
      type="range"
      :min="localMin"
      :max="localMax"
      :step="localStep"
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
    <ui-tooltip :is-show="isErrorEmpty" :tooltip-text="textErrorNotEmpty" />
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";

export default {
  name: "UiRange",
  emits: ["changedValue", "changeValid"],
  components: { UiTooltip },
  props: {
    label: {
      type: String,
      default: null,
    },
    rangeValue: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    min: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    max: {
      type: [Number, String],
      default: 10,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    unit: {
      type: String,
      default: null,
    },
    cost: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    isNeedChoice: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    //шаг на самом ползунке
    step: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    //отобразить шаги шкалы подсказок
    showSteps: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    //Отобразить текущее значение статичное
    showStaticValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    showDynamicValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    // размер шага у шкалы с подсказками
    stepPrompt: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
  },
  mounted() {
    this.localMin = this.checkedValueOnVoid(this.min) ? this.min : 0;
    this.localMax = this.checkedValueOnVoid(this.max) ? this.max : 10;
    this.localStep = this.checkedValueOnVoid(this.step) ? this.step : 1;
    this.localStepPrompt = this.checkedValueOnVoid(this.stepPrompt) ? this.stepPrompt : 1;

    if (!this.isErrorEmpty) {
      let timer = setInterval(() => {
        if (this.checkedValueOnVoid(this.rangeValue)) {
          this.localRangeValue = this.rangeValue;
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeValid();
    }
  },
  data() {
    return {
      localRangeValue: null,
      localMin: 0,
      localMax: 10,
      localStep: 1,
      localStepPrompt: 1,
      localCost: null,
      textErrorNotEmpty: "Обязательное поле.",
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    changeValueStep(step) {
      this.changeValue(step);
    },
    tryChangeValue(e) {
      let value = parseFloat(e.target.value);
      this.changeValue(value);
    },
    changeValue(value) {
      if (this.localMax) {
        value = parseFloat(value) > this.localMax ? this.localMax : value;
      }
      if (this.localMin) {
        value = parseFloat(value) < this.localMin ? this.localMin : value;
      }
      this.localRangeValue = value;
      this.$emit("changedValue", {
        value: this.localRangeValue,
        name: this.elementName,
        type: "range",
        cost:  this.resultSum,
        label: this.label,
      });
      this.changeValid();
    },
    changeValid() {
      this.$emit("changeValid", {
        error: this.isErrorEmpty,
        name: this.elementName,
        type: "range",
        label: this.label
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
    },
  },
  computed: {
    resultSum() {
      return !isNaN(this.cost * this.localRangeValue) ? this.cost * this.localRangeValue : null;
    },
    returnSteps() {
      let steps = [];

      if (this.isHidePromptSteps) {
        return steps;
      }

      for (let i = this.localMin; i <= this.localMax; i += this.stepPrompt) {
        steps.push(i);
      }
      return steps;
    },
    isErrorEmpty() {
      return this.isNeedChoice && this.localRangeValue === null;
    },
    isHidePromptSteps() {
      return !this.showSteps && !this.localMin && !this.localMax && this.stepPrompt < 1;
    }
  },
};
</script>

<style scoped></style>
