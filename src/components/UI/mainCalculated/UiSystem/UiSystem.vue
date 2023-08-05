<script>
const typeElement = "UiSystem";
</script>

<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRef,
  watch,
} from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useResultListStore} from "@/store/resultListStore";
import {useValidationListStore} from "@/store/validationListStore";
import {storeToRefs} from "pinia";

import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import { checkedValueOnVoid } from "@/servises/UtilityServices";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { getProxyFreeVariables } from "@/composables/getProxyFreeVariables";
import {
  getCurrentWidthElement,
  getIsMakeElementColumn,
} from "@/composables/useWidthElement";

import {
  decimalAdjust,
  processingArrayOnFormulaProcessingLogic,
} from "@/servises/UtilityServices";

import { useReportInitialStatusForElement } from "@/composables/useReportInitialStatusForElement";
import { useInitProcessingDependencyPrice } from "@/composables/useInitProcessingDependencyPrice";
import { useDisplaySpinner } from "@/composables/useDisplaySpinner";

import { getArrayElementsFromFormula } from "@/servises/UtilityServices";
import { NAME_RESERVED_VARIABLE_SUM } from "@/constants/variables";
import { useHighlightElement } from "@/composables/useHighlightElement";
import {useDisplayComponents} from "@/composables/useDisplayComponents";

const baseStore = useBaseStore()
const { devMode } = storeToRefs(baseStore);
const { getResultElementByName } = storeToRefs( useResultListStore());
const dependencyStore = useDependencyListStore()
const validationStore = useValidationListStore()


const emits = defineEmits(["changedValue"]);
const props = defineProps({
  cost: {
    type: [Number, String],
    default: null,
  },
  /**
   * no
   * show
   * onlyText
   * notValue
   */
  showElement: {
    type: String,
    default: "no",
  },
  iconSettingsSystemLabel: {
    type: Object,
    default: () => {},
  },
  roundOffType: {
    type: String,
    default: "round",
  },
  signAfterDot: {
    type: [Number, String],
    default: -2,
  },
  ...propsTemplate.getProps([
    "elementName",
    "parentName",
    "formulaProcessingLogic",
    "templateName",
    "parentIsShow",
    "dependencyPrices",
    "dependencyHtmlText",
    "label",
    "formOutputMethod",
    "resultOutputMethod",
    "dependencyFormulaDisplay",
    "positionElement",
    "zeroValueDisplayIgnore",
    "excludeFromCalculations",
    "htmlText",
    "unit",
  ]),
});
const parentRef = ref(null);

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();
const {
  isVisibilityFromDependency,
  formulaAfterProcessingVariables,
  costAfterProcessingDependencyPrice,
} = useProcessingFormula(
  reactive({
    formula: toRef(props, "dependencyFormulaDisplay"),
    parentIsShow: toRef(props, "parentIsShow"),
    constructLocalListElementDependencyInFormula,
    localDependencyList: localDependencyList,
  })
);

useReportInitialStatusForElement(
  toRef(props, "parentIsShow"),
  changeValue,
  changeValid
);
useDisplaySpinner(props.elementName);
const { initProcessingDependencyPrice } = useInitProcessingDependencyPrice(
  toRef(props, "dependencyPrices")
);

const { currentWidthElement } = getCurrentWidthElement(
  isVisibilityFromDependency,
  parentRef
);
const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
});

const { isMakeElementColumn } = getIsMakeElementColumn(
  currentWidthElement,
  isExistLabel
);

const localElementName = computed(() => {
  return checkedValueOnVoid(props.elementName)
    ? props.elementName
    : "Math.random().toString()";
});
const { isHighlightElement } = useHighlightElement(localElementName);
useDisplayComponents(localElementName.value, isVisibilityFromDependency, typeElement)
/**
 * Возвращает формулу цены без данных
 * @returns {number|*|number|string|null}
 */
const localCostFormula = computed(() => {
  if (!isVisibilityFromDependency.value) {
    return null;
  }
  if (!allowProcessingDependencyPrices.value) {
    return props.cost;
  }
  const { cost: formulaCost } = costAfterProcessingDependencyPrice(
    reactive({
      dependencyArrayItems: toRef(props, "dependencyPrices"),
      formulaFieldName: "dependencyFormulaCost",
    })
  );

  if (formulaCost !== null) {
    return formulaCost;
  }

  return props.cost;
});

/**
 * возвращает цену или формулу цены из собранных данных
 * @returns {number|string|null}
 */
const processingVariablesInFormula = computed(() => {
  if (
    !isVisibilityFromDependency.value ||
    !localCostFormula.value?.toString()?.length
  ) {
    return null;
  }

  let cost = Number(localCostFormula.value);
  if (!isNaN(cost) && typeof cost === "number") {
    return cost;
  }

  let formulaCostArr = getArrayElementsFromFormula(localCostFormula.value);
  let formulaCost = formulaCostArr?.map((item) => {
    const isReserveVariable = item === NAME_RESERVED_VARIABLE_SUM;
    const isGlobalVariable = getResultElementByName.value(item) !== null;

    if (isReserveVariable) {
      return getProxyFreeVariables(0);
    } else if (isGlobalVariable) {
      return getResultElementByName.value(item);
    } else {
      return item;
    }
  });
  return processingArrayOnFormulaProcessingLogic(formulaCost).join(" ");
});

