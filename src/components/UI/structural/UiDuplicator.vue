<template>
  <div
    class="calc__duplicator"
    :class="classes"
    v-show="isVisibilityFromDependency"
    :id="elementName"
  >
    <ui-duplicator-wrapper
      v-for="(duplicator, idx) in localTemplates"
      :origin-data="originData"
      :key="duplicator?.index ? duplicator?.index : 0"
      :index="duplicator?.index ? duplicator?.index : 0"
      :duplicator-data="duplicator"
      :is-duplicate="duplicator?.isDuplicate"
      :formula="originData?.formula"
      :parent-name="originData.elementName"
      :parent-is-show="isVisibilityFromDependency"
      :origin-variables="originVariablesInDuplicator"
      :position-element="idx"
      @duplicate="duplicate"
      @deleteDuplicator="deleteDuplicator"
      @changedValue="changeValue"
    />
  </div>
  <dev-block
    :label="label"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
    :element-name="elementName"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    value="null"
  />
</template>

<script>
import UiDuplicatorWrapper from "@/components/UI/structural/UiDuplicatorWrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import UsePropsTemplates from "@/servises/UsePropsTemplates";

import { mapState } from "pinia";
import {useBaseStore} from "@/store/piniaStore";

import { getNameElementsRecursive } from "@/servises/UtilityServices";

export default {
  name: "UiDuplicator",
  components: { UiDuplicatorWrapper, devBlock },
  emits: ["changedValue"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  props: {
    duplicateTemplate: {
      type: Object,
      default: () => {},
    },
    ...UsePropsTemplates([
      "formOutputMethod",
      "resultOutputMethod",
      "label",
      "dependencyFormulaDisplay",
      "excludeFromCalculations",
      "elementName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
      "parentIsShow",
      "positionElement",
      "zeroValueDisplayIgnore",
    ]),
  },
  mounted() {
    this.originData = JSON.parse(JSON.stringify(this.duplicateTemplate));
    this.localTemplates.push(
      JSON.parse(JSON.stringify(this.duplicateTemplate))
    );
    this.changeValue({ eventType: "mounted" });
  },
  data() {
    return {
      originData: {},
      localResultsElements: {},
      localTemplates: [],
      localCost: 0,
    };
  },
  methods: {
    changeValid() {
      return null;
    },
    changeValue(data) {
      if (data === "dependency") {
        data = { eventType: "dependency" };
      }
      if (typeof data !== "object") {
        return false;
      }
      if (data?.name) {
        this.localResultsElements[data.name] = data;
      }
      this.updateLocalCost();
      this.emitChangeValue(data.eventType, this.localCost);
    },
    calculateResult() {
      this.shownAllTooltips = true;
      this.initEnabledSendForm = true;
    },
    hiddenElementOnResults(name) {
      if (name in this.localResultsElements) {
        this.localResultsElements[name].isShow = false;
      }
    },
    duplicate(duplicateElement) {
      this.localTemplates.push(duplicateElement);
    },
    deleteDuplicator(elementName) {
      let index = this.localTemplates.findIndex(
        (item) => item.elementName === elementName
      );
      this.localTemplates.splice(index, 1);

      delete this.localResultsElements[elementName];
      this.updateLocalCost();
      this.emitChangeValue("deleteDuplicate");
    },
    updateLocalCost() {
      if (!this.isVisibilityFromDependency) {
        this.localCost = null;
        return false;
      }
      this.localCost = 0;
      this.returnsLocalResultsElements.forEach((item) => {
        if (item.cost !== null) {
          this.localCost += parseFloat(item.cost);
        }
      });
    },
    emitChangeValue(eventType) {
      this.$emit("changedValue", {
        name: this.elementName,
        type: "duplicator",
        label: this.duplicateTemplate.label,
        cost:  this.localCost,
        value: this.localCost,
        displayValue: this.localCost,
        formOutputMethod: this.duplicateTemplate.formOutputMethod,
        resultOutputMethod: this.duplicateTemplate.resultOutputMethod,
        eventType: eventType,
        unit: "",
        isShow: this.isVisibilityFromDependency,
        excludeFromCalculations: this.duplicateTemplate.excludeFromCalculations,
        insertedTemplates: this.returnsLocalResultsElements,
        formulaProcessingLogic: this.formulaProcessingLogic,
        position: this.positionElement,
        zeroValueDisplayIgnore: this.zeroValueDisplayIgnore,
      });
      this.tryPassDependency();
    },
    tryPassDependency() {
      this.tryAddDependencyElement({
        name: this.elementName,
        value: this.localCost,
        isShow: this.isVisibilityFromDependency,
        displayValue: this.localCost,
        type: "duplicator",
      });
    },
  },
  watch: {
    isVisibilityFromDependency(newValue) {
      if (newValue === false) {
        this.emitChangeValue("deleteDuplicate");
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, ["tryAddDependencyElement"]),
    returnsLocalResultsElements() {
      return Object.values(this.localResultsElements).sort(
        (itemA, itemB) => itemA?.position - itemB?.position
      );
    },
    originVariablesInDuplicator() {
      let result = getNameElementsRecursive(this.originData?.templates);
      return result.filter((item) => item?.length > 0);
    },
  },
};
</script>
