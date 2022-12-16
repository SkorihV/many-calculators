<template>
  <div
    ref="parent"
    class="calc__wrapper-group-data"
    v-if="rangeValue !== null && isVisibilityFromDependency"
  >
    <div class="calc__range-wrapper" :class="classes">
      <div v-if="label" class="calc__range-label">
        {{ label }}
        <div class="empty-block" v-if="notEmpty">*</div>
        <slot name="prompt"></slot>
        <div
          class="calc__range-current-wrapper"
          v-if="showDynamicValue || showStaticValue || unit?.length"
        >
          <div
            class="calc__range-current-static"
            v-if="showStaticValue || unit?.length"
          >
            {{ resultValue }}
          </div>
          <input
            class="calc__range-current-dynamic"
            v-if="showDynamicValue"
            type="text"
            @input="changeDynamicValue"
            :value="resultValue"
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
        :value="resultValue"
        @input="tryChangeValue"
      />
      <div v-if="showSteps" class="calc__range-steps-wrapper">
        <div
          v-for="(step, inx) in returnSteps"
          class="calc__range-steps-item"
          @click="changeValueStep(step)"
          :key="inx"
        >
          <div
            class="calc__range-steps-item-content"
            :class="{
              'calc__range-steps-item-content_selected': step === resultValue,
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
  <div v-if="devModeData.length" v-html="devModeData"></div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { ref, toRef, onMounted, watch, computed } from "vue";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";