/**
 *
 * @returns {number|null|any}
 */
const localCost = computed(() => {
  if (
    !isVisibilityFromDependency.value ||
    processingVariablesInFormula.value === null
  ) {
    return null;
  }

  try {
    const resultNumber = eval(processingVariablesInFormula.value);
    if (!isNaN(resultNumber) && isFinite(resultNumber)) {
      return decimalAdjust(
        resultNumber,
        props.signAfterDot,
        props.roundOffType
      );
    } else {
      return null;
    }
  } catch (e) {
    if (devMode.value) {
      console.error(
        "Системное поле, обработка формулы стоимости: ",
        processingVariablesInFormula.value
      );
    }
    return null;
  }
});

const isExistLocalCost = computed(() => {
  return localCost.value !== null && props.showElement !== "notValue";
});
const isExistUnit = computed(() => {
  return Boolean(props.unit?.toString()?.length);
});
const onlyText = computed(() => {
  return props.showElement === "onlyText";
});

const allowProcessingDependencyHtmlText = computed(() => {
  return props.dependencyHtmlText?.length;
});
const currentHtmlText = computed(() => {
  if (!allowProcessingDependencyHtmlText.value) {
    return props.htmlText;
  }
  const { item } = costAfterProcessingDependencyPrice(
    props.dependencyHtmlText,
    "dependencyFormulaHtmlText"
  );
  const textIsExist = Boolean(item?.htmlText?.length);
  if (textIsExist) {
    return item.htmlText;
  }
  return props.htmlText;
});
const isExistCurrentHtmlText = computed(() => {
  return Boolean(currentHtmlText.value?.toString()?.length);
});
const isShowElement = computed(() => {
  return props.showElement !== "no";
});
const allowProcessingDependencyPrices = computed(() => {
  return initProcessingDependencyPrice.value && props.dependencyPrices?.length;
});

watch(
  localCost,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      changeValue();
    }
  },
  { deep: true }
);

watch(isVisibilityFromDependency, () => {
  changeValue("dependency");
});

function changeValue(eventType = "system") {
  emits("changedValue", {
    value: localCost.value,
    displayValue: localCost.value,
    name: localElementName.value,
    type: "system",
    cost: localCost.value,
    label: props.label,
    formOutputMethod: props.formOutputMethod,
    resultOutputMethod: props.resultOutputMethod,
    isShow: isVisibilityFromDependency.value && isShowElement.value,
    excludeFromCalculations: props.excludeFromCalculations,
    unit: props.unit,
    eventType,
    formulaProcessingLogic: props.formulaProcessingLogic,
    position: props.positionElement,
    zeroValueDisplayIgnore: props.zeroValueDisplayIgnore,
  });
  changeValid(eventType);
  tryPassDependency();
}

function changeValid(eventType) {
  validationStore.checkValidationDataAndToggle({
    error: false,
    name: localElementName.value,
    type: "system",
    label: "",
    eventType,
    isShow: isVisibilityFromDependency.value && isShowElement.value,
    parentName: props.parentName,
  });
}

function tryPassDependency() {
  dependencyStore.addDependencyElement({
    name: localElementName.value,
    value: props.localCost,
    isShow: isVisibilityFromDependency.value && isShowElement.value,
    displayValue: props.localCost,
    type: "system",
  });
}

onMounted(() => {
  changeValue("mounted");
});

onUnmounted(() => {
  baseStore.tryDeleteAllDataOnStoreForElementName.value(localElementName.value);
});
</script>

<template>
  <div
    class="calc__wrapper-group-data"
    ref="parentRef"
    v-if="isVisibilityFromDependency && isShowElement"
    :id="elementName"
    :class="{ 'is-highlight': isHighlightElement }"
  >
    <div class="calc__system-wrapper" :class="{ column: isMakeElementColumn }">
      <div class="calc__system-label-wrapper" v-if="!onlyText">
        <icon-element-wrapper
          :icon-settings="iconSettingsSystemLabel"
          :alt="isExistLabel ? label : ''"
          :isExistLabel="isExistLabel"
        >
          <div class="calc__system-label-text" v-if="isExistLabel">
            {{ label }}
            <slot name="prompt" />
          </div>
        </icon-element-wrapper>
        <div class="calc__system-data-wrapper" v-if="isExistLocalCost">
          <div class="calc__system-data-value">{{ localCost }}</div>
          <div class="calc__system-data-unit" v-if="isExistUnit">
            {{ unit }}
          </div>
        </div>
      </div>
      <div class="calc__system-content" v-if="isExistCurrentHtmlText">
        <div v-html="currentHtmlText"></div>
      </div>
    </div>
  </div>
  <dev-block
    :label="label || localElementName"
    :type-element="typeElement"
    :element-name="localElementName"
    :value="localCost"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :calculated-formula="localCostFormula"
    :dependency-formula-display="dependencyFormulaDisplay"
  />
</template>
