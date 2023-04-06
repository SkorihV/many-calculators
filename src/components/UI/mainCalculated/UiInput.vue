<template>
    <div
      class="calc__wrapper-group-data"
      v-if="isVisibilityFromDependency"
      :id="elementName"
      ref="parent"
    >
      <div
        class="calc__input-wrapper"
        :class="[classes, { column: isColumn || isMakeElementColumn }]"
      >
        <icon-element-wrapper
          :icon-settings="iconSettings"
          :alt="isExistLabel ? label : ''"
          :isExistLabel="isExistLabel"
        >
          <div class="calc__input-label-text" v-if="isExistLabel">
            {{ label }}
            <div class="empty-block" v-if="notEmpty">*</div>
            <slot name="prompt" />
          </div>
        </icon-element-wrapper>
        <div class="calc__input-wrapper-data" :class="{ stretch: isStretch }">
          <div
            class="calc__input-buttons-minus"
            :class="{ disabled: isDisabledMin }"
            v-if="showControlsButton"
            @click="minus"
          >
            -
          </div>
          <input
            ref="trueInput"
            type="text"
            v-model="localInputBufferValue"
            :placeholder="inputPlaceholder"
            @keydown.enter="trueTrueValue"
            @keydown.up="plus"
            @keydown.down="minus"
            @blur="inputFocus = false"
            @focus="inputFocus = true"
            class="calc__input-item"
            :class="{
            number: isOnlyNumber,
            error: isErrorClass,
            stretch: isStretch,
          }"
            autocomplete="off"
            v-if="!fakeValueHidden"
          />
          <template v-if="fakeValueHidden">
            <input
              @click="showTrueValue"
              @blur="inputFocus = false"
              @focus="inputFocus = true"
              type="text"
              :value="resultValueDouble"
              class="calc__input-item currency"
              :class="{
              number: isOnlyNumber,
              error: isErrorClass,
              stretch: isStretch,
            }"
              autocomplete="off"
              :placeholder="inputPlaceholder"
            />
          </template>
          <div
            class="calc__input-buttons-plus"
            :class="{ disabled: isDisabledMax }"
            v-if="showControlsButton"
            @click="plus"
          >
            +
          </div>
          <div v-if="unit?.length" class="calc__input-unit">{{ unit }}</div>
        </div>
        <ui-tooltip
          :is-show="Boolean(tooltipError?.error)"
          :tooltip-text="tooltipError?.errorText"
          :local-can-be-shown="localCanBeShownTooltip"
        />
      </div>
    </div>
    <dev-block
      :label="label"
      :element-name="localElementName"
      :value="resultValue"
      :local-cost="localCost"
      :is-visibility-from-dependency="isVisibilityFromDependency"
      :dependency-formula-display="dependencyFormulaDisplay"
      :parsing-formula-variables="formulaAfterProcessingVariables"
    />
</template>

