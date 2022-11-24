<template>
  <div
    class="calc__wrapper-group-data"
    v-if="rangeValue !== null && isVisibilityFromDependency"
  >
    <div class="calc__range-wrapper" :class="classes">
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
            @input="changeDynamicValue"
            :value="localRangeValue"
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
              'calc__range-steps-item-content_selected':
                step === localRangeValue,
            }"
          >
            {{ step }}
          </div>
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="localCanBeShownTooltip || isCanShowAllTooltips"
      />
    </div>
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "UiRange",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip },
  props: {
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
    cost: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     * Список цен с зависимостями / условиями
     */
    dependencyPrices: {
      type: Array,
      default: () => [],
    },
    unit: {
      type: String,
      default: null,
    },
    /**
     * размер шага в ползунке
     */
    step: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
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
    /**
     *
     * Шаг деления в ленте
     */
    stepPrompt: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
      },
    },

    /**
     * Убран предвыбор
     */
    isNeedChoice: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     *
     *     Отобразить текущее значение статичное
     */
    showStaticValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

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

    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
  },
  mounted() {
    if (!this.isNeedChoice) {
      let timer = setInterval(() => {
        if (this.checkedValueOnVoid(this.rangeValue)) {
          this.localRangeValue = parseFloat(this.rangeValue);
          this.changeValue("mounted");
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeValid("mounted");
    }
  },
  data() {
    return {
      localRangeValue: null,
      textErrorNotEmpty: "Обязательное поле.",
      updateValueTimer: null,
      canBeShownTooltip: false,
      timerNameForLocalValue: null,
    };
  },
  methods: {
    ...mapActions(["tryAddDependencyElement", "checkValidationDataAndToggle"]),
    changeValueStep(step) {
      this.localRangeValue = this.checkValidValueReturnNumber(step);
      this.changeValue();
      this.shownTooltip();
    },
    tryChangeValue(e) {
      clearTimeout(this.timerNameForLocalValue);
      this.localRangeValue = this.checkValidValueReturnNumber(e.target.value);
      this.timerNameForLocalValue = setTimeout(() => {
        this.changeValue();
        this.shownTooltip();
      }, 500);
    },
    changeDynamicValue(e) {
      this.localRangeValue = this.checkValidValueReturnNumber(e.target.value);
      this.changeValue();
      this.shownTooltip();
    },
    checkValidValueReturnNumber(checkedValue) {
      let value = !isNaN(parseFloat(checkedValue))
        ? parseFloat(checkedValue)
        : null;
      if (value > this.localMax) {
        value = this.localMax;
      }
      if (value < this.localMin) {
        value = this.localMin;
      }
      return value;
    },
    changeValue(eventType = "input") {
      this.localRangeValue = this.checkValidValueReturnNumber(
        this.localRangeValue
      );
      this.$emit("changedValue", {
        value: this.localRangeValue,
        displayValue: this.localRangeValue,
        name: this.localElementName,
        type: "range",
        cost: this.resultSum,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        unit: this.unit,
        eventType,
      });
      this.changeValid(eventType);
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: this.isErrorEmpty,
        name: this.localElementName,
        type: "range",
        label: this.label,
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
      this.tryPassDependency();
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.localRangeValue,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.localRangeValue,
        type: "range",
      });
    },
    shownTooltip() {
      if (!this.canBeShownTooltip) {
        this.canBeShownTooltip = true;
      }
    },
  },
  watch: {
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
    ...mapGetters(["isCanShowAllTooltips"]),
    localMin() {
      return this.checkedValueOnVoid(this.min) ? parseFloat(this.min) : 0;
    },
    localMax() {
      return this.checkedValueOnVoid(this.max) ? parseFloat(this.max) : 10;
    },

    localStep() {
      return this.checkedValueOnVoid(this.step) ? parseFloat(this.step) : 1;
    },

    localStepPrompt() {
      return this.checkedValueOnVoid(this.stepPrompt)
        ? parseFloat(this.stepPrompt)
        : 1;
    },

    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    resultSum() {
      return this.checkedValueOnVoid(this.localCost)
        ? this.localCost * Math.abs(this.localRangeValue)
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
      return this.notEmpty && this.localRangeValue === null;
    },
    isHidePromptSteps() {
      return (
        !this.showSteps &&
        !this.localMin &&
        !this.localMax &&
        this.localStepPrompt < 1
      );
    },
    localCanBeShownTooltip() {
      return this.canBeShownTooltip && this.isVisibilityFromDependency;
    },

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
        return this.cost;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return this.cost;
    },
  },
};
</script>

<style scoped></style>
