<template>
  <div
    class="calc__duplicator"
    v-if="isVisibilityFromDependency"
    :class="classes"
  >
    <ui-duplicator-wrapper
      v-for="duplicator in localTemplates"
      :origin-data="originData"
      :key="duplicator?.index ? duplicator?.index : 0"
      :index="duplicator?.index ? duplicator?.index : 0"
      :duplicator-data="duplicator"
      :is-duplicate="duplicator?.isDuplicate ? true : false"
      :formula="originData?.formula"
      :parent-name="originData.elementName"
      :parent-is-show="true"
      :origin-variables="originVariablesInDuplicator"
      @duplicate="duplicate"
      @deleteDuplicator="deleteDuplicator"
      @changedValue="changeValue"
    />
  </div>
  <div v-if="devMode && showInsideElementStatus" v-html="devModeData"></div>
</template>

<script>
import UiDuplicatorWrapper from "@/components/UI/UiDuplicatorWrapper";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsUtilityServices } from "@/components/UI/MixinsUtilityServices";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export default {
  name: "UiDuplicator",
  components: { UiDuplicatorWrapper },
  emits: ["changedValue"],
  mixins: [
    MixinsForProcessingFormula,
    MixinsGeneralItemData,
    MixinsUtilityServices,
  ],
  props: {
    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
    duplicateTemplate: {
      type: Object,
      default: () => {},
    },
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
      this.localCost = 0;
      Object.values(this.localResultsElements).forEach((item) => {
        if (item.cost !== null) {
          this.localCost += parseFloat(item.cost);
        }
      });
      this.$emit("changedValue", {
        name: this.duplicateTemplate.elementName,
        type: "duplicator",
        label: this.duplicateTemplate.label,
        cost: this.localCost,
        value: null,
        displayValue: this.localCost,
        formOutputMethod: this.duplicateTemplate.formOutputMethod,
        eventType: data.eventType,
        unit: "",
        isShow: this.isVisibilityFromDependency,
        excludeFromCalculations: this.duplicateTemplate.excludeFromCalculations,
        insertedTemplates: this.localResultsElements,
        formulaProcessingLogic: this.formulaProcessingLogic,
      });
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
      this.localCost = 0;
      Object.values(this.localResultsElements).forEach((item) => {
        if (item.cost !== null) {
          this.localCost += parseFloat(item.cost);
        }
      });
      this.$emit("changedValue", {
        name: this.duplicateTemplate.elementName,
        type: "duplicator",
        label: this.duplicateTemplate.label,
        cost: this.localCost,
        value: null,
        displayValue: null,
        formOutputMethod: this.duplicateTemplate.formOutputMethod,
        eventType: "deleteDuplicate",
        unit: "",
        isShow: this.isVisibilityFromDependency,
        excludeFromCalculations: this.duplicateTemplate.excludeFromCalculations,
        insertedTemplates: this.localResultsElements,
      });
    },
  },
  computed: {
    ...mapState(useBaseStore, ["devMode", "showInsideElementStatus"]),
    originVariablesInDuplicator() {
      let result = this.getNameElementsRecursive(this.originData?.templates);
      return result.filter((item) => item?.length > 0);
    },
  },
};
</script>

<style scoped></style>
