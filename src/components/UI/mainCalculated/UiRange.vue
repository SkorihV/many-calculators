<template>
  <div
    ref="parent"
    class="calc__wrapper-group-data"
    :id="elementName"
    v-if="rangeValue !== null && isVisibilityFromDependency"
  >
    <div class="calc__range-wrapper" :class="[classes, {'column': isColumn || isMakeElementColumn}]">
      <icon-element-wrapper
        :icon-settings="iconSettings"
        :alt="isExistLabel ? label : ''"
        :isExistLabel="isExistLabel"
      >
          <div class="calc__range-label-text" v-if="isExistLabel">
            {{ label }}
            <div class="empty-block" v-if="notEmpty">*</div>
            <slot name="prompt"></slot>
          </div>
      </icon-element-wrapper>
      <div class="calc__range-item-wrapper">
        <div class="calc__range-item-left-side">
          <input
            ref="thisElement"
            class="calc__range-item"
            :class="{ isError: isClassError }"
            type="range"
            :min="localMin"
            :max="localMax"
            :step="localStep"
            :value="resultValue"
            @input="tryChangeValue"
            :name="localElementName"
          />
          <div v-if="isShowStepLine" class="calc__range-steps-wrapper">
            <div
              class="calc__range-steps-item"
              @click="changeValueStep(step)"
              v-for="(step, inx) in returnSteps"
              :style="{ left: pointsForStepsLine[inx] + 'px' }"
              :key="inx"
              :class="{
                'calc__range-steps-item_selected': step === resultValue,
              }"
            >
              <div class="calc__range-steps-item-value">{{ step }}</div>
            </div>
          </div>
          <div
            v-if="isStaticValue"
            :style="{ left: positionStaticResultValue }"
            class="calc__range-current-static"
          >
            {{ resultValue }}
          </div>
        </div>
        <div
          class="calc__range-current-wrapper"
          v-if="(showDynamicValue || unit?.length)"
        >
          <input
            class="calc__range-current-dynamic"
            :class="{ isError: isClassError }"
            v-if="showDynamicValue"
            type="text"
            v-model="dynamicValue"
            @keydown.up="plus"
            @keydown.down="minus"
          />
          <div class="calc__range-unit" v-if="unit?.length">
            {{ unit }}
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
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="isVisibilityFromDependency ? resultValue : null"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import iconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import {MixinCurrentWidthElement} from "@/mixins/MixinCurrentWidthElement";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import {propsTemplate} from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "UiRange",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData, MixinCurrentWidthElement],
  components: { UiTooltip, devBlock, iconElementWrapper },
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
    ...propsTemplate.getProps([
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "formOutputMethod",
      "resultOutputMethod",
      "parentName",
      "isNeedChoice",
      "isColumn",
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
      "positionElement",
      "zeroValueDisplayIgnore",
      "iconSettings"
    ]),
  },
  created() {
    this.tryToggleElementIsMounted(this.elementName, false);
  },
  mounted() {
    if (!this.isNeedChoice) {
      this.initBaseData();
    } else {
      this.changeValue("mounted");
    }

    this.updateWidthElement();

    window.addEventListener("resize", () => {
      this.updateWidthElement();
    });
    document.addEventListener("DOMContentLoaded", () => {
      this.updateWidthElement();
    });

    let timer = setInterval(() => {
      if (this.$refs?.thisElement?.offsetWidth || this.elementWidth) {
        this.updateWidthElement();
        clearInterval(timer);
      }
    }, 500);

    setTimeout(() => {
      this.tryToggleElementIsMounted(this.elementName, true);
    }, 200);
  },
  data() {
    return {
      elementWidth: 0,
      resultValue: null,
      dynamicValue: null,
      textErrorNotEmpty: "Обязательное поле.",
      updateValueTimer: null,
      canBeShownTooltip: false,
      timerNameForLocalValue: null,
    };
  },
  methods: {
    initBaseData(eventType = "mounted") {
      let timer = setInterval(() => {
        if (this.checkedValueOnVoid(this.rangeValue)) {
          this.resultValue = parseFloat(this.rangeValue);
          this.dynamicValue = parseFloat(this.rangeValue);
          this.changeValue(eventType);
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    },
    changeValueStep(step) {
      this.resultValue = this.checkValidValueReturnNumber(step);
      this.changeValue("changeValueStep");
    },
    tryChangeValue(e) {
      clearTimeout(this.timerNameForLocalValue);
      this.resultValue = this.checkValidValueReturnNumber(e.target.value);
      this.timerNameForLocalValue = setTimeout(() => {
        this.changeValue();
      }, 500);
    },
    changeDynamicValue() {
      this.resultValue = this.dynamicValue;
      clearTimeout(this.timerNameForLocalValue);
      this.timerNameForLocalValue = setTimeout(() => {
        this.changeValue("changeDynamicValue");
      }, 500);
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
      this.updateWidthElement();
      this.$emit("changedValue", {
        value: this.isVisibilityFromDependency ? this.resultValue : null,
        displayValue: this.isVisibilityFromDependency ? this.resultValue : null,
        name: this.localElementName,
        type: "range",
        cost: this.localCost,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        resultOutputMethod:
          this.resultOutputMethod !== "no" ? this.resultOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        unit: this.unit,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
        position: this.positionElement,
        zeroValueDisplayIgnore: this.zeroValueDisplayIgnore,
      });
      this.tryPassDependency();
      this.changeValid(eventType);
      if (eventType !== "mounted") {
        this.shownTooltip();
      }
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
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.isVisibilityFromDependency ? this.resultValue : null,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.isVisibilityFromDependency ? this.resultValue : null,
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
      this.dynamicValue = this.checkValidValueReturnNumber(
        this.dynamicValue + this.localStep
      );
    },
    minus() {
      this.dynamicValue = this.checkValidValueReturnNumber(
        this.dynamicValue - this.localStep
      );
    },
    updateWidthElement() {
      if (
        this.elementWidth !== this.$refs?.thisElement?.offsetWidth
      ) {
        this.elementWidth = this.$refs?.thisElement?.offsetWidth;
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
        this.resultValue = parseFloat(newValue);
      }, 1500);
    },

    isVisibilityFromDependency: {
      handler(newValue, oldValue) {
        if (newValue) {
          setTimeout(() => {
            this.elementWidth = this.$refs.thisElement.offsetWidth;
          }, 500);
        }
        this.changeValue("dependency");
      }
    },
    dynamicValue(newValue) {
      this.dynamicValue = this.checkValidValueReturnNumber(newValue);
      if (this.resultValue !== this.dynamicValue) {
        this.changeDynamicValue();
      }
    },
    resultValue(newValue) {
      if (newValue !== this.dynamicValue) {
        this.dynamicValue = newValue;
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "isCanShowAllTooltips",
      "tryToggleElementIsMounted",
    ]),
    isExistLabel() {
      return Boolean(this.label?.length);
    },
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
    isClassError() {
      return (
        (this.localCanBeShownTooltip || this.isCanShowAllTooltips) &&
        this.isErrorEmpty
      );
    },

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.isVisibilityFromDependency) {
        return null;
      }

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
      const width = this.elementWidth - 25;

      let newPosition =
        (this.resultValue - this.localMin) / (this.localMax - this.localMin);

      if (newPosition < 0) {
        newPosition = 0;
      } else if (newPosition > 1) {
        newPosition = width;
      } else {
        newPosition = width * newPosition;
      }
      return newPosition.toFixed(4) + "px";
    },
    amountSteps() {
      return (this.localMax - this.localMin) / this.localStepPrompt;
    },
    pointsForStepsLine() {
      const rightShiftElementWidth = 21;
      const firstPointPosition = 12;
      let points = [];
      const width = this.elementWidth - rightShiftElementWidth;

      points.push(firstPointPosition);
      let i = 1;
      for (i; i <= this.amountSteps; i++) {
        const percent =
          (this.localStepPrompt * i) / (this.localMax - this.localMin);
        let position = 0;
        if (this.returnSteps[i].toString().length === 1) {
          position = width * percent + 11;
        } else {
          position = width * percent + 10;
        }

        points.push(position.toFixed(4));
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
    isShowStepLine() {
      return this.showSteps && this.elementWidth > 220;
    }
  },
};
</script>
