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
      :is-duplicate="duplicator?.isDuplicate"
      :formula="originData?.formula"
      :parent-name="originData.elementName"
      :parent-is-show="true"
      :origin-variables="originVariablesInDuplicator"
      @duplicate="duplicate"
      @deleteDuplicator="deleteDuplicator"
      @changedValue="changeValue"
    />
  </div>
  <div v-if="devModeData?.length" v-html="devModeData"></div>
</template>

<script>
import UiDuplicatorWrapper from "@/components/UI/UiDuplicatorWrapper";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsUtilityServices } from "@/components/UI/MixinsUtilityServices";

import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { mapState } from "pinia";
import { onMounted, ref, toRef, watch, reactive, computed } from "vue";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";
import UseUtilityServices from "@/components/UI/UseUtilityServices";

export default {
  name: "UiDuplicator",
  components: { UiDuplicatorWrapper },
  emits: ["changedValue"],
  // mixins: [
  //   MixinsForProcessingFormula,
  //   MixinsGeneralItemData,
  //   MixinsUtilityServices,
  // ],
  props: {
    duplicateTemplate: {
      type: Object,
      default: () => {},
    },
    ...UsePropsTemplates([
      "formOutputMethod",
      "label",
      "dependencyFormulaDisplay",
      "excludeFromCalculations",
      "elementName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
    ]),
  },
  setup(props, { emit }) {

    const originData = reactive({});
    const localResultsElements = reactive({});
    const localTemplates = ref([]);
    const localCost = ref(0);

    const parentIsShow = ref(true);
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");

    const { getNameElementsRecursive } = UseUtilityServices();

    /**
     *
     * @param data
     * @returns {boolean}
     */
    let changeValue = (data) => {
      if (data === "dependency") {
        data = { eventType: "dependency" };
      }
      if (typeof data !== "object") {
        return false;
      }

      if (data?.name) {
        localResultsElements[data.name] = data;
      }
      localCost.value = 0;
      Object.values(localResultsElements).forEach((item) => {
        if (item.cost !== null) {
          localCost.value += parseFloat(item.cost);
        }
      });
      emit("changedValue", {
        name: props.duplicateTemplate.elementName,
        type: "duplicator",
        label: props.duplicateTemplate.label,
        cost: localCost.value,
        value: null,
        displayValue: localCost.value,
        formOutputMethod: props.duplicateTemplate.formOutputMethod,
        eventType: data.eventType,
        unit: "",
        isShow: isVisibilityFromDependency.value,
        excludeFromCalculations:
          props.duplicateTemplate.excludeFromCalculations,
        insertedTemplates: localResultsElements,
        formulaProcessingLogic: props.formulaProcessingLogic,
      });
    };

    let {
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
      parsingFormulaVariables,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyFormulaDisplay,
      changeValue,
    });
    const isVisibilityFromDependency = ref(
      isVisibilityFromDependencyLocal.value
    );
    watch(
      () => isVisibilityFromDependencyLocal.value,
      () => {
        isVisibilityFromDependency.value =
          isVisibilityFromDependencyLocal.value;
      }
    );

    // const calculateResult = () => {
    //   store.shownAllTooltips = true;
    //   this.initEnabledSendForm = true;
    // }
    // const hiddenElementOnResults = (name) => {
    //   if (name in localResultsElements) {
    //     localResultsElements[name].isShow = false;
    //   }
    // }
    const duplicate = (duplicateElement) => {
      localTemplates.value.push(duplicateElement);
    };
    const deleteDuplicator = (elementName) => {
      let index = localTemplates.value.findIndex(
        (item) => item.elementName === elementName
      );
      localTemplates.value.splice(index, 1);

      delete localResultsElements[elementName];
      localCost.value = 0;
      Object.values(localResultsElements).forEach((item) => {
        if (item.cost !== null) {
          localCost.value += parseFloat(item.cost);
        }
      });
      emit("changedValue", {
        name: props.duplicateTemplate.elementName,
        type: "duplicator",
        label: props.duplicateTemplate.label,
        cost: localCost.value,
        value: null,
        displayValue: null,
        formOutputMethod: props.duplicateTemplate.formOutputMethod,
        eventType: "deleteDuplicate",
        unit: "",
        isShow: isVisibilityFromDependency.value,
        excludeFromCalculations:
          props.duplicateTemplate.excludeFromCalculations,
        insertedTemplates: localResultsElements,
      });
    };

    const originVariablesInDuplicator = computed(() => {
      let result = getNameElementsRecursive(originData?.templates);
      return result.filter((item) => item?.length > 0);
    });

    const { devModeData } = UseDevModeDataBlock({
      label: props.label,
      dependencyFormulaDisplay,
      parsingFormulaVariables,
      elementName: props.elementName,
      templateName: props.templateName,
      isVisibilityFromDependency,
      localCost: localCost,
    });

    onMounted(() => {
      const data = JSON.parse(JSON.stringify(props.duplicateTemplate));

      for (let key in data) {
        originData[key] = data[key];
      }
      localTemplates.value.push(data);
      changeValue({ eventType: "mounted" });
    });

    return {
      isVisibilityFromDependency,
      duplicate,
      deleteDuplicator,
      originVariablesInDuplicator,
      devModeData,
      localTemplates,
      changeValue,
      originData,
      classes: props.classes,
    };
  },

  // mounted() {
  //   this.originData = JSON.parse(JSON.stringify(this.duplicateTemplate));
  //   this.localTemplates.push(
  //     JSON.parse(JSON.stringify(this.duplicateTemplate))
  //   );
  //   this.changeValue({ eventType: "mounted" });
  // },
  // data() {
  //   return {
  //     originData: {},
  //     localResultsElements: {},
  //     localTemplates: [],
  //     localCost: 0,
  //   };
  // },
  // methods: {
  //   changeValid() {
  //     return null;
  //   },
  //   changeValue(data) {
  //     if (data === "dependency") {
  //       data = { eventType: "dependency" };
  //     }
  //     if (typeof data !== "object") {
  //       return false;
  //     }
  //     if (data?.name) {
  //       this.localResultsElements[data.name] = data;
  //     }
  //     this.localCost = 0;
  //     Object.values(this.localResultsElements).forEach((item) => {
  //       if (item.cost !== null) {
  //         this.localCost += parseFloat(item.cost);
  //       }
  //     });
  //     this.$emit("changedValue", {
  //       name: this.duplicateTemplate.elementName,
  //       type: "duplicator",
  //       label: this.duplicateTemplate.label,
  //       cost: this.localCost,
  //       value: null,
  //       displayValue: this.localCost,
  //       formOutputMethod: this.duplicateTemplate.formOutputMethod,
  //       eventType: data.eventType,
  //       unit: "",
  //       isShow: this.isVisibilityFromDependency,
  //       excludeFromCalculations: this.duplicateTemplate.excludeFromCalculations,
  //       insertedTemplates: this.localResultsElements,
  //       formulaProcessingLogic: this.formulaProcessingLogic,
  //     });
  //   },
  //   calculateResult() {
  //     this.shownAllTooltips = true;
  //     this.initEnabledSendForm = true;
  //   },
  //   hiddenElementOnResults(name) {
  //     if (name in this.localResultsElements) {
  //       this.localResultsElements[name].isShow = false;
  //     }
  //   },
  //   duplicate(duplicateElement) {
  //     console.log(duplicateElement);
  //     this.localTemplates.push(duplicateElement);
  //   },
  //   deleteDuplicator(elementName) {
  //     let index = this.localTemplates.findIndex(
  //       (item) => item.elementName === elementName
  //     );
  //     this.localTemplates.splice(index, 1);
  //
  //     delete this.localResultsElements[elementName];
  //     this.localCost = 0;
  //     Object.values(this.localResultsElements).forEach((item) => {
  //       if (item.cost !== null) {
  //         this.localCost += parseFloat(item.cost);
  //       }
  //     });
  //     this.$emit("changedValue", {
  //       name: this.duplicateTemplate.elementName,
  //       type: "duplicator",
  //       label: this.duplicateTemplate.label,
  //       cost: this.localCost,
  //       value: null,
  //       displayValue: null,
  //       formOutputMethod: this.duplicateTemplate.formOutputMethod,
  //       eventType: "deleteDuplicate",
  //       unit: "",
  //       isShow: this.isVisibilityFromDependency,
  //       excludeFromCalculations: this.duplicateTemplate.excludeFromCalculations,
  //       insertedTemplates: this.localResultsElements,
  //     });
  //   },
  // },
  // computed: {
  //   ...mapState(useBaseStore, ["devMode", "showInsideElementStatus"]),
  //   originVariablesInDuplicator() {
  //     let result = this.getNameElementsRecursive(this.originData?.templates);
  //     return result.filter((item) => item?.length > 0);
  //   },
  // },
};
</script>

<style scoped></style>