<script>
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { MixinCurrentWidthElement } from "@/mixins/MixinCurrentWidthElement";
import { MixinDisplaySpinner } from "@/mixins/MixinDisplaySpinner";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "UiInput",
  emits: ["changedValue"],
  mixins: [
    MixinsForProcessingFormula,
    MixinsGeneralItemData,
    MixinCurrentWidthElement,
    MixinDisplaySpinner,
  ],
  components: { UiTooltip, devBlock, IconElementWrapper },
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
     * единицы измерения
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
     * Список цен с зависимостями / условиями
     */
    dependencyPrices: {
      type: Array,
      default: () => [],
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
    /**
     * Включить кратность шага для поля ввода
     */
    discreteStep: {
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
     * Тип данных разрешенный вводить в поле
     * mixed
     * onlyNumber
     * onlyInteger
     */
    dataType: {
      type: String,
      default: "mixed",
    },
    ...propsTemplate.getProps([
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
      "isStretch",
      "formOutputMethod",
      "resultOutputMethod",
      "dependencyFormulaDisplay",
      "parentIsShow",
      "positionElement",
      "zeroValueDisplayIgnore",
      "iconSettings",
    ]),
  },
  mounted() {
    if (this.isOnlyNumber && this.localMin > Number(this.inputValue)) {
      this.localInputValue = this.localMin;
      this.changeValue("mounted");
    } else if (this.isOnlyNumber && this.localMax < Number(this.inputValue)) {
      this.localInputValue = this.localMax;
      this.changeValue("mounted");
    } else if (this.isOnlyNumber) {
      this.localInputValue = this.inputValue;
      this.changeValue("mounted");
    } else {
      this.changeValue("mounted");
    }

    if (this.isCurrency && this.isOnlyNumber) {
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
      inputFocus: false,
      focusTimerName: null,
      localInputBufferValue: null,
      localInputValue: null,
      nameTimer: null,
      fakeValueHidden: Boolean(this.isCurrency && this.isOnlyNumber),
      isInvalid: false,
      canBeShownTooltip: false,
    };
  },
  methods: {
    resultWitchNumberValid() {
      try {
        this.clearTimer(this.nameTimer);

        this.localInputValue = parseFloat(this.localInputValue);

        if (
          this.localInputValue?.toString().slice(-1) === "." ||
          this.localInputValue?.toString().slice(0) === "-"
        ) {
          return this.localInputValue;
        }

        if (this.isErrorNumber || this.isErrorEmpty) {
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
          this.localInputValue =
            Math.round(parseFloat(this.localInputValue) / this.step) *
            this.step;
        } else {
          this.localInputValue = parseFloat(this.localInputValue);
        }

        if (this.valueIsNaN) {
          this.localInputValue = "";
        }

        if (this.onlyIntegerValue) {
          this.localInputValue = !this.valueIsNaN
            ? parseInt(this.localInputValue)
            : null;
        }

        this.localInputValue = this.updateValueAfterSignComma(
          this.localInputValue
        );

        if (!this.inputFocus) {
          this.localInputBufferValue = this.localInputValue;
        }

        return this.localInputValue;
      } catch (e) {
        if (this.devMode) {
          console.error(e.message);
        }
      }
    },
    changeValue(eventType = "input") {
      this.$emit("changedValue", {
        value: this.resultValue?.toString()?.length ? this.resultValue : null,
        displayValue: this.resultValue?.toString()?.length
          ? this.resultValue
          : null,
        name: this.localElementName,
        type: "input",
        cost: this.localCost,
        label: this.label,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        resultOutputMethod:
          this.resultOutputMethod !== "no" ? this.resultOutputMethod : null,
        isShow: this.isVisibilityFromDependency,
        excludeFromCalculations: this.excludeFromCalculations,
        unit: this.unit,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
        position: this.positionElement,
        zeroValueDisplayIgnore: this.zeroValueDisplayIgnore,
      });
      this.tryPassDependency();
      if (eventType !== "delete" || eventType !== "mounted") {
        this.changeValid(eventType);
      }
    },
    /**
     * возвращает общее состояние не валидности инпута
     */
    changeValid(eventType) {
      this.$nextTick(() => {
        this.isInvalid = [
          this.isErrorMin,
          this.isErrorMax,
          this.isErrorEmpty,
          this.isErrorNumber,
        ].some((item) => item);

        this.checkValidationDataAndToggle({
          error: this.isVisibilityFromDependency
            ? this.isInvalid
            : this.isVisibilityFromDependency,
          name: this.localElementName,
          type: "input",
          label: this.label,
          eventType,
          isShow: this.isVisibilityFromDependency,
          parentName: this.parentName,
        });
      });
      if (eventType !== "mounted") {
        this.shownTooltip();
      }
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.resultValue?.toString()?.length ? this.resultValue : null,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.resultValue?.toString()?.length
          ? this.resultValue
          : null,
        type: "input",
      });
    },
    changeValueWitchTimer(value) {
      this.nameTimer = setTimeout(() => {
        this.localInputValue = value;
        this.changeValue("timer");
        this.shownTooltip();
      }, 2000);
    },
    clearTimer(name) {
      if (name) clearTimeout(name);
    },
    /**
     * при включенной обработки сотых отображает инпут с настоящим значением при фокусе
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
      if (!this.isOnlyNumber) {
        return false;
      }
      if (this.valueIsNaN) {
        this.resetNumberValue();
      }

      let value = parseFloat(this.localInputValue) + this.localStep;

      if (this.checkedValueOnVoid(this.localMax)) {
        value = value <= this.localMax ? value : this.localMax;
      }
      value = this.updateValueAfterSignComma(value);
      this.localInputValue = value;
      this.localInputBufferValue = value;
    },
    minus() {
      if (!this.isOnlyNumber) {
        return false;
      }
      if (this.valueIsNaN) {
        this.resetNumberValue();
      }

      let value = parseFloat(this.localInputValue) - this.localStep;
      if (this.checkedValueOnVoid(this.localMin)) {
        value = value >= this.localMin ? value : this.localMin;
      }
      value = this.updateValueAfterSignComma(value);
      this.localInputValue = value;
      this.localInputBufferValue = value;
    },
    updateValueAfterSignComma(value) {
      return this.needFixedResult
        ? parseFloat(value.toFixed(this.numberSignsAfterComma))
        : value;
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
      return this.isOnlyNumber && this.checkedValueOnVoid(cost)
        ? parseFloat((cost * this.localInputValue).toFixed(2))
        : null;
    },
  },
  watch: {
    isVisibilityFromDependency() {
      this.changeValue("dependency");
    },
    inputFocus: {
      handler(isFocus) {
        if (!isFocus) {
          this.changeValue();
          this.shownTooltip();
          clearTimeout(this.focusTimerName);
        }
      },
    },
    localInputBufferValue: {
      handler(newValue ) {
        this.localInputValue = newValue;
        clearTimeout(this.focusTimerName);
        this.focusTimerName = setTimeout(() => {
          if (this.inputFocus) {
            setTimeout(() => this.inputFocus = true, 1000 )
          } else {
            this.changeValue();
            this.shownTooltip();
          }
          this.inputFocus = false;
        }, 3000)
      }
    }
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "devMode",
      "isCanShowAllTooltips",
      "tryToggleElementIsMounted",
    ]),
    isExistLabel() {
      return Boolean(this.label?.toString()?.length);
    },
    isMixedValue() {
      return this.dataType === "mixed";
    },
    onlyNumberValue() {
      return this.dataType === "onlyNumber";
    },
    onlyIntegerValue() {
      return this.dataType === "onlyInteger";
    },
    localMax() {
      return this.checkedValueOnVoid(this.max) && !this.isMixedValue
        ? Number(this.max)
        : null;
    },
    localMin() {
      return this.checkedValueOnVoid(this.min) && !this.isMixedValue
        ? Number(this.min)
        : null;
    },
    localStep() {
      return this.checkedValueOnVoid(this.step) ? Number(this.step) : 1;
    },
    isOnlyNumber() {
      return this.onlyNumberValue || this.onlyIntegerValue;
    },
    showControlsButton() {
      return this.controls && this.isOnlyNumber;
    },
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    resultValue() {
      if (!this.isVisibilityFromDependency) {
        return null;
      }
      if (this.isOnlyNumber) {
        return this.resultWitchNumberValid();
      } else {
        return this.localInputValue;
      }
    },
    resultValueDouble() {
      return this.localInputBufferValue?.toString().length
        ? this.localInputBufferValue.toLocaleString("ru")
        : "";
    },
    valueIsNaN() {
      return isNaN(parseFloat(this.localInputValue));
    },

    isDisabledMin() {
      return this.resultValue === this.localMin;
    },
    isDisabledMax() {
      return this.resultValue === this.localMax;
    },
    isErrorNumber() {
      return (
        this.isOnlyNumber &&
        this.valueIsNaN &&
        this.localInputValue?.toString()?.length
      );
    },
    errorNumberText() {
      return this.isErrorNumber ? "Только числа!" : null;
    },
    isErrorEmpty() {
      return this.notEmpty && !this.localInputValue?.toString().length;
    },
    errorEmptyText() {
      return this.isErrorEmpty ? "Заполните поле!" : null;
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
        ? `Максимальное значение ${this.localMax}`
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
        ? `Минимальное значение ${this.localMin}`
        : null;
    },
    isErrorClass() {
      return this.tooltipError?.error && this.isCanShowAllTooltips;
    },
    tooltipError() {
      if (this.isErrorNumber) {
        return { error: this.isErrorNumber, errorText: this.errorNumberText };
      } else if (this.isErrorMax) {
        return { error: this.isErrorMax, errorText: this.errorMaxText };
      } else if (this.isErrorMin) {
        return { error: this.isErrorMin, errorText: this.errorMinText };
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
    needFixedResult() {
      return Boolean(
        (this.discreteStep || this.controls) && this.onlyNumberValue
      );
    },
    numberSignsAfterComma() {
      return this.step.toString().includes(".") && this.needFixedResult
        ? this.step.toString().split(".").pop().length
        : 0;
    },
  },
};
</script>
