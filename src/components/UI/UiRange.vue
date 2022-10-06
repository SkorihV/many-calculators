<template>
  <div class="calc__range-wrapper" :class="classes" v-if="rangeValue !== null">
    <div v-if="label" class="calc__range-label">
      {{ label }}<slot name="prompt"></slot>
      <div
        class="calc__range-current-wrapper"
        v-if="showDynamicValue || showStaticValue || unit?.length"
      >
        <div
          class="calc__range-current-static"
          v-if="showStaticValue || unit?.length"
        >
          {{ localRangeValue }}
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
      default: null,
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
    // необходимо для принудительного вывода в результат формы, даже если цена не указана
    notOnlyForCalculations: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    classes: {
      type: String,
      default: null
    }
  },
  mounted() {
    if (!this.isErrorEmpty) {
      let timer = setInterval(() => {
        if (this.checkedValueOnVoid(this.rangeValue)) {
          this.localRangeValue = parseFloat(this.rangeValue);
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
      textErrorNotEmpty: "Обязательное поле.",
      updateValueTimer: null,
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
      this.changeValue(e.target.value);
    },
  changeValue(value) {
      value = parseFloat(value);
      if (value > this.localMax) {
        value = this.localMax;
      }
      if (value < this.localMin) {
        value = this.localMin;
      }
      this.localRangeValue = value;
      this.$emit("changedValue", {
        value: this.localRangeValue,
        name: this.localElementName,
        type: "range",
        cost: this.resultSum,
        label: this.label,
        alwaysOutput: Boolean(this.notOnlyForCalculations),
      });
      this.changeValid();
    },
    changeValid() {
      this.$emit("changeValid", {
        error: this.isErrorEmpty,
        name: this.localElementName,
        type: "range",
        label: this.label,
      });
    },
    submitValue(value) {

    }
  },
  watch: {
    localRangeValue(newValue, oldValue) {
      if (isNaN(Number(newValue))) {
        this.localRangeValue = oldValue;
      } else if (!newValue) {
        return false;
      } else {
        this.changeValue(newValue);
      }
    },
    /**
     * Обработка значений поступающих извне необходим с задержкой для отображения ошибок остальных компонентов
     * @param newValue
     */
    rangeValue(newValue) {
      clearTimeout(this.updateValueTimer);
      this.updateValueTimer = setTimeout(() => {
          this.localRangeValue = parseFloat(newValue);
      }, 1500);
    },
  },
  computed: {
    localMin () {
      return this.checkedValueOnVoid(this.min) ? parseFloat(this.min) : 0;
    },
    localMax () {
      return this.checkedValueOnVoid(this.max) ? parseFloat(this.max) : 10;
    },

    localStep() {
      return this.checkedValueOnVoid(this.step) ? parseFloat(this.step) : 1;
    } ,

    localStepPrompt() {
      return this.checkedValueOnVoid(this.stepPrompt) ? parseFloat(this.stepPrompt): 1;
    },

    localElementName() {
     return this.checkedValueOnVoid(this.elementName) ? this.elementName: Math.random().toString();
    },
    resultSum() {
      return this.cost !== null
        ? this.cost * Math.abs(this.localRangeValue)
        : null;
    },
    returnSteps() {
      let steps = [];

      if (this.isHidePromptSteps) {
        return steps;
      }
      for (
        let i = this.localMin;
        i <= this.localMax;
        i += this.localStepPrompt
      ) {
        steps.push(i);
      }
      return steps;
    },
    isErrorEmpty() {
      return this.isNeedChoice && this.localRangeValue === null;
    },
    isHidePromptSteps() {
      return (
        !this.showSteps &&
        !this.localMin &&
        !this.localMax &&
        this.localStepPrompt < 1
      );
    },
  },
};
</script>

<style scoped></style>
