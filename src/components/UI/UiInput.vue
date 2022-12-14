<template>
  <div class="calc__wrapper-group-data" v-if="isVisibilityFromDependency">
    <div
      class="calc__input-wrapper"
      :class="[{ 'is-stretch': isStretch }, classes]"
    >
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
  <div v-if="devMode && showInsideElementStatus" v-html="devModeData"></div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "UiInput",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip },
  props: {
    /**
     * ???????????? ?????? ????????????
     */
    inputValue: {
      type: [Number, String],
      default: null,
    },
    inputPlaceholder: {
      type: String,
    },
    /**
     * ?????????????? ??????????????????
     */
    unit: {
      type: String,
    },
    cost: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     * ???????????? ?????? ?? ?????????????????????????? / ??????????????????
     */
    dependencyPrices: {
      type: Array,
      default: () => [],
    },
    /**
     * ?????????????????????? ???????????????? ?? ????????????
     */
    min: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     * ???????????????????????? ???????????????? ?? ????????????
     */
    max: {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     * ???????????????????? ???????????????? ????????????????????
     */
    controls: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * ?????? ?????? ?????????????? ???? + / -
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
     * ???????????????????? ?????????????????? ?? ?????????? ?? ??????????????
     */
    isColumn: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * ???????????? ??????????
     */
    onlyNumber: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * ?????????????????? ?????????? ??????????????????
     */
    isCurrency: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * ???????????? ?????????? ??????????
     */
    onlyInteger: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     *     ???????????? rex ?????? ???????????? ??????????????????
     */
    customErrorPattern: {
      type: [RegExp, String],
      default: null,
    },

    /**
     *     ?????????? ?????? ???????????? ?????????????????? ?? ????????????
     */
    customErrorText: {
      type: String,
    },
    /**
     *     ?????????????????????? ?????????????? ???? ????????????
     */
    isStretch: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     * ?????????? ???????????? ???????????? ?? ???????????????????????????? ??????????
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
  },
  mounted() {
    if (!this.valueIsNaN && this.localMin > this.inputValue) {
      this.localInputValue = this.min;
      this.changeValue("mounted");
    } else {
      this.localInputValue = this.inputValue;
      this.changeValue("mounted");
    }

    if (this.isCurrency && this.onlyNumber) {
      window.addEventListener("click", (e) => {
        if (
          !this.$el.contains(e.target) &&
          !e.target.classList.contains("calc__input-item")
        ) {
          this.fakeValueHidden = true;
        }
      });
    }
  },
  data() {
    return {
      localInputValue: null,
      nameTimer: null,
      nameTimerForUpdateInputValue: null,
      fakeValueHidden: this.isCurrency && this.onlyNumber,
      isInvalid: false,
      canBeShownTooltip: false,
    };
  },
  methods: {
    ...mapActions(["tryAddDependencyElement", "checkValidationDataAndToggle"]),
    resultWitchNumberValid() {
      try {
        this.clearTimer(this.nameTimer);

        if (
          this.localInputValue?.toString().slice(-1) === "." ||
          this.localInputValue?.toString().slice(0) === "-"
        ) {
          return this.localInputValue;
        }

        if (this.isErrorNumber || (this.onlyNumber && this.isErrorEmpty)) {
          this.resetNumberValue();
          return null;
        }

        if (this.isErrorMin) {
          this.resetNumberValue();
        }

        if (this.isErrorMax) {
          this.changeValueWitchTimer(this.localMax);
        }

        if (this.discreteStep) {
          this.clearTimer(this.nameTimerForUpdateInputValue);
          this.nameTimerForUpdateInputValue = setTimeout(() => {
            this.localInputValue =
              Math.round(parseFloat(this.localInputValue) / this.step) *
              this.step;
          }, 1500);
        } else {
          this.localInputValue = parseFloat(this.localInputValue);
        }

        if (this.valueIsNaN) {
          this.localInputValue = "";
        }

        if (this.onlyInteger) {
          this.localInputValue = !this.valueIsNaN
            ? parseInt(this.localInputValue)
            : null;
        }

        return this.localInputValue;
      } catch (e) {
        if (this.devMode) {
          console.error(e.message);
        }
      }
    },
    tryChangeValueInput(e) {
      this.localInputValue = e.target.value;
      this.changeValue();
      this.shownTooltip();
    },
    changeValue(eventType = "input") {
      this.$emit("changedValue", {
        value: this.resultValue,
        displayValue: this.resultValue,
        name: this.localElementName,
        type: "input",
        cost: this.localCost,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        isShow: this.isVisibilityFromDependency,
        excludeFromCalculations: this.excludeFromCalculations,
        unit: this.unit,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
      });
      this.tryPassDependency();
      if (eventType !== "delete" || eventType !== "mounted") {
        this.changeValid(eventType);
      }
    },
    /**
     * ???????????????????? ?????????? ?????????????????? ???? ???????????????????? ????????????
     */
    changeValid(eventType) {
      this.$nextTick(() => {
        this.isInvalid = [
          this.isErrorMin,
          this.isErrorMax,
          this.isErrorEmpty,
          this.isErrorNumber,
          this.isErrorCustom,
        ].some((item) => item);

        this.checkValidationDataAndToggle({
          error: this.isInvalid,
          name: this.localElementName,
          type: "input",
          label: this.label,
          eventType,
          isShow: this.isVisibilityFromDependency,
          parentName: this.parentName,
        });
      });
      this.shownTooltip();
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.resultValue,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.resultValue,
        type: "input",
      });
    },
    changeValueWitchTimer(value) {
      this.nameTimer = setTimeout(() => {
        this.localInputValue = value;
        this.changeValue("timer");
        this.shownTooltip();
      }, 1000);
    },
    clearTimer(name) {
      if (name) clearTimeout(name);
    },
    /**
     * ?????? ???????????????????? ?????????????????? ?????????? ???????????????????? ?????????? ?? ?????????????????? ?????????????????? ?????? ????????????
     */
    showTrueValue() {
      if (this.isCurrency) {
        this.fakeValueHidden = false;
        this.$nextTick(() => {
          this.$refs.trueInput.focus();
        });
      }
    },
    trueTrueValue() {
      if (this.isCurrency) {
        this.fakeValueHidden = true;
      }
    },
    plus() {
      if (this.valueIsNaN) {
        this.resetNumberValue();
      }

      let value = parseFloat(this.localInputValue) + this.localStep;

      if (this.checkedValueOnVoid(this.localMax)) {
        value = value <= this.localMax ? value : this.localMax;
      }
      this.localInputValue = value;
      this.changeValue("plus");
      this.shownTooltip();
    },
    minus() {
      if (this.valueIsNaN) {
        this.resetNumberValue();
      }

      let value = parseFloat(this.localInputValue) - this.localStep;
      if (this.checkedValueOnVoid(this.localMin)) {
        value = value >= this.localMin ? value : this.localMin;
      }
      this.localInputValue = value;
      this.changeValue("minus");
      this.shownTooltip();
    },
    shownTooltip() {
      if (!this.canBeShownTooltip) {
        this.canBeShownTooltip = true;
      }
    },
    resetNumberValue() {
      this.changeValueWitchTimer(this.localMin || 0);
    },
    updatedCostForOut(cost) {
      return this.onlyNumber &&this.checkedValueOnVoid(cost)
        ? cost * this.localInputValue
        : null;
    },
  },
  computed: {
    ...mapGetters(["devMode", "showInsideElementStatus", "devMode"]),
    localMax() {
      return this.checkedValueOnVoid(this.max) ? Number(this.max) : null;
    },
    localMin() {
      return this.checkedValueOnVoid(this.min) ? Number(this.min) : null;
    },
    localStep() {
      return this.checkedValueOnVoid(this.step) ? Number(this.step) : 1;
    },
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    resultValue() {
      if (this.onlyNumber) {
        return this.resultWitchNumberValid();
      } else {
        return this.localInputValue;
      }
    },
    resultValueDouble() {
      return this.localInputValue?.toString().length
        ? parseFloat(this.localInputValue).toLocaleString("ru")
        : "";
    },
    valueIsNaN() {
      return isNaN(parseFloat(this.localInputValue));
    },
    isErrorNumber() {
      return (
        (this.onlyNumber || this.localMax !== null || this.localMin !== null) &&
        this.valueIsNaN &&
        this.localInputValue?.toString()?.length
      );
    },
    errorNumberText() {
      return this.isErrorNumber ? "???????????? ??????????!" : null;
    },
    isErrorEmpty() {
      return this.notEmpty && !this.localInputValue?.toString().length;
    },
    errorEmptyText() {
      return this.isErrorEmpty ? "?????????????????? ????????!" : null;
    },
    isErrorMax() {
      return (
        !this.valueIsNaN &&
        this.localMax !== null &&
        parseFloat(this.localInputValue) > parseFloat(this.localMax)
      );
    },
    errorMaxText() {
      return this.localMax !== null &&
        !this.valueIsNaN &&
        parseFloat(this.localInputValue) > parseFloat(this.localMax)
        ? `???????????????????????? ???????????????? ${this.localMax}`
        : null;
    },

    isErrorMin() {
      return (
        !this.valueIsNaN &&
        this.localMin !== null &&
        parseFloat(this.localInputValue) < parseFloat(this.localMin)
      );
    },
    errorMinText() {
      return this.localMin !== null &&
        !this.valueIsNaN &&
        parseFloat(this.localInputValue) < parseFloat(this.localMin)
        ? `?????????????????????? ???????????????? ${this.localMin}`
        : null;
    },
    isErrorCustom() {
      return this.customErrorPattern
        ? this.localInputValue?.toString().search(this.customErrorPattern) < 0
        : false;
    },
    customErrorTextOut() {
      return this.isErrorCustom ? this.customErrorText : "";
    },
    tooltipError() {
      if (this.isErrorNumber) {
        return { error: this.isErrorNumber, errorText: this.errorNumberText };
      } else if (this.isErrorMax) {
        return { error: this.isErrorMax, errorText: this.errorMaxText };
      } else if (this.isErrorMin) {
        return { error: this.isErrorMin, errorText: this.errorMinText };
      } else if (this.isErrorCustom) {
        return {
          error: this.isErrorCustom,
          errorText: this.customErrorTextOut,
        };
      } else if (this.isErrorEmpty) {
        return { error: this.isErrorEmpty, errorText: this.errorEmptyText };
      } else {
        return false;
      }
    },
    localCanBeShownTooltip() {
      return this.canBeShownTooltip && this.isVisibilityFromDependency;
    },

    /**
     * ???????????????????? ???????? ???????????????????? ??????????????, ???????? ???????? ????????????????????????
     * ???????? ???? ???????? ???????? ???? ????????????????, ???? ???????????????????????? ??????????????????????
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
  },
};
</script>

<style scoped></style>
