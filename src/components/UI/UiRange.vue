<template>
  <div
    ref="parent"
    class="calc__wrapper-group-data"
    v-if="rangeValue !== null && isVisibilityFromDependency"
  >
    <div class="calc__range-wrapper" :class="classes" ref="thisElement">
      <div v-if="label" class="calc__range-label">
        {{ label }}
        <div class="empty-block" v-if="notEmpty">*</div>
        <slot name="prompt"></slot>
        <div
          class="calc__range-current-wrapper"
          v-if="showDynamicValue || unit?.length"
        >
          <input
            class="calc__range-current-dynamic"
            v-if="showDynamicValue"
            type="text"
            @input="changeDynamicValue"
            :value="resultValue"
            @keydown.up="plus"
            @keydown.down="minus"
          />
          <div class="calc__range-unit" v-if="unit?.length">
            {{ unit }}
          </div>
        </div>
      </div>
      <div>
        <input
          class="calc__range-item"
          type="range"
          :min="localMin"
          :max="localMax"
          :step="localStep"
          :value="resultValue"
          @input="tryChangeValue"
        />
        <div
          v-if="isStaticValue"
          :style="{ left: positionStaticResultValue }"
          class="calc__range-current-static"
        >
          {{ resultValue }}
        </div>
      </div>
      <div v-if="showSteps" class="calc__range-steps-wrapper">
        <div
          class="calc__range-steps-item"
          @click="changeValueStep(step)"
          v-for="(step, inx) in returnSteps"
          :style="{ left: pointsForStepsLine[inx] }"
          :key="inx"
          :class="{
            'calc__range-steps-item_selected': step === resultValue,
          }"
        >
          {{ step }}
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="localCanBeShownTooltip || isCanShowAllTooltips"
      />
    </div>
  </div>
  <div v-if="devModeData" v-html="devModeData"></div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { presets } from "../../../babel.config";

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
    ...UsePropsTemplates([
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "formOutputMethod",
      "parentName",
      "isNeedChoice",
      "formulaProcessingLogic",
      "templateName",
      "classes",
      "unit",
      "dependencyPrices",
      "cost",
      "min",
      "max",
      "dependencyFormulaDisplay",
      "parentIsShow",
    ]),
  },
  mounted() {
    if (!this.isNeedChoice) {
      let timer = setInterval(() => {
        if (this.checkedValueOnVoid(this.rangeValue)) {
          this.resultValue = parseFloat(this.rangeValue);
          this.changeValue("mounted");
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } else {
      this.changeValue("mounted");
    }

    if (this.$refs.thisElement) {
      this.elementWidth = this.$refs.thisElement.offsetWidth;
    }

    window.addEventListener("resize", () => {
      this.elementWidth = this.$refs.thisElement.offsetWidth;
    });
  },
  data() {
    return {
      elementWidth: 0,
      resultValue: null,
      textErrorNotEmpty: "Обязательное поле.",
      updateValueTimer: null,
      canBeShownTooltip: false,
      timerNameForLocalValue: null,
    };
  },
  methods: {
    changeValueStep(step) {
      this.resultValue = this.checkValidValueReturnNumber(step);
      this.changeValue();
      this.shownTooltip();
    },
    tryChangeValue(e) {
      clearTimeout(this.timerNameForLocalValue);
      this.resultValue = this.checkValidValueReturnNumber(e.target.value);
      this.timerNameForLocalValue = setTimeout(() => {
        this.changeValue();
        this.shownTooltip();
      }, 500);
    },
    changeDynamicValue(e) {
      this.$nextTick(() => {
        this.resultValue = this.checkValidValueReturnNumber(e.target.value);
        this.changeValue();
        this.shownTooltip();
      });
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
      this.resultValue = this.checkValidValueReturnNumber(this.resultValue);
      this.$emit("changedValue", {
        value: this.resultValue,
        displayValue: this.resultValue,
        name: this.localElementName,
        type: "range",
        cost: this.localCost,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        unit: this.unit,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
      });
      this.changeValid(eventType);
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: this.isVisibilityFromDependency
          ? this.isErrorEmpty
          : this.isVisibilityFromDependency,
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
        value: this.resultValue,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.resultValue,
        type: "range",
      });
    },
    shownTooltip() {
      if (!this.canBeShownTooltip) {
        this.canBeShownTooltip = true;
      }
    },
    updatedCostForOut(cost) {
      return this.checkedValueOnVoid(cost)
        ? cost * Math.abs(this.resultValue)
        : null;
    },
    plus() {
      this.resultValue = this.checkValidValueReturnNumber(
        this.resultValue + this.localStep
      );
      this.changeValue("plus");
      this.shownTooltip();
    },
    minus() {
      this.resultValue = this.checkValidValueReturnNumber(
        this.resultValue - this.localStep
      );
      this.changeValue("minus");
      this.shownTooltip();
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
        this.resultValue = parseFloat(newValue);
      }, 1500);
    },

    isVisibilityFromDependency(value) {
      if (value) {
        setTimeout(() => {
          this.elementWidth = this.$refs.thisElement.offsetWidth;
        }, 10);
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "isCanShowAllTooltips",
    ]),
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
      return this.notEmpty && this.resultValue === null;
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
        return this.updatedCostForOut(this.cost);
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );
      if (newCost !== null) {
        return this.updatedCostForOut(newCost);
      }
      return this.updatedCostForOut(this.cost);
    },
    positionStaticResultValue() {
      const width = this.elementWidth - 30;
      const percent =
        (this.resultValue - this.localMin) / (this.localMax - this.localMin);
      const position = width * percent + 2;
      return position + "px";
    },
    amountSteps() {
      return (this.localMax - this.localMin) / this.localStepPrompt;
    },
    pointsForStepsLine() {
      const width = this.elementWidth - 30;
      let points = [];
      points.push(0 + "px");
      let i = 1;
      for (i; i <= this.amountSteps; i++) {
        const percent =
          (this.localStepPrompt * i) / (this.localMax - this.localMin);
        const position = width * percent;
        points.push(position + "px");
      }
      return points;
    },
    isStaticValue() {
      return (
        this.showStaticValue &&
        typeof this.resultValue === "number" &&
        isFinite(this.resultValue)
      );
    },
  },
};
</script>
