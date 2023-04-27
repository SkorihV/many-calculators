<template>
  <div
    class="calc__wrapper-group-data"
    ref="parent"
    v-if="isVisibilityFromDependency && isShowElement"
    :id="elementName"
  >
    <div class="calc__system-wrapper" :class="{ 'column': isMakeElementColumn }">
      <div class="calc__system-label-wrapper" v-if="!onlyText">
        <icon-element-wrapper
          :icon-settings="iconSettingsSystemLabel"
          :alt="isExistLabel ? label : ''"
          :isExistLabel="isExistLabel"
        >
          <div class="calc__system-label-text" v-if="isExistLabel">
            {{ label }}
            <slot name="prompt" />
          </div>
        </icon-element-wrapper>
        <div class="calc__system-data-wrapper" v-if="isExistLocalCost">
          <div class="calc__system-data-value">{{ localCost }}</div>
          <div class="calc__system-data-unit" v-if="isExistUnit">
            {{ unit }}
          </div>
        </div>
      </div>
      <div class="calc__system-content" v-if="isExistCurrentHtmlText">
        <div v-html="currentHtmlText"></div>
      </div>
    </div>
  </div>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="localCost"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :formula-variables="processingVariablesInFormula"
    :formula="localCostFormula"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";
import { MixinCurrentWidthElement } from "@/mixins/MixinCurrentWidthElement";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { decimalAdjust, processingArrayOnFormulaProcessingLogic } from "@/servises/UtilityServices";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import UiPrompt from "@/components/UI/other/UiPrompt.vue";

export default {
  name: "UiSystem",
  emits: ["changedValue"],
  mixins: [
    MixinsForProcessingFormula,
    MixinsGeneralItemData,
    MixinsUtilityServices,
    MixinCurrentWidthElement,
  ],
  components: { UiPrompt, IconElementWrapper, devBlock },
  props: {
    cost: {
      type: [Number, String],
      default: null,
    },
    /**
     * no
     * show
     * onlyText
     * notValue
     */
    showElement: {
      type: String,
      default: "no",
    },
    iconSettingsSystemLabel: {
      type: Object,
      default: () => {},
    },
    roundOffType: {
      type: String,
      default: 'round'
    },
    signAfterDot: {
      type: [Number, String],
      default: -2
    },
    ...propsTemplate.getProps([
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "templateName",
      "parentIsShow",
      "dependencyPrices",
      "dependencyHtmlText",
      "label",
      "formOutputMethod",
      "resultOutputMethod",
      "dependencyFormulaDisplay",
      "positionElement",
      "zeroValueDisplayIgnore",
      "excludeFromCalculations",
      "htmlText",
      "unit",
    ]),
  },
  mounted() {
    this.changeValue("mounted");
  },
  unmounted() {
    this.tryDeleteAllDataOnStoreForElementName(this.localElementName)
  },
  methods: {
    changeValue(eventType = "system") {
      this.$emit("changedValue", {
        value: this.localCost,
        displayValue: this.localCost,
        name: this.localElementName,
        type: "system",
        cost: this.localCost,
        label: this.label,
        formOutputMethod: this.formOutputMethod,
        resultOutputMethod: this.resultOutputMethod,
        isShow: this.parentIsShow,
        excludeFromCalculations: this.excludeFromCalculations,
        unit: this.unit,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
        position: this.positionElement,
        zeroValueDisplayIgnore: this.zeroValueDisplayIgnore,
      });
      this.changeValid(eventType);
      this.tryPassDependency();
    },
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: false,
        name: this.localElementName,
        type: "system",
        label: "",
        eventType,
        isShow: this.isVisibilityFromDependency,
        parentName: this.parentName,
      });
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.localCost,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.localCost,
        type: "system",
      });
    },
  },
  watch: {
    localCost: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.changeValue();
        }
      },
      deep: true,
    },
    isVisibilityFromDependency() {
      this.changeValue("dependency");
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "devMode",
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "getResultElementOnName",
      "listGlobalsVariables",
      "tryDeleteAllDataOnStoreForElementName"
    ]),
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    /**
     * Возвращает формулу цены без данных
     * @returns {number|*|number|string|null}
     */
    localCostFormula() {
      if (!this.isVisibilityFromDependency) {
        return null;
      }
      if (!this.allowProcessingDependencyPrices) {
        return this.cost;
      }
      const { cost: formulaCost } = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices,
        "dependencyFormulaCost"
      );

      if (formulaCost !== null) {
        return formulaCost;
      }
      return this.cost;
    },
    /**
     * возвращает цену или формулу цены из собранных данных
     * @returns {number|string|null}
     */
    processingVariablesInFormula() {
      if (
        !this.isVisibilityFromDependency ||
        !this.localCostFormula?.toString()?.length
      ) {
        return null;
      }

      let cost = Number(this.localCostFormula);
      if (!isNaN(cost) && typeof cost === "number") {
        return cost;
      }

      let formulaCostArr = this.getArrayElementsFromFormula(
        this.localCostFormula
      );
      let formulaCost = formulaCostArr?.map((item) => {
        const isReserveVariable = item === this.getNameReserveVariable;
        const isGlobalVariable = this.getResultElementOnName(item) !== null;

        if (isReserveVariable) {
          return this.getProxyFreeVariables(0);
        } else if (isGlobalVariable) {
          return this.getResultElementOnName(item);
        } else {
          return item;
        }
      });
      return processingArrayOnFormulaProcessingLogic(formulaCost).join(" ");
    },

    /**
     *
     * @returns {number|null|any}
     */
    localCost() {
      if (
        !this.isVisibilityFromDependency ||
        this.processingVariablesInFormula === null
      ) {
        return null;
      }
      try {
        const resultNumber = eval(this.processingVariablesInFormula);
        if (!isNaN(resultNumber) && isFinite(resultNumber)) {
          return decimalAdjust(resultNumber, this.signAfterDot, this.roundOffType);
        } else {
          return null;
        }
      } catch (e) {
        if(this.devMode) {
          console.error(
            "Системное поле, обработка формулы стоимости: ",
            this.processingVariablesInFormula
          );
        }
        return null;
      }
    },
    isExistLabel() {
      return Boolean(this.label?.toString()?.length);
    },
    isExistLocalCost() {
      return this.localCost !== null && this.showElement !== "notValue";
    },
    isExistUnit() {
      return Boolean(this.unit?.toString()?.length);
    },
    onlyText() {
      return this.showElement === "onlyText";
    },
    currentHtmlText() {
      if (!this.allowProcessingDependencyHtmlText) {
        return this.htmlText;
      }
      const { item } = this.costAfterProcessingDependencyPrice(
        this.dependencyHtmlText,
        "dependencyFormulaHtmlText"
      );
      const textIsExist = Boolean(item?.htmlText?.length);
      if (textIsExist) {
        return item.htmlText;
      }
      return this.htmlText;
    },
    isExistCurrentHtmlText() {
      return Boolean(this.currentHtmlText?.toString()?.length);
    },
    isShowElement() {
      return this.showElement !== "no";
    },
    allowProcessingDependencyPrices() {
      return (
        this.initProcessingDependencyPrice && this.dependencyPrices?.length
      );
    },
    allowProcessingDependencyHtmlText() {
      return ( this.dependencyHtmlText?.length );
    },
  },
};
</script>
