<script>
const typeElement = "UiRange";
</script>

<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
  reactive,
  toRef,
} from "vue";
import {useBaseStore} from "@/store/baseStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useValidationListStore} from "@/store/validationListStore";

import {storeToRefs} from "pinia";

import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import iconElementWrapper from "@/components/supporting/icon-element-wrapper.vue";
import DynamicInputValue from "@/components/UI/mainCalculated/UiRange/DynamicInputValue.vue";
import StepLine from "@/components/UI/mainCalculated/UiRange/StepLine.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { useEventListener } from "@/composables/useEventsListener";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useDisplaySpinner } from "@/composables/useDisplaySpinner";
import {
  getCurrentWidthElement,
  getIsMakeElementColumn,
} from "@/composables/useWidthElement";
import {
  checkedValueOnVoid,
  decimalAdjust, getArrayElementsFromFormula,
  getSignsAfterComma,
  roundingValueToInputNumber
} from "@/servises/UtilityServices";
import { useInitProcessingDependencyPrice } from "@/composables/useInitProcessingDependencyPrice";
import { useReportInitialStatusForElement } from "@/composables/useReportInitialStatusForElement";
import { useHighlightElement } from "@/composables/useHighlightElement";
import { useCheckedValueMinMax } from "@/components/UI/mainCalculated/UiRange/useCheckedValueMinMax";
import {useDisplayComponents} from "@/composables/useDisplayComponents";
import { useElementNameList } from "@/composables/useElementNameList";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import errorMessage from "@/servises/devErrorMessage";
import { getIsShowOutput } from "@/composables/getIsShowOutput";

const baseStore = useBaseStore()
const baseStoreRefs = storeToRefs(baseStore)
const { isCanShowAllTooltips, getSomeElementChangedSelfVisibilityState } = baseStoreRefs;
const dependencyStore = useDependencyListStore()
const validationStore = useValidationListStore()


const emits = defineEmits(["changedValue"]);
const props = defineProps({
  rangeValue: {
    type: [Number, String],
    default: 0,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   * размер шага в ползунке
   */
  step: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   * отобразить ленту с шагами под ползунком
   */
  showSteps: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * Шаг деления в ленте
   */
  stepPrompt: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   *     Отобразить текущее значение статичное
   */
  showStaticValue: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  /**
   * отобразить динамичное значение
   */
  showDynamicValue: {
    type: [Boolean, Number],
    default: false,
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
  },
  iconSettingsRangeLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "label",
    "notEmpty",
    "excludeFromCalculations",
    "elementName",
    "formOutputMethod",
    "resultOutputMethod",
    "parentName",
    "isNeedChoice",
    "isColumn",
    "formulaProcessingLogic",
    "templateName",
    "classes",
    "unit",
    "dependencyPrices",
    "cost",
    "min",
    "max",
    "dependencyFormulaDisplay",
    "parentIsShow",
    "positionElement",
    "zeroValueDisplayIgnore",
    "roundOffType",
    "signAfterDot",
    "dependencyFormulaOutput"
  ]),
});
const thisElementInputRangeRef = ref(null);
const staticRef = ref(null);
const parentRef = ref(null);
const isMounted = ref(false);

const inputRangeWidth = ref(0);
const resultValue = ref(null);
const textErrorNotEmpty = ref("Обязательное поле.");
const updateValueTimer = ref(null);
const canBeShownTooltip = ref(false);
const timerNameForLocalValue = ref(null);
const minimalWidthStaticElement = ref(15);
const staticElementWidth = ref(minimalWidthStaticElement.value);

const localMin = ref( checkedValueOnVoid(props.min) ? parseFloat(props.min) : 0)
const localMax = ref(checkedValueOnVoid(props.max) ? parseFloat(props.max) : 10)

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
    localDependencyList: localDependencyList,
    constructLocalListElementDependencyInFormula,
  })
);

const {isShowOutput} = getIsShowOutput(props.dependencyFormulaOutput, constructLocalListElementDependencyInFormula, localDependencyList)
const isIgnoredValueOnZero = computed(() => {
  return (props.zeroValueDisplayIgnore && !resultValueInOutput.value)
})


const { initProcessingDependencyPrice } = useInitProcessingDependencyPrice(
  toRef(props, "dependencyPrices")
);

const { currentWidthElement, updatedCurrentWidth } = getCurrentWidthElement(
  isVisibilityFromDependency,
  parentRef
);

useReportInitialStatusForElement(
  toRef(props, "parentIsShow"),
  changeValue,
  changeValid
);

const localLabel = computed(() => {
  return props.label
})

const isExistLabel = computed(() => {
  return Boolean(localLabel.value?.toString()?.length);
});
const { isMakeElementColumn } = getIsMakeElementColumn(
  currentWidthElement,
  isExistLabel
);

const localUnit = computed(() => {
  return props.unit
})

const { checkValidValueReturnNumber } = useCheckedValueMinMax(
  localMin,
  localMax
);

