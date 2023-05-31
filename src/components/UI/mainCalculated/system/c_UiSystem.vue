<script setup>
import IconElementWrapper from "@/components/UI/supporting/c_icon-element-wrapper.vue";
import devBlock from "@/components/UI/devMode/c_devBlock.vue";
import {checkedValueOnVoid} from "@/servises/UtilityServices";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import {getBaseStoreGetters, getBaseStoreAction} from "@/composables/useBaseStore";

import {useLocalDependencyList} from "@/composables/useLocalDependencyList";
import {useProcessingFormula} from "@/composables/useProcessingFormula";
import {useGeneralItemData} from "@/composables/useGeneralItemData";
import {useUtilityServices} from "@/composables/useUtilityServices";
import {getProxyFreeVariables} from "@/composables/getProxyFreeVariables"
import {getCurrentWidthElement, getIsMakeElementColumn} from "@/composables/useWidthElement";


import {
  decimalAdjust,
  processingArrayOnFormulaProcessingLogic,
} from "@/servises/UtilityServices";
import {computed, onUnmounted, reactive, toRef, watch} from "vue";

const {devMode, getResultElementOnName, getNameReserveVariable} = getBaseStoreGetters()
const {tryDeleteAllDataOnStoreForElementName, tryAddDependencyElement, checkValidationDataAndToggle} = getBaseStoreAction(['tryDeleteAllDataOnStoreForElementName', 'tryAddDependencyElement', 'checkValidationDataAndToggle'])

const emits = defineEmits(['changedValue'])
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
})

const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {isVisibilityFromDependency, formulaAfterProcessingVariables, costAfterProcessingDependencyPrice} = useProcessingFormula(
    reactive({
      formula: toRef(props, 'dependencyFormulaDisplay'),
      parentIsShow: toRef(props, 'parentIsShow'),
      constructLocalListElementDependencyInFormula,
      localDependencyList: localDependencyList
    })
)
const {initProcessingDependencyPrice} = useGeneralItemData(toRef(props, 'parentIsShow'), toRef(props, 'dependencyPrices'), changeValue, changeValid, )
const {getArrayElementsFromFormula} = useUtilityServices()

const {currentWidthElement} = getCurrentWidthElement(props.parentIsShow)
const isExistLabel = computed(() => {
  return Boolean(props.label?.toString()?.length);
})

const {isMakeElementColumn} = getIsMakeElementColumn(currentWidthElement,isExistLabel)

const localElementName = computed(() => {
  return checkedValueOnVoid(props.elementName)
      ? props.elementName
      : "Math.random().toString()";
})

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
        dependencyArrayItems: toRef(props, 'dependencyPrices'),
        formulaFieldName:  "dependencyFormulaCost"
      })
  );

  if (formulaCost !== null) {
    return formulaCost;
  }

  return props.cost;
})

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

  let formulaCostArr = getArrayElementsFromFormula(
      localCostFormula.value
  );
  let formulaCost = formulaCostArr?.map((item) => {
    const isReserveVariable = item === getNameReserveVariable.value;
    const isGlobalVariable = getResultElementOnName.value(item) !== null;

    if (isReserveVariable) {
      return getProxyFreeVariables(0);
    } else if (isGlobalVariable) {
      return getResultElementOnName.value(item);
    } else {
      return item;
    }
  });
  return processingArrayOnFormulaProcessingLogic(formulaCost).join(" ");
})

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
})

const isExistLocalCost = computed(() => {
  return localCost.value !== null && props.showElement !== "notValue";
})
const isExistUnit = computed(() => {
  return Boolean(props.unit?.toString()?.length);
})
const onlyText = computed(() => {
  return props.showElement === "onlyText";
})

const allowProcessingDependencyHtmlText = computed(() => {
  return props.dependencyHtmlText?.length;
})
const currentHtmlText = computed(() => {
    if (!allowProcessingDependencyHtmlText.value) {
      return props.htmlText;
    }
    const { item } = costAfterProcessingDependencyPrice.value(
        props.dependencyHtmlText,
        "dependencyFormulaHtmlText"
    );
    const textIsExist = Boolean(item?.htmlText?.length);
    if (textIsExist) {
      return item.htmlText;
    }
    return props.htmlText;
  })
const isExistCurrentHtmlText = computed(() => {
    return Boolean(currentHtmlText.value?.toString()?.length);
  })
const isShowElement = computed(() => {
    return props.showElement !== "no";
  })
const allowProcessingDependencyPrices = computed(() => {
    return (
        initProcessingDependencyPrice.value && props.dependencyPrices?.length
    );
  })



watch(localCost,
    (newValue, oldValue) => {
          if (newValue !== oldValue) {
            changeValue();
          }
        },
    {deep:true}
)
watch(isVisibilityFromDependency, () => {
  changeValue("dependency");
})

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
    isShow: props.parentIsShow,
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
  checkValidationDataAndToggle({
    error: false,
    name: localElementName.value,
    type: "system",
    label: "",
    eventType,
    isShow: isVisibilityFromDependency.value,
    parentName: props.parentName,
  });
}
function tryPassDependency() {
  tryAddDependencyElement({
    name: localElementName.value,
    value: props.localCost,
    isShow: isVisibilityFromDependency.value,
    displayValue: props.localCost,
    type: "system",
  });
}

onUnmounted(() => {
  tryDeleteAllDataOnStoreForElementName.value(localElementName.value);
})


</script>

<template>
  <div
    class="calc__wrapper-group-data"
    ref="parent"
    v-if="isVisibilityFromDependency && isShowElement"
    :id="elementName"
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
    :label="label"
    :element-name="localElementName"
    :value="localCost"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :formula-variables="processingVariablesInFormula"
    :formula="localCostFormula"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>
