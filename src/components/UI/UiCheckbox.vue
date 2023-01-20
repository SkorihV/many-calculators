<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    ref="parent"
  >
    <div class="calc__checkbox-wrapper" :class="classes">
      <label :for="localElementName" class="calc__checkbox-label">
        <input
          ref="checkbox"
          class="calc__checkbox-item"
          type="checkbox"
          :checked="isChecked || localValue"
          :disabled="isChecked"
          @click="inputLocalValue($event.target.checked)"
          :name="label"
          :id="localElementName"
        />
        <div
          v-if="label"
          class="calc__checkbox-text"
          :class="{ button: checkboxType === 'button' }"
        >
          {{ label }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt"></slot>
        </div>
        <div class="calc__checkbox-element" :class="checkboxType"></div>
        <div v-if="labelSecond.length" class="calc__checkbox-text_second">
          {{ labelSecond }}
        </div>
      </label>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency"
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

export default {
  name: "UiCheckbox",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip },
  props: {
    labelSecond: {
      type: String,
      default: "",
    },
    /**
     *  Начальное значение
     */
    checkboxValue: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     *  альтернативный способ смены вида чекбокас - текстом
     *  default - base
     *  switcher - горизонтальный переключатель
     *  switcher-vertical - вертикальный переключатель
     *  button - кнопка
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },
    ...UsePropsTemplates([
      "formOutputMethod",
      "isChecked",
      "isNeedChoice",
      "dependencyPrices",
      "cost",
      "dependencyFormulaDisplay",
      "parentIsShow",
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
    ]),
  },
  mounted() {
    this.localValue = Boolean(this.checkboxValue);
    if (this.isChecked) {
      this.localValue = true;
    }
    this.changeValue("mounted");
  },
  data() {
    return {
      localValue: null,
      textErrorNotEmpty: "Обязательное поле.",
    };
  },
  methods: {
    inputLocalValue(value) {
      this.localValue = value;
      this.changeValue("click");
    },
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.localValue,
        displayValue: this.localValue ? "Да" : "Нет",
        name: this.localElementName,
        type: "checkbox",
        label: this.label?.length ? this.label : this.labelSecond,
        cost:
          this.localValue && this.checkedValueOnVoid(this.localCost)
            ? this.localCost
            : 0,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
      });
      this.tryPassDependency();
      this.changeValid(eventType);
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: this.isVisibilityFromDependency ? this.isErrorEmpty : this.isVisibilityFromDependency,
        name: this.localElementName,
        type: "checkbox",
        label: this.label,
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.localValue,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.localValue ? "Да" : "Нет",
        type: "checkbox",
      });
    },
  },
  watch: {
    checkboxValue(newValue) {
      this.localValue = Boolean(newValue);
      this.changeValid("checkbox");
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle"
    ]),
    /**
     *
     * @returns {*|string}
     */
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    /**
     *
     * @returns {string|string}
     */
    checkboxType() {
      return this.typeDisplayClass ? this.typeDisplayClass : "base";
    },
    /**
     *
     * @returns {boolean}
     */
    isErrorEmpty() {
      return this.isNeedChoice && !this.localValue;
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