const localStep = computed(() => {
  return checkedValueOnVoid(props.step) ? parseFloat(props.step) : 1;
});

const localElementName = computed(() => {
  return checkedValueOnVoid(props.elementName)
    ? props.elementName
    : Math.random().toString();
});
const { isHighlightElement } = useHighlightElement(localElementName);
useDisplaySpinner(localElementName.value);
useDisplayComponents(localElementName.value, isVisibilityFromDependency, typeElement)
useElementNameList({name: localElementName.value, label: localLabel.value, position: props.positionElement})

const resultValueInOutput = computed(() => {
  return isVisibilityFromDependency.value ? resultValue.value : null
})

const isErrorEmpty = computed(() => {
  return props.notEmpty && resultValueInOutput.value === null;
});

const localCanBeShownTooltip = computed(() => {
  return canBeShownTooltip.value && isVisibilityFromDependency.value;
});

const isClassError = computed(() => {
  return (
    (localCanBeShownTooltip.value || isCanShowAllTooltips.value) &&
    isErrorEmpty.value
  );
});
/**
 * Возвращает цену подходящую условию, если поле отображается
 * Если не одна цена не подходит, то возвращается стандартная
 * @returns {Number|String|*}
 */ const localCost = computed(() => {
  if (!isVisibilityFromDependency.value) {
    return null;
  }

  if (!initProcessingDependencyPrice.value || !props.dependencyPrices) {
    return updatedCostForOut(props.cost);
  }

  let { cost: newCost } = costAfterProcessingDependencyPrice(
    reactive({
      dependencyArrayItems: toRef(props, "dependencyPrices"),
      formulaFieldName: "dependencyFormulaCost",
      templateName: "UiRange",
      value: resultValue.value,
    })
  );
  if (newCost !== null) {
    return updatedCostForOut(newCost);
  }
  return updatedCostForOut(props.cost);
});

const positionStaticResultValue = computed(() => {
  updateWidthElement();
  if (resultValue.value === null) {
    return null;
  }
  const width = inputRangeWidth.value - staticElementWidth.value / 2 - 10;

  let newPosition =
    (resultValue.value - localMin.value) / (localMax.value - localMin.value);

  if (newPosition < 0) {
    newPosition = 5;
  } else if (newPosition >= 1) {
    newPosition = width;
  } else {
    newPosition = width * newPosition - staticElementWidth.value / 10;
  }
  return newPosition + "px";
});

const isStaticValue = computed(() => {
  return (
    props.showStaticValue &&
    typeof resultValueInOutput.value === "number" &&
    isFinite(resultValueInOutput.value) &&
    positionStaticResultValue.value !== null
  );
});

const signAfterComa = computed(() => {
  return getSignsAfterComma(props.step)
})

/**
 * Обработка значений поступающих извне необходим с задержкой для отображения ошибок остальных компонентов
 * @param newValue
 */
watch(
  () => props.rangeValue,
  (newValue) => {
    clearTimeout(updateValueTimer.value);
    updateValueTimer.value = setTimeout(() => {
      resultValue.value = decimalAdjust(newValue, signAfterComa.value, 'round');
    }, 1500);
  }
);

watch([isVisibilityFromDependency, isShowOutput], (newValue) => {
  if (newValue) {
    setTimeout(() => {
      inputRangeWidth.value = thisElementInputRangeRef.value?.offsetWidth;
    }, 500);
  }
  changeValue("dependency");
});

watch(resultValueInOutput, () => {
  tryChangeValue('resultValue');
});
watch(localCost, () => {
  if (!isMounted.value) {
    changeValue('mounted');
  } else {
    changeValue('cost');
  }
});

watch(currentWidthElement, () => {
  updateWidthElement();
})

watch(getSomeElementChangedSelfVisibilityState, () => {
  updatedCurrentWidth();
  setTimeout(() => {
    updateWidthElement();
  }, 10);
});

function processingFinalValue(value) {
  value = checkValidValueReturnNumber(value)
  value = roundingValueToInputNumber(value,localStep.value)
  return decimalAdjust(value, signAfterComa.value, 'round')
}

function initBaseData(eventType = "mounted") {
  let timer = setInterval(() => {
    if (checkedValueOnVoid(props.rangeValue)) {
      resultValue.value = processingFinalValue(props.rangeValue)
      changeValue(eventType);
      clearInterval(timer);
    }
  }, 100);
  setTimeout(() => {
    clearInterval(timer);
  }, 10000);
}

function tryChangeValue(eventType) {
  clearTimeout(timerNameForLocalValue.value);
  resultValue.value = decimalAdjust(checkValidValueReturnNumber(resultValue), signAfterComa.value, 'round');
  updateStaticElementWidth();
  timerNameForLocalValue.value = setTimeout(() => {
    changeValue(eventType);
  }, 500);
}

