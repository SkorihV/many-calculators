<template>
  <div
    class="calc__wrapper-group-data"
    :class="classes"
    v-show="isVisibilityFromDependency"
    :id="elementName"
  >
    <div class="calc__duplicator">
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
        :show-duplicate-button="countElementsDuple < maximumDuple"
        :icon-settings-duplicator-label="originData?.iconSettingsDuplicatorLabel"
        :prompt="originData?.prompt"
        :unit="originData?.unit"
        @duplicate="duplicate"
        @deleteDuplicator="deleteDuplicator"
        @changedValue="changeValue"
      >
        <template v-slot:prompt v-if="IsExistPrompt">
          <ui-prompt :prompt-text="originData.prompt" />
        </template>
      </ui-duplicator-wrapper>
    </div>
  </div>
  <dev-block
    :label="label"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
    :element-name="elementName"
    :local-cost="localCost"
    :value="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
  />
</template>

<script>
import UiDuplicatorWrapper from "@/components/UI/structural/UiDuplicatorWrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import UiPrompt from "@/components/UI/other/c_UiPrompt.vue";

import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";

import { decimalAdjust, getNameElementsRecursive } from "@/servises/UtilityServices";

export default {
  name: "UiDuplicator",
  components: { UiDuplicatorWrapper, devBlock, UiPrompt },
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  emits: ["changedValue"],
  props: {
    duplicateTemplate: {
      type: Object,
      default: () => {},
    },
    maximumDuple: {
      type: [Number, String],
      default: 5,
      validator(value) {
        return !isNaN(Number(value));
      },
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
      "unit"
    ]),
  },
  data() {
    return {
      originData: {},
      localResultsElements: {},
      localTemplates: [],
      localCost: 0,
    };
  },
  mounted() {
    this.originData = JSON.parse(JSON.stringify(this.duplicateTemplate));
    this.localTemplates.push(
      JSON.parse(JSON.stringify(this.duplicateTemplate))
    );
    this.changeValue({ eventType: "mounted" });
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
      this.emitChangeValue(data.eventType);
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

      let resultCost = this.returnsLocalResultsElements.reduce((result, item) => {
        if (item.cost !== null) {
          return result + parseFloat(item.cost);
        }
        return result;
      }, 0);
      resultCost = decimalAdjust(
        resultCost,
        this.signAfterDot,
        this.roundOffType
      );
      this.localCost = resultCost;
    },
    emitChangeValue(eventType) {
      this.$emit("changedValue", {
        name: this.elementName,
        type: "duplicator",
        label: this.duplicateTemplate.label,
        cost: this.localCost,
        value: this.localCost,
        displayValue: this.localCost,
        formOutputMethod: this.duplicateTemplate.formOutputMethod,
        resultOutputMethod: this.duplicateTemplate.resultOutputMethod,
        eventType: eventType,
        unit: this.unit?.length ? this.unit : '',
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
    ...mapState(useBaseStore, ["tryAddDependencyElement", "getSignAfterDot", "getRoundOffType"]),
    returnsLocalResultsElements() {
      return Object.values(this.localResultsElements).sort(
        (itemA, itemB) => itemA?.position - itemB?.position
      );
    },
    originVariablesInDuplicator() {
      let result = getNameElementsRecursive(this.originData?.templates);
      return result.filter((item) => item?.length > 0);
    },
    countElementsDuple() {
      return this.localTemplates?.length ? this.localTemplates?.length : 0;
    },
    IsExistPrompt() {
      return Boolean(this.originData.prompt?.length);
    },
  },
};
</script>
