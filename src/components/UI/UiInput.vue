<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    ref="parent"
  >
    <div class="calc__input-wrapper" :class="classes">
      <label
        :for="localElementName"
        class="calc__input-label"
        :class="{ 'is-column': isColumn }"
      >
        <div v-if="label" class="calc__input-label-text">
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt" />
        </div>
        <div class="calc__input-wrapper-data">
          <div class="calc__input-buttons-minus" v-if="controls" @click="minus">
            -
          </div>

          <input
            ref="trueInput"
            :id="localElementName"
            type="text"
            :value="resultValue"
            :placeholder="inputPlaceholder"
            @input="tryChangeValueInput"
            @keydown.enter="trueTrueValue"
            @keydown.up="plus"
            @keydown.down="minus"
            class="calc__input-item"
            autocomplete="off"
            v-if="!fakeValueHidden"
          />
          <template v-if="fakeValueHidden">
            <input
              @click="showTrueValue"
              type="text"
              :value="resultValueDouble"
              class="calc__input-item currency"
              autocomplete="off"
              :placeholder="inputPlaceholder"
            />
          </template>
          <div class="calc__input-buttons-plus" v-if="controls" @click="plus">
            +
          </div>
          <div v-if="unit?.length" class="calc__input-unit">{{ unit }}</div>
        </div>
        <ui-tooltip
          :is-show="tooltipError?.error"
          :tooltip-text="tooltipError?.errorText"
          :local-can-be-shown="localCanBeShownTooltip"
        />
      </label>
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
import {
  ref,
  toRef,
  onMounted,
  computed,
  nextTick,
  watch,
  getCurrentInstance,
} from "vue";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";