function changeValue(eventType = "input") {
  updateWidthElement();
  emits("changedValue", {
    value: resultValueInOutput.value ,
    displayValue: resultValueInOutput.value,
    name: localElementName.value,
    type: "range",
    cost: localCost.value,
    label: localLabel.value,
    formOutputMethod:
      props.formOutputMethod !== "no" ? props.formOutputMethod : null,
    resultOutputMethod:
      props.resultOutputMethod !== "no" ? props.resultOutputMethod : null,
    excludeFromCalculations: props.excludeFromCalculations,
    isShow: isVisibilityFromDependency.value,
    isShowOutput: isShowOutput.value && isVisibilityFromDependency.value && !isIgnoredValueOnZero.value,
    unit: localUnit.value,
    eventType,
    formulaProcessingLogic: props.formulaProcessingLogic,
    position: props.positionElement,
  });
  tryPassDependency();
  changeValid(eventType);
  if (eventType !== "mounted") {
    shownTooltip();
  }
}

function changeValid(eventType) {
  validationStore.checkValidationDataAndToggle({
    error: isVisibilityFromDependency.value
      ? isErrorEmpty.value
      : isVisibilityFromDependency.value,
    name: localElementName.value,
    type: "range",
    label: localLabel.value,
    eventType,
    isShow: isVisibilityFromDependency.value,
    parentName: props.parentName,
  });
}

function tryPassDependency() {
  dependencyStore.addDependencyElement({
    name: localElementName.value,
    value: resultValueInOutput.value ,
    isShow: isVisibilityFromDependency.value,
    displayValue: resultValueInOutput.value,
    type: "range",
  });
}

function shownTooltip() {
  if (!canBeShownTooltip.value) {
    canBeShownTooltip.value = true;
  }
}

function updatedCostForOut(cost) {
  return checkedValueOnVoid(cost) ? decimalAdjust((cost * Math.abs(resultValue.value)), props.signAfterDot, props.roundOffType ): null;
}

function updateWidthElement() {
  if (inputRangeWidth.value !== thisElementInputRangeRef.value?.offsetWidth) {
    inputRangeWidth.value = thisElementInputRangeRef.value?.offsetWidth;
  }
}
function updateStaticElementWidth() {
  staticElementWidth.value = staticRef.value
    ? staticRef.value?.offsetWidth
    : minimalWidthStaticElement.value;
}

useEventListener(window, "resize", updateWidthElement);
useEventListener(document, "DOMContentLoaded", updateWidthElement);

onMounted(() => {
  if (!props.isNeedChoice) {
    initBaseData();
  } else {
    changeValue("mounted");
  }

  updateWidthElement();
  updateStaticElementWidth();

  let timerElementInputRange = setInterval(() => {
    if (thisElementInputRangeRef.value?.offsetWidth || inputRangeWidth.value) {
      updateWidthElement();
      clearInterval(timerElementInputRange);
    }
  }, 500);

  let timerStatic = setInterval(() => {
    if (staticRef.value?.offsetWidth) {
      updateStaticElementWidth();
      clearInterval(timerStatic);
    }
  }, 500);
  setTimeout(() => {
    isMounted.value = true
  }, 1000)
});

onUnmounted(() => {
  baseStore?.tryDeleteAllDataOnStoreForElementName(localElementName.value);
});
</script>

<template>
  <div
    ref="parentRef"
    class="calc__wrapper-group-data isRange"
    :class="{ 'is-highlight': isHighlightElement }"
    :id="localElementName"
    v-if="rangeValue !== null && isVisibilityFromDependency"
  >
    <div
      class="calc__range-wrapper"
      :class="[
        classes,
        { column: isColumn || isMakeElementColumn, static: isStaticValue },
      ]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsRangeLabel"
        :alt="isExistLabel ? localLabel : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__range-label-text" v-if="isExistLabel">
          {{ localLabel }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt"></slot>
        </div>
      </icon-element-wrapper>
      <div class="calc__range-item-wrapper">
        <div class="calc__range-item-left-side">
          <input
            ref="thisElementInputRangeRef"
            class="calc__range-item"
            :class="{ isError: isClassError }"
            type="range"
            :min="localMin"
            :max="localMax"
            :step="localStep"
            v-model.number="resultValue"
            :name="localElementName"
          />
          <step-line
            :step-prompt="stepPrompt"
            :show-steps="showSteps"
            :element-width="inputRangeWidth"
            :local-max="localMax"
            :local-min="localMin"
            v-model:modelValue="resultValue"
          />
          <div
            v-if="isStaticValue"
            :style="{ left: positionStaticResultValue }"
            ref="staticRef"
            class="calc__range-current-static"
          >
            {{ resultValue }}
          </div>
        </div>
        <dynamic-input-value
          :show-dynamic-value="showDynamicValue"
          :unit="localUnit.value"
          :min="localMin"
          :max="localMax"
          :is-error="isClassError"
          :step="step"
          v-model:dynamicValue="resultValue"
        />
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="localCanBeShownTooltip || isCanShowAllTooltips"
      />
    </div>
  </div>
  <dev-block
    :label="localLabel || localElementName"
    :type-element="typeElement"
    :element-name="localElementName"
    :value="isVisibilityFromDependency ? resultValue : null"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
  />
</template>
