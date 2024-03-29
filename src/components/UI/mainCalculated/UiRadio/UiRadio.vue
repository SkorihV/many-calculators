<script>
const typeElement = "UiRadio";
</script>

<script setup>
import {
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRef,
  watch,
  computed,
} from "vue";
import {useBaseStore } from "@/store/baseStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useValidationListStore} from "@/store/validationListStore";
import { storeToRefs } from "pinia";

import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import IconElementWrapper from "@/components/supporting/icon-element-wrapper.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { checkedValueOnVoid } from "@/servises/UtilityServices";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useReportInitialStatusForElement } from "@/composables/useReportInitialStatusForElement";
import {
  getCurrentWidthElement,
  getIsMakeElementColumn,
} from "@/composables/useWidthElement";

import { useDisplaySpinner } from "@/composables/useDisplaySpinner";

import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import { getArrayElementsFromFormula } from "@/servises/UtilityServices";
import { useHighlightElement } from "@/composables/useHighlightElement";
import {useDisplayComponents} from "@/composables/useDisplayComponents";
import { useElementNameList } from "@/composables/useElementNameList";
import errorMessage from "@/servises/devErrorMessage";
import { getIsShowOutput } from "@/composables/getIsShowOutput";
import { NAME_CURRENT_VARIABLE } from "@/constants/variables";


