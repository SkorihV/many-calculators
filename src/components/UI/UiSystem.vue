<template>
  <div v-if="devModeData?.length" v-html="devModeData"></div>
</template>

<script>
import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { computed, onMounted, ref, toRef, watch } from "vue";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";

export default {
  name: "UiSystem",
  emits: ["changedValue"],
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
      changeValid,
      changeValue
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

    const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    });

    function changeValue(eventType = "system") {
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
        error: false,
        parentName: props.parentName,
      });
      changeValid(eventType);
    }

    /**
     * возвращает общее состояние не валидности инпута
     */
    function changeValid(eventType) {
      store.checkValidationDataAndToggle({
        error: false,
        name: localElementName.value,
        type: "system",
        label: "",
        eventType,
        isShow: true,
        parentName: props.parentName,
      });
    }

    function tryPassDependency() {
      store.tryAddDependencyElement({
        name: localElementName.value,
        value: parseFloat(localCost.value),
        isShow: isVisibilityFromDependency.value,
        displayValue: null,
        type: "system",
      });
    }

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

    onMounted(() => {
      changeValue("mounted");
    });

    return {
      devModeData,
    };
  },
};
</script>