export default {
  name: "UiInput",
  emits: ["changedValue"],
  // mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip },
  props: {
    /**
     * данные для инпута
     */
    inputValue: {
      type: [Number, String],
      default: null,
    },
    inputPlaceholder: {
      type: String,
    },
    /**
     * отобразить элементы управления
     */
    controls: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * шаг при нажатии на + / -
     */
    step: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    discreteStep: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * только числа
     */
    onlyNumber: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * разделять сотни пробелами
     */
    isCurrency: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * только целые числа
     */
    onlyInteger: {
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
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
      "unit",
      "cost",
      "dependencyPrices",
      "max",
      "min",
      "isColumn",
      "formOutputMethod",
      "dependencyFormulaDisplay",
      "parentIsShow",
    ]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const { checkedValueOnVoid } = UseUtilityServices();

    const localInputValue = ref(null);
    const nameTimer = ref(null);
    const nameTimerForUpdateInputValue = ref(null);
    const fakeValueHidden = ref(props.isCurrency && props.onlyNumber);
    const canBeShownTooltip = ref(false);

    const label = toRef(props, "label");
    const dependencyPrices = Array.isArray(props.dependencyPrices) ? props.dependencyPrices : [];
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");
    const parentIsShow = toRef(props, "parentIsShow");

    const instance = getCurrentInstance();




    function clearTimer(name) {
      if (name) clearTimeout(name);
    }

    const {
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
      initProcessingDependencyPrice,
      costAfterProcessingDependencyPrice,
      parsingFormulaVariables,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyFormulaDisplay,
      dependencyPrices,
      changeValue,
      changeValid,
      label
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



    const localMax = computed(() => {
      return checkedValueOnVoid(props.max) ? Number(props.max) : null;
    });
    const localMin = computed(() => {
      return checkedValueOnVoid(props.min) ? Number(props.min) : null;
    });
    const valueIsNaN = computed(() => {
      return isNaN(parseFloat(localInputValue.value));
    });
    const isErrorNumber = computed(() => {
      return (
        (props.onlyNumber ||
          localMax.value !== null ||
          localMin.value !== null) &&
        valueIsNaN.value &&
        localInputValue.value?.toString()?.length
      );
    });
    const isErrorEmpty = computed(() => {
      return props.notEmpty && !localInputValue.value?.toString().length;
    });
    const isErrorMin = computed(() => {
      return (
        !valueIsNaN.value &&
        localMin.value !== null &&
        parseFloat(localInputValue.value) < parseFloat(localMin.value)
      );
    });
    const isErrorMax = computed(() => {
      return (
        !valueIsNaN.value &&
        localMax.value !== null &&
        parseFloat(localInputValue.value) > parseFloat(localMax.value)
      );
    });

    function resetNumberValue() {
      changeValueWitchTimer(localMin.value || 0);
    }

    function resultWitchNumberValid() {
      try {
        clearTimer(nameTimer.value);

        if (
          localInputValue.value?.toString().slice(-1) === "." ||
          localInputValue.value?.toString().slice(0) === "-"
        ) {
          return localInputValue.value;
        }

        if (isErrorNumber.value || (props.onlyNumber && isErrorEmpty.value)) {
          resetNumberValue();
          return null;
        }

        if (isErrorMin.value) {
          resetNumberValue();
        }

        if (isErrorMax.value) {
          changeValueWitchTimer(localMax.value);
        }

        if (props.discreteStep) {
          clearTimer(nameTimerForUpdateInputValue.value);
          nameTimerForUpdateInputValue.value = setTimeout(() => {
            localInputValue.value =
              Math.round(parseFloat(localInputValue.value) / props.step) *
              props.step;
          }, 1500);
        } else {
          localInputValue.value = parseFloat(localInputValue.value);
        }

        if (valueIsNaN.value) {
          localInputValue.value = "";
        }

        if (props.onlyInteger) {
          localInputValue.value = !valueIsNaN.value
            ? parseInt(localInputValue.value)
            : null;
        }

        return localInputValue.value;
      } catch (e) {
        if (store.devMode) {
          console.error(e.message);
        }
      }
    }
    function tryChangeValueInput(e) {
      localInputValue.value = e.target.value;
      changeValue();
      shownTooltip();
    }

    function updatedCostForOut(cost) {
      return props.onlyNumber && checkedValueOnVoid(cost)
        ? cost * localInputValue.value
        : null;
    }

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    const localCost = computed(() => {
      if (!initProcessingDependencyPrice.value || !dependencyPrices) {
        return updatedCostForOut(props.cost);
      }

      let newCost = costAfterProcessingDependencyPrice(dependencyPrices);
      if (newCost !== null) {
        return updatedCostForOut(newCost);
      }
      return updatedCostForOut(props.cost);
    });

    const resultValue = computed(() => {
      if (props.onlyNumber) {
        return resultWitchNumberValid();
      } else {
        return localInputValue.value;
      }
    });
    const localStep = computed(() => {
      return checkedValueOnVoid(props.step) ? Number(props.step) : 1;
    });
    const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    });

    const isInvalid = computed(() => {
      return [
        isErrorMin.value,
        isErrorMax.value,
        isErrorEmpty.value,
        isErrorNumber.value,
      ].some((item) => item);
    })
    function changeValue(eventType = "input") {



      emit("changedValue", {
        value: resultValue.value,
        displayValue: resultValue.value,
        name: localElementName.value,
        type: "input",
        cost: localCost.value,
        label: props.label,
        formOutputMethod:
          props.formOutputMethod !== "no" ? props.formOutputMethod : null,
        isShow: isVisibilityFromDependency.value,
        excludeFromCalculations: props.excludeFromCalculations,
        unit: props.unit,
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
        parentName: props.parentName,
        error: isInvalid.value
      });
      tryPassDependency();
      changeValid(eventType);
    }
    /**
     * возвращает общее состояние не валидности инпута
     */
    function changeValid(eventType) {

        store.checkValidationDataAndToggle({
          error: isInvalid.value,
          name: localElementName.value,
          type: "input",
          label: props.label,
          eventType,
          isShow: isVisibilityFromDependency.value,
          parentName: props.parentName,
        });

      shownTooltip();
    }
    function tryPassDependency() {
      store.tryAddDependencyElement({
        name: localElementName.value,
        value: resultValue.value,
        isShow: isVisibilityFromDependency.value,
        displayValue: resultValue.value,
        type: "input",
      });
    }
    function changeValueWitchTimer(value) {
      nameTimer.value = setTimeout(() => {
        localInputValue.value = value;
        changeValue("timer");
        shownTooltip();
      }, 1000);
    }

    /**
     * при включенной обработки сотых отображает инпут с настоящим значением при фокусе
     */
    function showTrueValue() {
      if (props.isCurrency) {
        fakeValueHidden.value = false;
        nextTick(() => {
          instance.refs.trueInput.focus();
        });
      }
    }
    function trueTrueValue() {
      if (props.isCurrency) {
        fakeValueHidden.value = true;
      }
    }
    function plus() {
      if (valueIsNaN.value) {
        resetNumberValue();
      }

      let value = parseFloat(localInputValue.value) + localStep.value;

      if (checkedValueOnVoid(localMax.value)) {
        value = value <= localMax.value ? value : localMax.value;
      }
      localInputValue.value = value;
      changeValue("plus");
      shownTooltip();
    }
    function minus() {
      if (valueIsNaN.value) {
        resetNumberValue();
      }

      let value = parseFloat(localInputValue.value) - localStep.value;
      if (checkedValueOnVoid(localMin.value)) {
        value = value >= localMin.value ? value : localMin.value;
      }
      localInputValue.value = value;
      changeValue("minus");
      shownTooltip();
    }
    function shownTooltip() {
      if (!canBeShownTooltip.value) {
        canBeShownTooltip.value = true;
      }
    }

    const resultValueDouble = computed(() => {
      return localInputValue.value?.toString().length
        ? parseFloat(localInputValue.value).toLocaleString("ru")
        : "";
    });

    const errorNumberText = computed(() => {
      return isErrorNumber.value ? "Только числа!" : null;
    });

    const errorEmptyText = computed(() => {
      return isErrorEmpty.value ? "Заполните поле!" : null;
    });

    const errorMaxText = computed(() => {
      return localMax.value !== null &&
        !valueIsNaN.value &&
        parseFloat(localInputValue.value) > parseFloat(localMax.value)
        ? `Максимальное значение ${localMax.value}`
        : null;
    });

    const errorMinText = computed(() => {
      return localMin.value !== null &&
        !valueIsNaN.value &&
        parseFloat(localInputValue.value) < parseFloat(localMin.value)
        ? `Минимальное значение ${localMin.value}`
        : null;
    });
    const tooltipError = computed(() => {
      if (isErrorNumber.value) {
        return { error: isErrorNumber.value, errorText: errorNumberText.value };
      } else if (isErrorMax.value) {
        return { error: isErrorMax.value, errorText: errorMaxText.value };
      } else if (isErrorMin.value) {
        return { error: isErrorMin.value, errorText: errorMinText.value };
      } else if (isErrorEmpty.value) {
        return { error: isErrorEmpty.value, errorText: errorEmptyText.value };
      } else {
        return false;
      }
    });
    const localCanBeShownTooltip = computed(() => {
      return canBeShownTooltip.value && isVisibilityFromDependency.value;
    });

    const { devModeData } = UseDevModeDataBlock({
      label,
      elementName: props.elementName,
      dependencyFormulaDisplay,
      parsingFormulaVariables,
      isVisibilityFromDependency,
      templateName: props.templateName,
      resultValue,
      localCost
    })

    onMounted(() => {
      if (!valueIsNaN.value && localMin.value > props.inputValue) {
        localInputValue.value = props.min;
        changeValue("mounted");
      } else {
        localInputValue.value = props.inputValue;
        changeValue("mounted");
      }

      if (props.isCurrency && props.onlyNumber) {
        window.addEventListener("click", (e) => {
          if (
            !instance?.refs?.parent?.contains(e.target) &&
            !e.target.classList.contains("calc__input-item")
          ) {
            fakeValueHidden.value = true;
          }
        });

        // window.addEventListener("click", (e) => {
        //   if (
        //     !this.$el.contains(e.target) &&
        //     !e.target.classList.contains("calc__input-item")
        //   ) {
        //     fakeValueHidden.value = true;
        //   }
        // });
      }
    });
    return {
      isVisibilityFromDependency,
      localElementName,
      isColumn: props.isColumn,
      resultValue,
      tryChangeValueInput,
      minus,
      plus,
      trueTrueValue,
      fakeValueHidden,
      showTrueValue,
      resultValueDouble,
      unit: props.unit,
      tooltipError,
      localCanBeShownTooltip,
      devModeData,
      label
    };
  },
  // mounted() {
  //   if (!this.valueIsNaN && this.localMin > this.inputValue) {
  //     this.localInputValue = this.min;
  //     this.changeValue("mounted");
  //   } else {
  //     this.localInputValue = this.inputValue;
  //     this.changeValue("mounted");
  //   }
  //
  //   if (this.isCurrency && this.onlyNumber) {
  //     window.addEventListener("click", (e) => {
  //       if (
  //         !this.$el.contains(e.target) &&
  //         !e.target.classList.contains("calc__input-item")
  //       ) {
  //         this.fakeValueHidden = true;
  //       }
  //     });
  //   }
  // },
  // data() {
  //   return {
  //     localInputValue: null,
  //     nameTimer: null,
  //     nameTimerForUpdateInputValue: null,
  //     fakeValueHidden: this.isCurrency && this.onlyNumber,
  //     isInvalid: false,
  //     canBeShownTooltip: false,
  //   };
  // },
  // methods: {
  //   resultWitchNumberValid() {
  //     try {
  //       this.clearTimer(this.nameTimer);
  //
  //       if (
  //         this.localInputValue?.toString().slice(-1) === "." ||
  //         this.localInputValue?.toString().slice(0) === "-"
  //       ) {
  //         return this.localInputValue;
  //       }
  //
  //       if (this.isErrorNumber || (this.onlyNumber && this.isErrorEmpty)) {
  //         this.resetNumberValue();
  //         return null;
  //       }
  //
  //       if (this.isErrorMin) {
  //         this.resetNumberValue();
  //       }
  //
  //       if (this.isErrorMax) {
  //         this.changeValueWitchTimer(this.localMax);
  //       }
  //
  //       if (this.discreteStep) {
  //         this.clearTimer(this.nameTimerForUpdateInputValue);
  //         this.nameTimerForUpdateInputValue = setTimeout(() => {
  //           this.localInputValue =
  //             Math.round(parseFloat(this.localInputValue) / this.step) *
  //             this.step;
  //         }, 1500);
  //       } else {
  //         this.localInputValue = parseFloat(this.localInputValue);
  //       }
  //
  //       if (this.valueIsNaN) {
  //         this.localInputValue = "";
  //       }
  //
  //       if (this.onlyInteger) {
  //         this.localInputValue = !this.valueIsNaN
  //           ? parseInt(this.localInputValue)
  //           : null;
  //       }
  //
  //       return this.localInputValue;
  //     } catch (e) {
  //       if (this.devMode) {
  //         console.error(e.message);
  //       }
  //     }
  //   },
  //   tryChangeValueInput(e) {
  //     this.localInputValue = e.target.value;
  //     this.changeValue();
  //     this.shownTooltip();
  //   },
  //   changeValue(eventType = "input") {
  //     this.$emit("changedValue", {
  //       value: this.resultValue,
  //       displayValue: this.resultValue,
  //       name: this.localElementName,
  //       type: "input",
  //       cost: this.localCost,
  //       label: this.label,
  //       formOutputMethod:
  //         this.formOutputMethod !== "no" ? this.formOutputMethod : null,
  //       isShow: this.isVisibilityFromDependency,
  //       excludeFromCalculations: this.excludeFromCalculations,
  //       unit: this.unit,
  //       eventType,
  //       formulaProcessingLogic: this.formulaProcessingLogic,
  //     });
  //     this.tryPassDependency();
  //     if (eventType !== "delete" || eventType !== "mounted") {
  //       this.changeValid(eventType);
  //     }
  //   },
  //   /**
  //    * возвращает общее состояние не валидности инпута
  //    */
  //   changeValid(eventType) {
  //     this.$nextTick(() => {
  //       this.isInvalid = [
  //         this.isErrorMin,
  //         this.isErrorMax,
  //         this.isErrorEmpty,
  //         this.isErrorNumber,
  //       ].some((item) => item);
  //
  //       this.checkValidationDataAndToggle({
  //         error: this.isInvalid,
  //         name: this.localElementName,
  //         type: "input",
  //         label: this.label,
  //         eventType,
  //         isShow: this.isVisibilityFromDependency,
  //         parentName: this.parentName,
  //       });
  //     });
  //     this.shownTooltip();
  //   },
  //   tryPassDependency() {
  //     this.tryAddDependencyElement({
  //       name: this.localElementName,
  //       value: this.resultValue,
  //       isShow: this.isVisibilityFromDependency,
  //       displayValue: this.resultValue,
  //       type: "input",
  //     });
  //   },
  //   changeValueWitchTimer(value) {
  //     this.nameTimer = setTimeout(() => {
  //       this.localInputValue = value;
  //       this.changeValue("timer");
  //       this.shownTooltip();
  //     }, 1000);
  //   },
  //   clearTimer(name) {
  //     if (name) clearTimeout(name);
  //   },
  //   /**
  //    * при включенной обработки сотых отображает инпут с настоящим значением при фокусе
  //    */
  //   showTrueValue() {
  //     if (this.isCurrency) {
  //       this.fakeValueHidden = false;
  //       this.$nextTick(() => {
  //         this.$refs.trueInput.focus();
  //       });
  //     }
  //   },
  //   trueTrueValue() {
  //     if (this.isCurrency) {
  //       this.fakeValueHidden = true;
  //     }
  //   },
  //   plus() {
  //     if (this.valueIsNaN) {
  //       this.resetNumberValue();
  //     }
  //
  //     let value = parseFloat(this.localInputValue) + this.localStep;
  //
  //     if (this.checkedValueOnVoid(this.localMax)) {
  //       value = value <= this.localMax ? value : this.localMax;
  //     }
  //     this.localInputValue = value;
  //     this.changeValue("plus");
  //     this.shownTooltip();
  //   },
  //   minus() {
  //     if (this.valueIsNaN) {
  //       this.resetNumberValue();
  //     }
  //
  //     let value = parseFloat(this.localInputValue) - this.localStep;
  //     if (this.checkedValueOnVoid(this.localMin)) {
  //       value = value >= this.localMin ? value : this.localMin;
  //     }
  //     this.localInputValue = value;
  //     this.changeValue("minus");
  //     this.shownTooltip();
  //   },
  //   shownTooltip() {
  //     if (!this.canBeShownTooltip) {
  //       this.canBeShownTooltip = true;
  //     }
  //   },
  //   resetNumberValue() {
  //     this.changeValueWitchTimer(this.localMin || 0);
  //   },
  //   updatedCostForOut(cost) {
  //     return this.onlyNumber && this.checkedValueOnVoid(cost)
  //       ? cost * this.localInputValue
  //       : null;
  //   },
  // },
  // computed: {
  //   ...mapState(useBaseStore, [
  //     "tryAddDependencyElement",
  //     "checkValidationDataAndToggle",
  //     "devMode",
  //     "showInsideElementStatus",
  //   ]),
  //   localMax() {
  //     return this.checkedValueOnVoid(this.max) ? Number(this.max) : null;
  //   },
  //   localMin() {
  //     return this.checkedValueOnVoid(this.min) ? Number(this.min) : null;
  //   },
  //   localStep() {
  //     return this.checkedValueOnVoid(this.step) ? Number(this.step) : 1;
  //   },
  //   localElementName() {
  //     return this.checkedValueOnVoid(this.elementName)
  //       ? this.elementName
  //       : Math.random().toString();
  //   },
  //   resultValue() {
  //     if (this.onlyNumber) {
  //       return this.resultWitchNumberValid();
  //     } else {
  //       return this.localInputValue;
  //     }
  //   },
  //   resultValueDouble() {
  //     return this.localInputValue?.toString().length
  //       ? parseFloat(this.localInputValue).toLocaleString("ru")
  //       : "";
  //   },
  //   valueIsNaN() {
  //     return isNaN(parseFloat(this.localInputValue));
  //   },
  //   isErrorNumber() {
  //     return (
  //       (this.onlyNumber || this.localMax !== null || this.localMin !== null) &&
  //       this.valueIsNaN &&
  //       this.localInputValue?.toString()?.length
  //     );
  //   },
  //   errorNumberText() {
  //     return this.isErrorNumber ? "Только числа!" : null;
  //   },
  //   isErrorEmpty() {
  //     return this.notEmpty && !this.localInputValue?.toString().length;
  //   },
  //   errorEmptyText() {
  //     return this.isErrorEmpty ? "Заполните поле!" : null;
  //   },
  //   isErrorMax() {
  //     return (
  //       !this.valueIsNaN &&
  //       this.localMax !== null &&
  //       parseFloat(this.localInputValue) > parseFloat(this.localMax)
  //     );
  //   },
  //   errorMaxText() {
  //     return this.localMax !== null &&
  //       !this.valueIsNaN &&
  //       parseFloat(this.localInputValue) > parseFloat(this.localMax)
  //       ? `Максимальное значение ${this.localMax}`
  //       : null;
  //   },
  //
  //   isErrorMin() {
  //     return (
  //       !this.valueIsNaN &&
  //       this.localMin !== null &&
  //       parseFloat(this.localInputValue) < parseFloat(this.localMin)
  //     );
  //   },
  //   errorMinText() {
  //     return this.localMin !== null &&
  //       !this.valueIsNaN &&
  //       parseFloat(this.localInputValue) < parseFloat(this.localMin)
  //       ? `Минимальное значение ${this.localMin}`
  //       : null;
  //   },
  //   tooltipError() {
  //     if (this.isErrorNumber) {
  //       return { error: this.isErrorNumber, errorText: this.errorNumberText };
  //     } else if (this.isErrorMax) {
  //       return { error: this.isErrorMax, errorText: this.errorMaxText };
  //     } else if (this.isErrorMin) {
  //       return { error: this.isErrorMin, errorText: this.errorMinText };
  //     } else if (this.isErrorEmpty) {
  //       return { error: this.isErrorEmpty, errorText: this.errorEmptyText };
  //     } else {
  //       return false;
  //     }
  //   },
  //   localCanBeShownTooltip() {
  //     return this.canBeShownTooltip && this.isVisibilityFromDependency;
  //   },
  //
  //   /**
  //    * Возвращает цену подходящую условию, если моле отображается
  //    * Если не одна цена не подходит, то возвращается стандартная
  //    * @returns {Number|String|*}
  //    */
  //   localCost() {
  //     if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
  //       return this.updatedCostForOut(this.cost);
  //     }
  //
  //     let newCost = this.costAfterProcessingDependencyPrice(
  //       this.dependencyPrices
  //     );
  //     if (newCost !== null) {
  //       return this.updatedCostForOut(newCost);
  //     }
  //     return this.updatedCostForOut(this.cost);
  //   },
  // },
};
</script>

<style scoped></style>
