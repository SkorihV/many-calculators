<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    :id="elementName"
    ref="parent"
  >
    <div
      class="calc__checkbox-wrapper"
      @click="inputLocalValue"
      :class="[classes, { 'is-column': isColumn }]"
    >
      <div v-if="label?.length" class="calc__checkbox-label">
        {{ label }}
        <div class="empty-block" v-if="isNeedChoice">*</div>
      </div>
      <div class="calc__checkbox-control-wrapper">
        <div
          class="calc__checkbox-control-button"
          v-if="isButton"
          :class="{
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          {{ currentLocalValue }}
          <slot name="prompt"></slot>
        </div>
        <div
          class="calc__checkbox-control-base"
          v-if="isBase || isSwitcher || isSwitcherVertical"
          :class="{
            switcher: isSwitcher || isSwitcherVertical,
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          <div class="calc__checkbox-control-text">
            <template v-if="isSwitcher || isSwitcherVertical">
              {{ buttonText }}
            </template>
            <template v-if="isBase">
              {{ currentLocalValue }}
            </template>
            <slot name="prompt"></slot>
          </div>
          <div
            class="calc__checkbox-control-element"
            :class="{
              base: isBase,
              switcher: isSwitcher || isSwitcherVertical,
              'switcher-vertical': isSwitcherVertical,
              checked: isLocalChecked,
              error: isErrorClass,
            }"
          ></div>
          <div
            class="calc__checkbox-control-text_checked"
            v-if="
              (isSwitcher || isSwitcherVertical) && buttonTextChecked?.length
            "
          >
            {{ buttonTextChecked }}
          </div>
        </div>
        <ui-tooltip
          :is-show="isErrorEmpty"
          :tooltip-text="textErrorNotEmpty"
          :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
        />
      </div>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="isLocalChecked"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";

import UsePropsTemplates from "@/servises/UsePropsTemplates";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export default {
  name: "UiCheckbox",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiTooltip, devBlock },
  props: {
    /**
     * Начальное значение
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
    buttonText: {
      type: String,
      require: true,
    },
    buttonTextChecked: {
      type: String,
      require: true,
    },
    scrollIntoName: {
      type: String,
      default: null,
    },
    ...UsePropsTemplates([
      "formOutputMethod",
      "resultOutputMethod",
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
      "positionElement",
      "isColumn",
      "zeroValueDisplayIgnore",
    ]),
  },
  created() {
    this.tryToggleElementIsMounted(this.elementName, false);
  },
  mounted() {
    this.isLocalChecked = this.checkboxValue || this.isChecked;
    if (this.isLocalChecked) {
      this.currentLocalValue = this.buttonTextChecked?.length
        ? this.buttonTextChecked
        : this.buttonText;
    } else {
      this.currentLocalValue = this.buttonText;
    }
    this.changeValue("mounted");

    setTimeout(() => {
      this.tryToggleElementIsMounted(this.elementName, true);
    }, 200);
  },
  data() {
    return {
      currentLocalValue: "",
      isLocalChecked: false,
      textErrorNotEmpty: "Обязательное поле.",
      canBeShownTooltip: false,
    };
  },
  methods: {
    inputLocalValue() {
      if (!this.isChecked) {
        this.isLocalChecked = !this.isLocalChecked;
      }
      this.currentLocalValue =
        this.isLocalChecked && this.buttonTextChecked?.length
          ? this.buttonTextChecked
          : this.buttonText;
      this.changeValue("click");
    },
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    changeValue(eventType = "click") {
      this.$emit("changedValue", {
        value: this.isLocalChecked,
        displayValue: this.isLocalChecked ? "Да" : "Нет",
        name: this.localElementName,
        type: "checkbox",
        label: this.label || this.buttonText,
        cost: this.localCost,
        formOutputMethod:
          this.formOutputMethod !== "no" ? this.formOutputMethod : null,
        resultOutputMethod:
          this.resultOutputMethod !== "no" ? this.resultOutputMethod : null,
        excludeFromCalculations: this.excludeFromCalculations,
        isShow: this.isVisibilityFromDependency,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
        position: this.positionElement,
        zeroValueDisplayIgnore: this.zeroValueDisplayIgnore,
      });
      this.tryPassDependency();
      this.changeValid(eventType);
      if (this.isLocalChecked && this.scrollIntoName) {
        this.goToElementScroll();
      }
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
      if (eventType !== "mounted") {
        this.canBeShownTooltip = true;
      }
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.isLocalChecked,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.currentLocalValue,
        type: "checkbox",
      });
    },
    goToElementScroll() {
      this.$nextTick(() => {
        const elementToScroll = document.querySelector(
          "#" + this.scrollIntoName
        );
        if (Boolean(elementToScroll)) {
          elementToScroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start",
          });
        }
      });
    },
  },
  watch: {
    isVisibilityFromDependency(value) {
      if (!value) {
        this.isLocalChecked = false;
      }
      this.changeValue("dependency");
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "isCanShowAllTooltips",
      "tryToggleElementIsMounted",
      "showInsideElementStatus",
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
      return this.isNeedChoice && !this.isLocalChecked;
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
      if (!this.isVisibilityFromDependency) {
        return null;
      }
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
        return this.isLocalChecked && this.checkedValueOnVoid(this.cost)
          ? parseFloat(this.cost)
          : !this.isLocalChecked && this.checkedValueOnVoid(this.cost)
          ? 0
          : null;
      }

      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return this.isLocalChecked && this.checkedValueOnVoid(this.cost)
        ? parseFloat(this.cost)
        : !this.isLocalChecked && this.checkedValueOnVoid(this.cost)
        ? 0
        : null;
    },
  },
};
</script>
