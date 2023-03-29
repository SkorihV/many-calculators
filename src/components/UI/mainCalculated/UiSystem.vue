<template>
  <dev-block
    :label="label"
    :element-name="localElementName"
    :value="localCost"
    :local-cost="localCost"
    :is-visibility-from-dependency="showElement"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import devBlock from "@/components/UI/devMode/devBlock.vue";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

export default {
  name: "UiSystem",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { devBlock },
  props: {
    ...propsTemplate.getProps([
      "cost",
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
    ]),
    localElementName() {
      return this.checkedValueOnVoid(this.elementName)
        ? this.elementName
        : Math.random().toString();
    },
    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {number|null}
     */
    localCost() {
      if (!this.showElement) {
        return null;
      }
      if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
        return parseFloat(this.cost);
      }
      let newCost = this.costAfterProcessingDependencyPrice(
        this.dependencyPrices
      );

      if (newCost !== null) {
        return parseFloat(newCost);
      }
      return parseFloat(this.cost);
    },
    showElement() {
      return this.parentIsShow && this.isVisibilityFromDependency;
    }
  },
};
</script>
