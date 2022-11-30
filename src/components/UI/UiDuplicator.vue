<template>
  <div
    class="calc__duplicator"
    v-if="isVisibilityFromDependency"
    :class="classes"
  >
    <ui-duplicator-wrapper
      v-for="(duplicator, key) in localTemplates"
      :key="duplicator?.index ? duplicator.index : 0"
      :index="duplicator?.index ? duplicator.index : 0"
      :duplicator-data="duplicator"
      :is-duplicate="duplicator?.index !== undefined"
      :formula="duplicateTemplate?.formula"
      :parent-name="duplicator.name"
      :parent-is-show="true"
      :origin-variables="originVariablesInDuplicator"
      @duplicate="duplicate"
      @deleteDuplicator="deleteDuplicator"
      @changedValue="changeValue"
    >
    </ui-duplicator-wrapper>
  </div>
  <div v-if="devMode && showInsideElementStatus" v-html="devModeData"></div>
</template>

<script>
import UiDuplicatorWrapper from "@/components/UI/UiDuplicatorWrapper";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsUtilityServices } from "@/components/UI/MixinsUtilityServices";
import { mapGetters } from "vuex";

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
    let mutationDuplicateTemplate = this.duplicateTemplate;
    if (this.duplicateTemplate?.templates?.length) {
      mutationDuplicateTemplate.templates =
        this.duplicateTemplate.templates.map((item, key) => {
          item.elementName = item?.elementName?.length
            ? item?.elementName
            : item?.json_id || "UiDuplicator" + key;
          return item;
        });
    }

    this.localTemplates.push(mutationDuplicateTemplate);
    this.changeValue({ eventType: "mounted" });
  },
  data() {
    return {
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
    ...mapGetters(["devMode", "showInsideElementStatus"]),
    originVariablesInDuplicator() {
      return this.duplicateTemplate?.templates?.map((item) => {
        return item.elementName;
      });
    },
  },
};
</script>

<style scoped></style>
