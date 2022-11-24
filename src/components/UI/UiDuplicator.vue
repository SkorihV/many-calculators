<template>
  <!--    <div class="calc__duplicator" v-if="isVisibilityFromDependency"-->
  <div class="calc__duplicator" v-if="true" :class="classes">
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
</template>

<script>
import UiDuplicatorWrapper from "@/components/UI/UiDuplicatorWrapper";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsUtilityServices } from "@/components/UI/MixinsUtilityServices";

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
  },
  data() {
    return {
      errorsElements: new Set(), // список элементов с ошибками валидации
      localResultsElements: {},
      reserveVariableForOther: "_otherSumma_", // зарезервированная переменная в которую попадают сумма всех полей не учавствующих в формуле
      counterDuplicate: 0,
      localTemplates: [],
      localSummaCosts: 0,
    };
  },
  methods: {
    changeValid() {
      return null;
    },
    changeValue(data) {
      this.localResultsElements[data.name] = data;
      this.localSummaCosts = 0;
      Object.values(this.localResultsElements).forEach((item) => {
        if (item.cost !== null) {
          this.localSummaCosts += parseFloat(item.cost);
        }
      });
      console.log(this.localResultsElements);
      this.$emit("changedValue", {
        name: this.duplicateTemplate.elementName,
        type: "duplicator",
        label: this.duplicateTemplate.label,
        cost: this.localSummaCosts,
        value: null,
        displayValue: null,
        formOutputMethod: this.duplicateTemplate.formOutputMethod,
        eventType: data.eventType,
        unit: "",
        isShow: this.isVisibilityFromDependency,
        excludeFromCalculations: this.duplicateTemplate.excludeFromCalculations,
        insertedTemplates: this.localResultsElements,
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
      this.localSummaCosts = 0;
      Object.values(this.localResultsElements).forEach((item) => {
        if (item.cost !== null) {
          this.localSummaCosts += parseFloat(item.cost);
        }
      });
      this.$emit("changedValue", {
        name: this.duplicateTemplate.elementName,
        type: "duplicator",
        label: this.duplicateTemplate.label,
        cost: this.localSummaCosts,
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
    originVariablesInDuplicator() {
      return this.duplicateTemplate?.templates?.map((item) => {
        return item.elementName;
      });
    },
  },
};
</script>

<style scoped></style>
