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

import IconElementWrapper from "@/components/supporting/icon-element-wrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { checkedValueOnVoid, deleteTagsInText, replaceCommaOnDot } from "@/servises/UtilityServices";
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
import { useElementNameList } from "@/composables/useElementNameList";
import { updateTextOnVariables } from "@/servises/UpdateTextOnVariables";
import { isBoolean } from "@/validators/validators";
import errorMessage from "@/servises/devErrorMessage";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import { getIsShowOutput } from "@/composables/getIsShowOutput";

const baseStore = useBaseStore()
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
  returnTextValue: {
    type: [Boolean, Number],
    default: false,
    validator: isBoolean
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
    "classes",
    "htmlText",
    "unit",
    "roundOffType",
    "signAfterDot",
    "dependencyFormulaOutput"
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

const {isShowOutput} = getIsShowOutput(props.dependencyFormulaOutput, constructLocalListElementDependencyInFormula, localDependencyList)

const isIgnoredValueOnZero = computed(() => {
  return (props.zeroValueDisplayIgnore && !localCost.value)
})

useReportInitialStatusForElement(
  toRef(props, "parentIsShow"),
  changeValue,
  changeValid
);
const { initProcessingDependencyPrice } = useInitProcessingDependencyPrice(
  toRef(props, "dependencyPrices")
);

const { currentWidthElement } = getCurrentWidthElement(
  isVisibilityFromDependency,
  parentRef
);
const localLabel = computed(() => {
  return props?.label
})

const isExistLabel = computed(() => {
  return Boolean(localLabel.value?.toString()?.length);
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

const { isHighlightElement } = useHighlightElement(localElementName)
useDisplaySpinner(localElementName.value)
useDisplayComponents(localElementName.value, isVisibilityFromDependency, typeElement)
useElementNameList({name: localElementName.value, label: localLabel.value, position: props.positionElement})
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

  return props.cost
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
    return null
  }

  let cost = replaceCommaOnDot(localCostFormula.value);

  if (!isNaN(cost) && typeof cost === "number") {
    return cost
  }

  let formulaCostArr = getArrayElementsFromFormula(localCostFormula.value);
  let formulaCost = formulaCostArr?.map((item) => {
    const isReserveVariable = item === NAME_RESERVED_VARIABLE_SUM;
    const isGlobalVariable = getResultElementByName.value(item) !== null;

    if (isReserveVariable) {
      return getProxyFreeVariables(0)
    } else if (isGlobalVariable) {
      return getResultElementByName.value(item)
    } else {
      return item
    }
  });
  return processingArrayOnFormulaProcessingLogic(formulaCost).join(" ")
});

/**
 *
 * @returns {number|null|any}
 */
const localCost = computed(() => {
  if (!isVisibilityFromDependency.value) {
    return null
  }

  if (props?.returnTextValue) {
    return deleteTagsInText(currentHtmlText.value)
  }

  if (processingVariablesInFormula.value === null) {
    return null
  }

  try {
    const resultNumber = eval(processingVariablesInFormula.value);
    if (!isNaN(resultNumber) && isFinite(resultNumber)) {
      return decimalAdjust(
        resultNumber,
        props.signAfterDot,
        props.roundOffType
      )
    } else {
      return null
    }
  } catch (e) {
    errorMessage(["Системное поле, обработка формулы стоимости: ", processingVariablesInFormula.value], 'error')
  }
});

const localCostForHtml = computed(() => {
  if (isExistLocalCost.value) {
    return localCost.value?.toLocaleString("ru-RU", {
      useGrouping: true,
    })
  } else {
    return localCost.value
  }
})

const isExistLocalCost = computed(() => {
  return localCost.value !== null && props.showElement !== "notValue";
});

const localUnit = computed(() => {
  return props.unit
})

const isExistUnit = computed(() => {
  return Boolean(localUnit.value?.toString()?.length);
});
const onlyText = computed(() => {
  return props.showElement === "onlyText"
});

const allowProcessingDependencyHtmlText = computed(() => {
  return props.dependencyHtmlText?.length
});

const currentHtmlText = computed(() => {
  if (!allowProcessingDependencyHtmlText.value) {
    return updateTextOnVariables(props.htmlText )
  }
  const { item } = costAfterProcessingDependencyPrice(
    reactive({
        dependencyArrayItems: toRef(props, "dependencyHtmlText"),
        formulaFieldName: "dependencyFormulaHtmlText"
      }
    ))

  const textIsExist = Boolean(item?.htmlText?.length)
  if (textIsExist) {
    return updateTextOnVariables(item.htmlText)
  }
  return updateTextOnVariables(props.htmlText)
})

const isExistCurrentHtmlText = computed(() => {
  return Boolean(currentHtmlText.value?.toString()?.length)
})

const isShowElement = computed(() => {
  return props.showElement !== "no"
})

const allowProcessingDependencyPrices = computed(() => {
  return initProcessingDependencyPrice.value && props.dependencyPrices?.length
})

watch(
  localCost,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      changeValue('costSystem')
    }
  },
  { deep: true }
);

watch([isVisibilityFromDependency, isShowOutput], () => {
  changeValue("dependency")
});

function changeValue(eventType = "system") {
  emits("changedValue", {
    value: localCost.value,
    displayValue: localCost.value,
    name: localElementName.value,
    type: "system",
    cost: localCost.value,
    label: localLabel.value,
    formOutputMethod: props.formOutputMethod,
    resultOutputMethod: props.resultOutputMethod,
    isShow: isVisibilityFromDependency.value,
    isShowOutput: isShowOutput.value && isVisibilityFromDependency.value && !isIgnoredValueOnZero.value,
    excludeFromCalculations: props.excludeFromCalculations || props.returnTextValue,
    unit: localUnit.value,
    eventType,
    formulaProcessingLogic: props.formulaProcessingLogic,
    position: props.positionElement,
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
    value: localCost.value,
    isShow: isVisibilityFromDependency.value && isShowElement.value,
    displayValue: localCost.value,
    type: "system",
  });
}

onMounted(() => {
  changeValue("mounted");
});

onUnmounted(() => {
  baseStore?.tryDeleteAllDataOnStoreForElementName(localElementName.value);
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
    <div class="calc__system-wrapper" :class="[classes, { column: isMakeElementColumn }]">
      <div class="calc__system-label-wrapper" v-if="!onlyText">
        <icon-element-wrapper
          :icon-settings="iconSettingsSystemLabel"
          :alt="isExistLabel ? localLabel : ''"
          :isExistLabel="isExistLabel"
        >
          <div class="calc__system-label-text" v-if="isExistLabel">
            {{ localLabel }}
            <slot name="prompt" />
          </div>
        </icon-element-wrapper>
        <div class="calc__system-data-wrapper" v-if="isExistLocalCost">
          <div class="calc__system-data-value">{{ localCostForHtml }}</div>
          <div class="calc__system-data-unit" v-if="isExistUnit">
            {{ localUnit }}
          </div>
        </div>
      </div>
      <div class="calc__system-content" v-if="isExistCurrentHtmlText">
        <div v-html="currentHtmlText"></div>
      </div>
    </div>
  </div>
  <dev-block
    :label="localLabel || localElementName"
    :type-element="typeElement"
    :element-name="localElementName"
    :value="localCost"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :calculated-formula="localCostFormula"
    :dependency-formula-display="dependencyFormulaDisplay"
  />
</template>
