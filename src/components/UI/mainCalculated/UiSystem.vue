<template>
  <div class="calc__dev-block-wrapper" v-if="devModeData" v-html="devModeData"></div>
</template>

<script>
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/servises/UsePropsTemplates";

export default {
  name: "UiSystem",
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  props: {
    ...UsePropsTemplates([
      "cost",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "templateName",
      "parentIsShow",
      "dependencyPrices",
      "label",
      "dependencyFormulaDisplay",
    ]),
  },
  mounted() {
    this.changeValue("mounted");
  },
  methods: {
    changeValue(eventType = "system") {
      this.$emit("changedValue", {
        value: parseFloat(this.localCost),
        displayValue: null,
        name: this.localElementName,
        type: "system",
        cost: parseFloat(this.localCost),
        label: "",
        formOutputMethod: null,
        // isShow: this.isVisibilityFromDependency,
        isShow: true,
        excludeFromCalculations: false,
        unit: "",
        eventType,
        formulaProcessingLogic: this.formulaProcessingLogic,
      });
      this.changeValid(eventType);
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
        isShow: true,
        parentName: this.parentName,
      });
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.localElementName,
        value: parseFloat(this.localCost),
        isShow: this.isVisibilityFromDependency,
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
