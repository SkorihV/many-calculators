<template>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="localCost"
    :local-cost="localCost"
    :is-visibility-from-dependency="showElement"
    :formula-variables="processingVariablesInFormula"
    :formula="localCostFormula"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import {MixinsUtilityServices} from "@/mixins/MixinsUtilityServices";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import {processingArrayOnFormulaProcessingLogic } from "@/servises/UtilityServices";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "UiSystem",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData, MixinsUtilityServices],
  components: { devBlock },
  props: {
    cost: {
      type: [Number, String],
      default: null,
    },
    ...propsTemplate.getProps([
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "templateName",
      "parentIsShow",
      "dependencyPrices",
      "label",
      "dependencyFormulaDisplay",
      "positionElement",
    ]),
  },
  mounted() {
    this.changeValue("mounted");
  },
  methods: {
    changeValue(eventType = "system") {
      this.$emit("changedValue", {
        value: this.localCost,
        displayValue: null,
        name: this.localElementName,
        type: "system",
        cost: this.localCost,
        label: null,
        formOutputMethod: null,
        resultOutputMethod: null,
        isShow: this.parentIsShow,
        excludeFromCalculations: false,
        unit: null,
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
        position: this.positionElement,
        zeroValueDisplayIgnore: true,
      });
      this.changeValid(eventType);
      this.tryPassDependency();
    },
    /**
     * возвращает общее состояние не валидности инпута
     */
    changeValid(eventType) {
      this.checkValidationDataAndToggle({
        error: false,
        name: this.localElementName,
        type: "system",
        label: "",
        eventType,
        isShow: this.showElement,
        parentName: this.parentName,
      });
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: this.localCost,
        isShow: this.showElement,
        displayValue: null,
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
      "tryAddDependencyElement",
      "checkValidationDataAndToggle",
      "getResultElementOnName",
      "listGlobalsVariables"
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
      if (!this.showElement) {
        return null;
      }
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices?.length) {
        return this.cost;
      }
      let formulaCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
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
      if (!this.showElement) {
        return null;
      }
      let cost = Number(this.localCostFormula)
      if (!isNaN(cost) && typeof cost === 'number'){
        return cost;
      }

      let formulaCostArr = this.getArrayElementsFromFormula(this.localCostFormula);

      let formulaCost = formulaCostArr?.map((item) => {
        const isReserveVariable = item === this.getNameReserveVariable;
        const isGlobalVariable = this.getResultElementOnName(item) !== null;

        if (isReserveVariable) {
          return this.getProxyFreeVariables(
            0
          );
        } else if (isGlobalVariable) {
          return this.getResultElementOnName(item);
        } else {
          return item;
        }
      });
      return processingArrayOnFormulaProcessingLogic(formulaCost).join(' ');
    },

    /**
     *
     * @returns {number|null|any}
     */
    localCost() {
      if (!this.showElement || this.processingVariablesInFormula === null) {
        return null;
      }
      try {
        return eval(this.processingVariablesInFormula);
      } catch (e) {
        console.error("Системное поле, обработка формулы стоимости: ", this.processingVariablesInFormula);
        return null
      }
    },
    showElement() {
      return this.parentIsShow && this.isVisibilityFromDependency;
    }
  },
};
</script>
