<template>
  <div v-if="devModeData?.length" v-html="devModeData"></div>
</template>

<script>
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { computed, onMounted, ref, toRef, watch } from "vue";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";

export default {
  name: "UiSystem",
  emits: ["changedValue"],
  // mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  props: {
    ...UsePropsTemplates([
      "cost",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "templateName",
      "parentIsShow",
      "dependencyPrices",
    ]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const { checkedValueOnVoid } = UseUtilityServices();

    const parentIsShow = toRef(props, "parentIsShow");
    const dependencyPrices = toRef(props, "dependencyPrices");

    const {
      initProcessingDependencyPrice,
      costAfterProcessingDependencyPrice,
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
      parsingFormulaVariables,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyPrices,
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

    onMounted(() => {
      changeValue("mounted");
    });

    const changeValue = (eventType = "system") => {
      emit("changedValue", {
        value: parseFloat(localCost.value),
        displayValue: null,
        name: localElementName.value,
        type: "system",
        cost: parseFloat(localCost.value),
        label: "",
        formOutputMethod: null,
        isShow: isVisibilityFromDependency.value,
        excludeFromCalculations: false,
        unit: "",
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
      });
      changeValid(eventType);
    };

    /**
     * возвращает общее состояние не валидности инпута
     */
    const changeValid = (eventType) => {
      store.checkValidationDataAndToggle({
        error: false,
        name: localElementName,
        type: "system",
        label: "",
        eventType,
        isShow: true,
        parentName: props.parentName,
      });
    };

    const tryPassDependency = () => {
      store.tryAddDependencyElement({
        name: localElementName,
        value: parseFloat(localCost.value),
        isShow: isVisibilityFromDependency.value,
        displayValue: null,
        type: "system",
      });
    };

    const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    });

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    const localCost = computed(() => {
      if (!initProcessingDependencyPrice.value || !props.dependencyPrices) {
        return props.cost;
      }

      let newCost = costAfterProcessingDependencyPrice(props.dependencyPrices);
      if (newCost !== null) {
        return newCost;
      }
      return props.cost;
    });

    watch(
      () => localCost.value,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          changeValue();
        }
      },
      { deep: true }
    );

    const { devModeData } = UseDevModeDataBlock({
      elementName: props.elementName,
      templateName: props.templateName,
      localCost: localCost.value,
      isVisibilityFromDependency: isVisibilityFromDependency.value,
      parsingFormulaVariables: parsingFormulaVariables.value,
      changeValid,
      changeValue,
    });

    return {
      devModeData,
    };
  },
  // mounted() {
  //   this.changeValue("mounted");
  // },
  // methods: {
  //   changeValue(eventType = "system") {
  //     this.$emit("changedValue", {
  //       value: parseFloat(this.localCost),
  //       displayValue: null,
  //       name: this.localElementName,
  //       type: "system",
  //       cost: parseFloat(this.localCost),
  //       label: "",
  //       formOutputMethod: null,
  //       isShow: this.isVisibilityFromDependency,
  //       excludeFromCalculations: false,
  //       unit: "",
  //       eventType,
  //       formulaProcessingLogic: this.formulaProcessingLogic,
  //     });
  //     this.changeValid(eventType);
  //   },
  //   /**
  //    * возвращает общее состояние не валидности инпута
  //    */
  //   changeValid(eventType) {
  //     this.checkValidationDataAndToggle({
  //       error: false,
  //       name: this.localElementName,
  //       type: "system",
  //       label: "",
  //       eventType,
  //       isShow: true,
  //       parentName: this.parentName,
  //     });
  //   },
  //   tryPassDependency() {
  //     this.tryAddDependencyElement({
  //       name: this.localElementName,
  //       value: parseFloat(this.localCost),
  //       isShow: this.isVisibilityFromDependency,
  //       displayValue: null,
  //       type: "system",
  //     });
  //   },
  // },
  // watch: {
  //   localCost: {
  //     handler(newValue, oldValue) {
  //       if (newValue !== oldValue) {
  //         this.changeValue();
  //       }
  //     },
  //     deep: true,
  //   },
  // },
  // computed: {
  //   ...mapState(useBaseStore, [
  //     "tryAddDependencyElement",
  //     "checkValidationDataAndToggle",
  //     "devMode",
  //     "showInsideElementStatus",
  //   ]),
  //   localElementName() {
  //     return this.checkedValueOnVoid(this.elementName)
  //       ? this.elementName
  //       : Math.random().toString();
  //   },
  //   /**
  //    * Возвращает цену подходящую условию, если моле отображается
  //    * Если не одна цена не подходит, то возвращается стандартная
  //    * @returns {Number|String|*}
  //    */
  //   localCost() {
  //     if (!this.initProcessingDependencyPrice || !this.dependencyPrices) {
  //       return this.cost;
  //     }
  //
  //     let newCost = this.costAfterProcessingDependencyPrice(
  //       this.dependencyPrices
  //     );
  //     if (newCost !== null) {
  //       return newCost;
  //     }
  //     return this.cost;
  //   },
  // },
};
</script>