const emits = defineEmits(["changedValue"]);
const props = defineProps({
  radioValues: {
    type: Array,
    default: () => [],
  },
  /**
   * номер предвыборной кнопки
   */
  selectedItem: {
    type: [Number, String],
    default: 1,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  /**
   *  способ отображения - указать текстом
   *  default - base
   *  1) buttons
   *  2) onlyImage
   *  3) column
   */
  typeDisplayClass: {
    type: String,
    default: "base",
  },
  iconSettingsRadioLabel: {
    type: Object,
    default: () => {},
  },
  notReset: {
    type: [Boolean, Number],
    validator(value) {
      return value === false || value === true || value === 0 || value === 1;
    },
    default: false,
  },
  ...propsTemplate.getProps([
    "isColumn",
    "isNeedChoice",
    "formOutputMethod",
    "resultOutputMethod",
    "dependencyFormulaDisplay",
    "parentIsShow",
    "label",
    "notEmpty",
    "excludeFromCalculations",
    "elementName",
    "parentName",
    "formulaProcessingLogic",
    "classes",
    "templateName",
    "positionElement",
    "zeroValueDisplayIgnore",
    "isStretch",
    "globalMaxWidth",
    "globalMaxHeight",
    "options",
    "dependencyFormulaOutput"
  ]),
});

const currentIndexRadioButton = ref(null);
const textErrorNotEmpty = ref("Обязательное поле.");

const bufferRadioListOnOut = ref([]);
const originRadioList = ref([]);
const canBeShownTooltip = ref(false);
const hoverElementIndex = ref(null);
const parentRef = ref(null);

const baseStore = useBaseStore()
const baseStoreRefs = storeToRefs(baseStore)
const { isCanShowAllTooltips } = baseStoreRefs;
const dependencyStore = useDependencyListStore()
const validationStore = useValidationListStore()

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();
const {
  formulaAfterProcessingVariables,
  isVisibilityFromDependency,
  costAfterProcessingDependencyPrice,
} = useProcessingFormula(
  reactive({
    localDependencyList: localDependencyList,
    constructLocalListElementDependencyInFormula,
    formula: toRef(props, "dependencyFormulaDisplay"),
    parentIsShow: toRef(props, "parentIsShow"),
  })
);
const {isShowOutput} = getIsShowOutput(props.dependencyFormulaOutput, constructLocalListElementDependencyInFormula, localDependencyList)
const isIgnoredValueOnZero = computed(() => {
  return (props.zeroValueDisplayIgnore && !selectedValueInRadio.value)
})

const { currentWidthElement } = getCurrentWidthElement(
  isVisibilityFromDependency,
  parentRef
);

useReportInitialStatusForElement(
  toRef(props, "parentIsShow"),
  changeValue,
  changeValid
);

const localElementName = computed(()=> {
  return checkedValueOnVoid(props.elementName)
      ? props.elementName
      : Math.random().toString();
})
const { isHighlightElement } = useHighlightElement(localElementName);
useDisplayComponents(localElementName.value, isVisibilityFromDependency, typeElement)
useDisplaySpinner(localElementName.value);
useElementNameList({name: localElementName.value, label: props.label, position: props.positionElement})

onMounted(() => {
  originRadioList.value = JSON.parse(JSON.stringify(props.radioValues)).map(
    (item, index) => {
      item.index = index + 1;
      return item;
    }
  );

  if (!props.isNeedChoice && isVisibilityFromDependency.value) {
    currentIndexRadioButton.value = parseInt(props.selectedItem);
  }

  setTimeout(() => {
    changeValue("mounted");
  }, 100);
});

onUnmounted(() => {
  baseStore?.tryDeleteAllDataOnStoreForElementName(localElementName.value);
});

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

const currentSelectedRadioButton = computed(() => {
  return currentIndexRadioButton.value === null
    ? null
    : getRadioItemForIndex(currentIndexRadioButton.value);
});

const isRadioItemSelected = computed(() => {
  return currentSelectedRadioButton.value !== null;
});

const isBase = computed(() => {
  return props.typeDisplayClass === "base";
});

const onlyImage = computed(() => {
  return props.typeDisplayClass === "onlyImage";
});

const isColumnType = computed(() => {
  return props.typeDisplayClass === "column";
});

const isErrorEmpty = computed(() => {
  return props.notEmpty && !isRadioItemSelected.value;
});

const isErrorClass = computed(() => {
  return (
    isCanShowAllTooltips.value &&
    isErrorEmpty.value &&
    isVisibilityFromDependency.value
  );
});

const localCost = computed(() => {
  let cost = parseFloat(currentSelectedRadioButton.value?.cost)
  return isRadioItemSelected.value && !isNaN(cost)
    ? cost
    : null;
});

const selectedValueInRadio = computed(() => {
  if (!isRadioItemSelected.value || !isVisibilityFromDependency.value) {
    return null;
  }
  const isExistExtraValue = Boolean(
    currentSelectedRadioButton.value?.extraValueForDependency?.toString()
      ?.length
  );
  return isExistExtraValue
    ? currentSelectedRadioButton.value?.extraValueForDependency
    : currentIndexRadioButton.value;
});

const valueForDisplayRadioElement = computed(() => {
  if (!isRadioItemSelected.value || !isVisibilityFromDependency.value) {
    return null
  }
  return currentSelectedRadioButton.value?.radioName

});

const radioListAfterCheckDependency = computed(() => {
  return originRadioList.value?.map((radioItem) => {
    if (radioItem?.dependencyFormulaItem?.length) {

      const extraValueIsExist = Boolean(
        radioItem?.extraValueForDependency?.toString()?.length
      );


      let formula = getArrayElementsFromFormula(radioItem.dependencyFormulaItem);
      constructLocalListElementDependencyInFormula(formula);

      formula = formula.map((item) => {
        if (item.toLowerCase() === NAME_CURRENT_VARIABLE && extraValueIsExist) {
          return '"' + radioItem?.extraValueForDependency + '"';
        } else if (item.toLowerCase() === NAME_CURRENT_VARIABLE && !extraValueIsExist) {
          return radioItem.index
        }
        return item
      });

      formula = processingVariablesOnFormula(formula, localDependencyList);
      try {
        radioItem.isShow = eval(formula);
      } catch (e) {
        errorMessage([e.message, formula], "error")
        radioItem.isShow = false;
      }
    } else {
      radioItem.isShow = true;
    }
    return radioItem;
  });
});

const amountVisibleItemsCurrentRadioList = computed(() => {
  return bufferRadioListOnOut.value?.filter((item) => item?.isShow);
});

const amountVisibleItemsRadioListAfterCheckDependency = computed(() => {
  return radioListAfterCheckDependency.value?.filter((item) => item.isShow);
});

const isAmountVisibleItemsRadioListChanged = computed(() => {
  return (
    amountVisibleItemsCurrentRadioList.value !==
    amountVisibleItemsRadioListAfterCheckDependency.value
  );
});

const radioListAfterCheckVisibility = computed(() => {
  if (isAmountVisibleItemsRadioListChanged.value) {
    bufferRadioListOnOut.value = JSON.parse(JSON.stringify(radioListAfterCheckDependency.value))
  }
  return bufferRadioListOnOut.value.filter((item) => item.isShow);
});

const radioListAfterCheckedCostElements = computed(() => {
  return radioListAfterCheckVisibility.value?.map((item, index) => {
    if (item?.dependencyPrices?.length) {
      let { cost: newCost } = costAfterProcessingDependencyPrice(
        reactive({
          dependencyArrayItems: item?.dependencyPrices,
          formulaFieldName: "dependencyFormulaCost",
        })
      );
      if (newCost !== null) {
        item.cost = newCost;
      }
    }

    item.cost = item?.cost ? item?.cost : null;
    return item;
  });
});

const radioListOnOut = computed(() => {
  return radioListAfterCheckedCostElements.value;
});

watch(
  () => currentSelectedRadioButton.value,
  (newValue, oldValue) => {
    if (newValue?.index !== oldValue?.index) {
      setTimeout(() => {
        changeValue("currentSelectedRadioButton");
      }, 10);
    }
  },
  { deep: true }
);

watch(localCost, () => {
  setTimeout(() => {
    changeValue("currentSelectedRadioButton");
  }, 10);
});

watch(
  [isVisibilityFromDependency, isShowOutput],
  (newValue) => {
    if (newValue) {
      if (!props.isNeedChoice) {
        currentIndexRadioButton.value = parseInt(props.selectedItem);
      }
    } else {
      currentIndexRadioButton.value = null;
    }
    changeValue("dependency");
  },
  { deep: true }
);

watch(
  isAmountVisibleItemsRadioListChanged,
  (newValue) => {
    if (isVisibilityFromDependency.value && newValue) {
      if (
        currentIndexRadioButton.value !== null &&
        !isShowRadioItemOnIndex(currentIndexRadioButton.value)
      ) {
        if (!props.isNeedChoice) {
          currentIndexRadioButton.value = parseInt(props.selectedItem);
        } else {
          currentIndexRadioButton.value = null;
        }
      }
    }
  },
  { deep: true }
);

function getRadioItemForIndex(index) {
  if (isShowRadioItemOnIndex(index)) {
    return radioListOnOut.value?.filter(
      (item) => item.isShow && item.index === index
    )[0];
  }
  return null;
}

function isShowRadioItemOnIndex(index) {
  return Boolean(
    radioListOnOut.value?.filter((item) => item.isShow && item.index === index)
      ?.length
  );
}

function selectedCurrentRadio(index) {
  if (!props.notReset && currentIndexRadioButton.value === index) {
    currentIndexRadioButton.value = null;
  } else {
    currentIndexRadioButton.value = index;
  }
  changeValue();
}

function changeValue(eventType = "click") {
  emits("changedValue", {
    value: selectedValueInRadio.value,
    displayValue: valueForDisplayRadioElement.value,
    name: localElementName.value,
    type: "radio",
    cost: localCost.value,
    label: localLabel.value,
    formOutputMethod:
      props.formOutputMethod !== "no" ? props.formOutputMethod : null,
    resultOutputMethod:
      props.resultOutputMethod !== "no" ? props.resultOutputMethod : null,
    excludeFromCalculations: props.excludeFromCalculations,
    isShow: isVisibilityFromDependency.value,
    isShowOutput: isShowOutput.value && isVisibilityFromDependency.value && !isIgnoredValueOnZero.value,
    eventType,
    unit: "",
    formulaProcessingLogic: props.formulaProcessingLogic,
    mode: props.mode,
    position: props.positionElement,
  });
  tryPassDependency();
  changeValid(eventType);
}

function changeValid(eventType) {
  validationStore.checkValidationDataAndToggle({
    error: isVisibilityFromDependency.value
      ? isErrorEmpty.value
      : isVisibilityFromDependency.value,
    name: localElementName.value,
    type: "radio",
    label: props.label,
    eventType,
    isShow: isVisibilityFromDependency.value,
    parentName: props.parentName,
  });
  if (eventType !== "mounted") {
    canBeShownTooltip.value = true;
  }
}

function tryPassDependency() {
  dependencyStore.addDependencyElement({
    name: localElementName.value,
    value: selectedValueInRadio.value,
    isShow: isVisibilityFromDependency.value,
    displayValue: valueForDisplayRadioElement.value,
    type: "radio",
  });
}
</script>

<template>
  <div
    class="calc__wrapper-group-data"
    :class="{ 'is-highlight': isHighlightElement }"
    v-if="isVisibilityFromDependency"
    :id="localElementName"
    ref="parentRef"
  >
    <div
      class="calc__radio-wrapper"
      :class="[
        {
          column: isColumn || isMakeElementColumn,
          onlyImage: onlyImage,
          base: isBase,
        },
        classes,
      ]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsRadioLabel"
        :alt="isExistLabel ? localLabel : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__radio-label-text" v-if="isExistLabel">
          {{ localLabel }}
          <div class="empty-block" v-if="notEmpty">*</div>
          <slot name="prompt" />
        </div>
      </icon-element-wrapper>
      <div class="calc__radio-wrapper-buttons">
        <template v-for="radio in radioListOnOut" :key="radio.index">
          <div
            class="calc__radio-label-button"
            :id="localElementName + '_' + radio.index"
            :class="{
              checked: currentIndexRadioButton === radio.index,
              error: isErrorClass,
              onlyImage: onlyImage,
              isShowPrompt: Boolean(radio?.prompt?.length),
              stretch: isStretch,
            }"
            @click="selectedCurrentRadio(radio.index)"
            @mouseover="hoverElementIndex = radio.index"
            @mouseleave="hoverElementIndex = null"
          >
            <icon-element-wrapper
              :alt="radio?.radioName"
              :icon-settings="radio?.iconSettingsRadioItem"
              :global-max-width="globalMaxWidth"
              :global-max-height="globalMaxHeight"
              :is-parent-hover="hoverElementIndex === radio.index"
              :is-parent-selected="currentIndexRadioButton === radio.index"
              :is-column="isColumnType"
              :is-exist-label="Boolean(radio.radioName?.toString()?.length)"
            >
              <div class="calc__radio-text-wrapper" v-if="!onlyImage">
                <span class="calc__radio-indicator" v-if="isBase"></span>
                <div class="calc__radio-text">
                  <div class="calc__radio-name">
                    {{ radio.radioName }}
                  </div>
                  <div class="calc__radio-subname">
                    {{ radio?.subradioName }}
                  </div>
                </div>
              </div>
            </icon-element-wrapper>
            <ui-prompt :prompt-text="radio.prompt" :options="options"/>
          </div>
        </template>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
      />
    </div>
  </div>
  <dev-block
    :label="localLabel || localElementName"
    :type-element="typeElement"
    :element-name="localElementName"
    :value="selectedValueInRadio"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
  />
</template>