export default {
  name: "UiRange",
  emits: ["changedValue"],
  // mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
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
  setup(props, { emit }) {
    const store = useBaseStore();
    const resultValue = ref(null);
    const textErrorNotEmpty = "Обязательное поле.";
    const updateValueTimer = ref(null);
    const canBeShownTooltip = ref(false);
    const timerNameForLocalValue = ref(null);

    const parentIsShow = toRef(props, "parentIsShow");
    const dependencyPrices = toRef(props, "dependencyPrices");
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");
    const label = toRef(props, "label");

    const { checkedValueOnVoid } = UseUtilityServices();
    const {
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
      initProcessingDependencyPrice,
      costAfterProcessingDependencyPrice,
      parsingFormulaVariables,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyPrices,
      dependencyFormulaDisplay,
      changeValue,
      changeValid,
    });
    const isVisibilityFromDependency = ref(
      isVisibilityFromDependencyLocal.value
    );
    watch(
      () => isVisibilityFromDependencyLocal.value,
      () => {
        isVisibilityFromDependency.value =
          isVisibilityFromDependencyLocal.value;
      }
    );

    const localMin = computed(() => {
      return checkedValueOnVoid(props.min) ? parseFloat(props.min) : 0;
    });
    const localMax = computed(() => {
      return checkedValueOnVoid(props.max) ? parseFloat(props.max) : 10;
    });
    function checkValidValueReturnNumber(checkedValue) {
      let value = !isNaN(parseFloat(checkedValue))
        ? parseFloat(checkedValue)
        : null;
      if (value > localMax.value) {
        value = localMax.value;
      }
      if (value < localMin.value) {
        value = localMin.value;
      }
      return value;
    }
    function shownTooltip() {
      if (!canBeShownTooltip.value) {
        canBeShownTooltip.value = true;
      }
    }
    const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    });

    function tryPassDependency() {
      store.tryAddDependencyElement({
        name: localElementName.value,
        value: resultValue.value,
        isShow: isVisibilityFromDependency.value,
        displayValue: resultValue.value,
        type: "range",
      });
    }

    const isErrorEmpty = computed(() => {
      return props.notEmpty && resultValue.value === null;
    });
    function changeValid(eventType) {
      store.checkValidationDataAndToggle({
        error: isErrorEmpty.value,
        name: localElementName.value,
        type: "range",
        label: props.label,
        eventType,
        isShow: isVisibilityFromDependency.value,
        parentName: props.parentName,
      });
      tryPassDependency();
    }
    function tryChangeValue(e) {
      clearTimeout(timerNameForLocalValue.value);
      resultValue.value = checkValidValueReturnNumber(e.target.value);
      timerNameForLocalValue.value = setTimeout(() => {
        changeValue();
        shownTooltip();
      }, 500);
    }

    function changeValueStep(step) {
      resultValue.value = checkValidValueReturnNumber(step);
      changeValue();
      shownTooltip();
    }

    function changeDynamicValue(e) {
      resultValue.value = checkValidValueReturnNumber(e.target.value);
      changeValue();
      shownTooltip();
    }

    function changeValue(eventType = "input") {
      resultValue.value = checkValidValueReturnNumber(resultValue.value);
      emit("changedValue", {
        value: resultValue.value,
        displayValue: resultValue.value,
        name: localElementName.value,
        type: "range",
        cost: localCost.value,
        label: props.label,
        formOutputMethod:
          props.formOutputMethod !== "no" ? props.formOutputMethod : null,
        excludeFromCalculations: props.excludeFromCalculations,
        isShow: isVisibilityFromDependency.value,
        unit: props.unit,
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
        error: isErrorEmpty.value,
        parentName: props.parentName,
      });
      changeValid(eventType);
    }

    function updatedCostForOut(cost) {
      return checkedValueOnVoid(cost)
        ? cost * Math.abs(resultValue.value)
        : null;
    }

    const localStepPrompt = computed(() => {
      return checkedValueOnVoid(props.stepPrompt)
        ? parseFloat(props.stepPrompt)
        : 1;
    });

    /**
     * Обработка значений поступающих извне необходим с задержкой для отображения ошибок остальных компонентов
     * @param newValue
     */
    watch(
      () => props.rangeValue,
      (newValue) => {
        clearTimeout(updateValueTimer.value);
        updateValueTimer.value = setTimeout(() => {
          resultValue.value = parseFloat(newValue);
        }, 1500);
      }
    );
    const localStep = computed(() => {
      return checkedValueOnVoid(props.step) ? parseFloat(props.step) : 1;
    });

    const returnSteps = computed(() => {
      let steps = [];

      if (isHidePromptSteps.value) {
        return steps;
      }
      for (
        let i = localMin.value;
        i <= localMax.value;
        i += localStepPrompt.value
      ) {
        steps.push(i);
      }
      return steps;
    });

    const isHidePromptSteps = computed(() => {
      return (
        !props.showSteps &&
        !localMin.value &&
        !localMax.value &&
        localStepPrompt.value < 1
      );
    });
    const localCanBeShownTooltip = computed(() => {
      return canBeShownTooltip.value && isVisibilityFromDependency.value;
    });

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    const localCost = computed(() => {
      if (!initProcessingDependencyPrice.value || !dependencyPrices.value) {
        return updatedCostForOut(props.cost);
      }

      let newCost = costAfterProcessingDependencyPrice(dependencyPrices.value);
      if (newCost !== null) {
        return updatedCostForOut(newCost);
      }
      return updatedCostForOut(props.cost);
    });

    const { devModeData } = UseDevModeDataBlock({
      label,
      elementName: props.elementName,
      dependencyFormulaDisplay,
      parsingFormulaVariables,
      isVisibilityFromDependency,
      templateName: props.templateName,
      resultValue,
    });

    onMounted(() => {
      if (!props.isNeedChoice) {
        let timer = setInterval(() => {
          if (checkedValueOnVoid(props.rangeValue)) {
            resultValue.value = parseFloat(props.rangeValue);
            changeValue("mounted");
            clearInterval(timer);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(timer);
        }, 10000);
      } else {
        changeValue("mounted");
      }
    });

    return {
      localStep,
      localCanBeShownTooltip,
      isVisibilityFromDependency,
      rangeValue: props.rangeValue,
      isErrorEmpty,
      textErrorNotEmpty,
      isCanShowAllTooltips: store.isCanShowAllTooltips,
      changeValueStep,
      classes: props.classes,
      localMin,
      localMax,
      resultValue,
      tryChangeValue,
      returnSteps,
      changeDynamicValue,
      notEmpty: props.notEmpty,
      label,
      unit: props.unit,
      devModeData,
      parsingFormulaVariables,
    };
  },

  // mounted() {
  //   if (!this.isNeedChoice) {
  //     let timer = setInterval(() => {
  //       if (this.checkedValueOnVoid(this.rangeValue)) {
  //         this.resultValue = parseFloat(this.rangeValue);
  //         this.changeValue("mounted");
  //         clearInterval(timer);
  //       }
  //     }, 100);
  //     setTimeout(() => {
  //       clearInterval(timer);
  //     }, 10000);
  //   } else {
  //     this.changeValue("mounted");
  //   }
  // },
  // data() {
  //   return {
  //     resultValue: null,
  //     textErrorNotEmpty: "Обязательное поле.",
  //     updateValueTimer: null,
  //     canBeShownTooltip: false,
  //     timerNameForLocalValue: null,
  //   };
  // },
  // methods: {
  //   changeValueStep(step) {
  //     this.resultValue = this.checkValidValueReturnNumber(step);
  //     this.changeValue();
  //     this.shownTooltip();
  //   },
  //   tryChangeValue(e) {
  //     clearTimeout(this.timerNameForLocalValue);
  //     this.resultValue = this.checkValidValueReturnNumber(e.target.value);
  //     this.timerNameForLocalValue = setTimeout(() => {
  //       this.changeValue();
  //       this.shownTooltip();
  //     }, 500);
  //   },
  //   changeDynamicValue(e) {
  //     this.resultValue = this.checkValidValueReturnNumber(e.target.value);
  //     this.changeValue();
  //     this.shownTooltip();
  //   },
  //   checkValidValueReturnNumber(checkedValue) {
  //     let value = !isNaN(parseFloat(checkedValue))
  //       ? parseFloat(checkedValue)
  //       : null;
  //     if (value > this.localMax) {
  //       value = this.localMax;
  //     }
  //     if (value < this.localMin) {
  //       value = this.localMin;
  //     }
  //     return value;
  //   },
  //   changeValue(eventType = "input") {
  //     this.resultValue = this.checkValidValueReturnNumber(this.resultValue);
  //     this.$emit("changedValue", {
  //       value: this.resultValue,
  //       displayValue: this.resultValue,
  //       name: this.localElementName,
  //       type: "range",
  //       cost: this.localCost,
  //       label: this.label,
  //       formOutputMethod:
  //         this.formOutputMethod !== "no" ? this.formOutputMethod : null,
  //       excludeFromCalculations: this.excludeFromCalculations,
  //       isShow: this.isVisibilityFromDependency,
  //       unit: this.unit,
  //       eventType,
  //       formulaProcessingLogic: this.formulaProcessingLogic,
  //     });
  //     this.changeValid(eventType);
  //   },
  //   changeValid(eventType) {
  //     this.checkValidationDataAndToggle({
  //       error: this.isErrorEmpty,
  //       name: this.localElementName,
  //       type: "range",
  //       label: this.label,
  //       eventType,
  //       isShow: this.isVisibilityFromDependency,
  //       parentName: this.parentName,
  //     });
  //     this.tryPassDependency();
  //   },
  //   tryPassDependency() {
  //     this.tryAddDependencyElement({
  //       name: this.localElementName,
  //       value: this.resultValue,
  //       isShow: this.isVisibilityFromDependency,
  //       displayValue: this.resultValue,
  //       type: "range",
  //     });
  //   },
  //   shownTooltip() {
  //     if (!this.canBeShownTooltip) {
  //       this.canBeShownTooltip = true;
  //     }
  //   },
  //   updatedCostForOut(cost) {
  //     return this.checkedValueOnVoid(cost)
  //       ? cost * Math.abs(this.resultValue)
  //       : null;
  //   },
  // },
  // watch: {
  //   /**
  //    * Обработка значений поступающих извне необходим с задержкой для отображения ошибок остальных компонентов
  //    * @param newValue
  //    */
  //   rangeValue(newValue) {
  //     clearTimeout(this.updateValueTimer);
  //     this.updateValueTimer = setTimeout(() => {
  //       this.resultValue = parseFloat(newValue);
  //     }, 1500);
  //   },
  // },
  computed: {
    // ...mapState(useBaseStore, [
    //   "tryAddDependencyElement",
    //   "checkValidationDataAndToggle",
    //   "isCanShowAllTooltips",
    //   "showInsideElementStatus",
    //   "devMode",
    // ]),
    // localMin() {
    //   return this.checkedValueOnVoid(this.min) ? parseFloat(this.min) : 0;
    // },
    // localMax() {
    //   return this.checkedValueOnVoid(this.max) ? parseFloat(this.max) : 10;
    // },
    // localStep() {
    //   return this.checkedValueOnVoid(this.step) ? parseFloat(this.step) : 1;
    // },
    // localStepPrompt() {
    //   return this.checkedValueOnVoid(this.stepPrompt)
    //     ? parseFloat(this.stepPrompt)
    //     : 1;
    // },
    // localElementName() {
    //   return this.checkedValueOnVoid(this.elementName)
    //     ? this.elementName
    //     : Math.random().toString();
    // },
    // returnSteps() {
    //   let steps = [];
    //
    //   if (this.isHidePromptSteps) {
    //     return steps;
    //   }
    //   for (
    //     let i = this.localMin;
    //     i <= this.localMax;
    //     i += this.localStepPrompt
    //   ) {
    //     steps.push(i);
    //   }
    //   return steps;
    // },
    // isErrorEmpty() {
    //   return this.notEmpty && this.resultValue === null;
    // },
    // isHidePromptSteps() {
    //   return (
    //     !this.showSteps &&
    //     !this.localMin &&
    //     !this.localMax &&
    //     this.localStepPrompt < 1
    //   );
    // },
    // localCanBeShownTooltip() {
    //   return this.canBeShownTooltip && this.isVisibilityFromDependency;
    // },
    //
    // /**
    //  * Возвращает цену подходящую условию, если моле отображается
    //  * Если не одна цена не подходит, то возвращается стандартная
    //  * @returns {Number|String|*}
    //  */
    // localCost() {
    //   if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
    //     return this.updatedCostForOut(this.cost);
    //   }
    //
    //   let newCost = this.costAfterProcessingDependencyPrice(
    //     this.dependencyPrices
    //   );
    //   if (newCost !== null) {
    //     return this.updatedCostForOut(newCost);
    //   }
    //   return this.updatedCostForOut(this.cost);
    // },
  },
};
</script>

<style scoped></style>
