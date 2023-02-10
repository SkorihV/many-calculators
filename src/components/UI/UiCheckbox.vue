<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    ref="parent"
  >
    <div
      class="calc__checkbox-wrapper"
      @click="inputLocalValue"
      :class="classes"
    >
      <div
        v-if="label"
        class="calc__checkbox-label"
        :class="{
          'is-button': isButton,
          checked: isChecked || localValue,
          disabled: isChecked,
          error: isErrorClass,
        }"
      >
        {{ label }}
        <div class="empty-block" v-if="isNeedChoice">*</div>
        <slot name="prompt"></slot>
      </div>
      <div
        class="calc__checkbox-element"
        v-if="isBase"
        :class="[
          checkboxType,
          {
            checked: isChecked || localValue,
            disabled: isChecked,
            error: isErrorClass,
          },
        ]"
      ></div>
      <div
        class="calc__checkbox-element_switcher"
        v-if="isSwitcher || isSwitcherVertical"
        :class="{
          checked: isChecked || localValue,
          disabled: isChecked,
          vertical: isSwitcherVertical,
          error: isErrorClass,
        }"
      ></div>
      <div v-if="labelSecond.length" class="calc__checkbox-label_second">
        {{ labelSecond }}
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
      />
    </div>
  </div>
  <div v-if="devModeData" v-html="devModeData"></div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

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
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
    ]),
  },
  created() {
    this.tryToggleElementIsMounted(this.elementName, false);
  },
  mounted() {
    this.localValue = Boolean(this.checkboxValue);
    if (this.isChecked) {
      this.localValue = true;
    }
    this.changeValue("mounted");

    setTimeout(() => {
      this.tryToggleElementIsMounted(this.elementName, true);
    }, 200)
  },
  data() {
    return {
      localValue: false,
      textErrorNotEmpty: "Обязательное поле.",
      canBeShownTooltip: false,
    };
  },
  methods: {
    inputLocalValue() {
      if (!this.isChecked) {
        this.localValue = !this.localValue;
      }
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
        cost: this.localCost,
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
        error: this.isVisibilityFromDependency
          ? this.isErrorEmpty
          : this.isVisibilityFromDependency,
        name: this.localElementName,
        type: "checkbox",
        label: this.label,
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
      if (eventType !== 'mounted') {
        this.canBeShownTooltip = true;
      }
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
      "checkValidationDataAndToggle",
      "isCanShowAllTooltips",
      "tryToggleElementIsMounted"
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
     * @returns {boolean}
     */
    isButton() {
      return this.checkboxType === "button";
    },

    isSwitcher() {
      return this.checkboxType === "switcher";
    },
    isBase() {
      return this.checkboxType === "base";
    },
    isSwitcherVertical() {
      return this.checkboxType === "switcher-vertical";
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
    isErrorClass() {
      return (
        this.isErrorEmpty &&
        this.isVisibilityFromDependency &&
        this.isCanShowAllTooltips
      );
    },
    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    localCost() {
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
        return this.localValue && this.checkedValueOnVoid(this.cost) ? parseFloat(this.cost ): !this.localValue && this.checkedValueOnVoid(this.cost) ? 0 : null;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return this.localValue && this.checkedValueOnVoid(this.cost) ? parseFloat(this.cost ): !this.localValue && this.checkedValueOnVoid(this.cost) ? 0 : null;
    },
  },
};
</script>
