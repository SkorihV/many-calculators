<script>
const typeElement = "UiCheckbox";
const textErrorNotEmpty = "Обязательное поле.";
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
import { useBaseStore } from "@/store/baseStore";
import {useDependencyListStore} from "@/store/dependencyListStore";
import {useValidationListStore} from "@/store/validationListStore";
import {useElementNameList} from "@/composables/useElementNameList";

import { storeToRefs } from "pinia";

import UiTooltip from "@/components/UI/other/UiTooltip.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import IconElementWrapper from "@/components/supporting/icon-element-wrapper.vue";

import { useDisplaySpinner } from "@/composables/useDisplaySpinner";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";

import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { checkedValueOnVoid } from "@/servises/UtilityServices";
import {
  getCurrentWidthElement,
  getIsMakeElementColumn,
} from "@/composables/useWidthElement";
import goScrollToElement from "@/composables/goScrollToElement";
import { useIsCheckedType } from "@/components/UI/mainCalculated/UiCheckbox/useIsCheckedType";

import { useInitProcessingDependencyPrice } from "@/composables/useInitProcessingDependencyPrice";
import { useReportInitialStatusForElement } from "@/composables/useReportInitialStatusForElement";
import { useHighlightElement } from "@/composables/useHighlightElement";
import { useDisplayComponents } from "@/composables/useDisplayComponents";
import { getIsShowOutput } from "@/composables/getIsShowOutput";

const emits = defineEmits(["changedValue"]);
const props = defineProps({
  /**
   *  альтернативный способ смены вида чекбокас - текстом
   *  default - base
   *  switcher - горизонтальный переключатель
   *  switcher-vertical - вертикальный переключатель
   *  button - кнопка
   */
  typeDisplayClass: {
    type: String,
    default: "base",
  },
  buttonText: {
    type: String,
    require: true,
  },
  buttonTextChecked: {
    type: String,
    require: true,
  },
  scrollIntoName: {
    type: String,
    default: null,
  },
  costForVoid: {
    type: [String, Number],
    default: null,
    validator(value) {
      return !isNaN(Number(value));
    },
  },
  iconSettingsCheckboxLabel: {
    type: Object,
    default: () => {},
  },
  ...propsTemplate.getProps([
    "formOutputMethod",
    "resultOutputMethod",
    "isNeedChoice",
    "dependencyPrices",
    "cost",
    "dependencyFormulaDisplay",
    "parentIsShow",
    "label",
    "excludeFromCalculations",
    "elementName",
    "parentName",
    "formulaProcessingLogic",
    "classes",
    "templateName",
    "positionElement",
    "isColumn",
    "zeroValueDisplayIgnore",
    "baseValue",
    "dependencyFormulaOutput"
  ]),
});

const currentLocalTextButton = ref("");
const isLocalChecked = ref(null);
const canBeShownTooltip = ref(false);
const isChecked = ref(false); // активирована
const notActive = ref(false); // невозможно активировать
const checkboxValue = ref(false); // начальное значение
const parentRef = ref(null);

const baseStore = useBaseStore()
const baseStoreRefs = storeToRefs(baseStore)
const dependencyStore = useDependencyListStore()
const validationStore = useValidationListStore()
const { isCanShowAllTooltips } = baseStoreRefs;

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();
const {
  isVisibilityFromDependency,
  costAfterProcessingDependencyPrice,
  formulaAfterProcessingVariables,
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
  let value = isVisibilityFromDependency.value ? isLocalChecked.value : null
  return (props.zeroValueDisplayIgnore && !value)
})

useReportInitialStatusForElement(
  toRef(props, "parentIsShow"),
  changeValue,
  changeValid
);

const { currentWidthElement } = getCurrentWidthElement(
  isVisibilityFromDependency,
  parentRef
);

const localLabel = computed(() => {
  return props.label
})

const isExistLabel = computed(() => {
  return Boolean(localLabel.value.toString()?.length);
});
const { isMakeElementColumn } = getIsMakeElementColumn(
  currentWidthElement,
  isExistLabel
);
const { initProcessingDependencyPrice } = useInitProcessingDependencyPrice(
  toRef(props, "dependencyPrices")
);
const { isBase, isButton, isSwitcher, isSwitcherVertical } = useIsCheckedType(
  props.typeDisplayClass
);

onMounted(() => {
  checkboxValue.value = props.baseValue === "active"
  isChecked.value = props.baseValue === "selected"
  notActive.value = props.baseValue === "notActive"

  if (!props.isNeedChoice) {
    isLocalChecked.value = Boolean(checkboxValue.value || isChecked.value);
  }
  if (isLocalChecked.value) {
    currentLocalTextButton.value = props.buttonTextChecked?.length
      ? props.buttonTextChecked
      : props.buttonText
  } else {
    currentLocalTextButton.value = props.buttonText;
  }
  changeValue("mounted");
});

const localElementName = computed(() => {
  return checkedValueOnVoid(props.elementName)
    ? props.elementName
    : Math.random().toString();
});

const { isHighlightElement } = useHighlightElement(localElementName);
useDisplayComponents(localElementName.value, isVisibilityFromDependency, typeElement)
useDisplaySpinner(localElementName.value);
useElementNameList({name: localElementName.value, label: props.label, position: props.positionElement})

const isErrorEmpty = computed(() => {
  return Boolean(props.isNeedChoice && !isLocalChecked.value);
});
const isErrorClass = computed(() => {
  return Boolean(
    isErrorEmpty.value &&
      isVisibilityFromDependency.value &&
      isCanShowAllTooltips.value
  );
});

/**
 * Возвращает цену подходящую условию, если моле отображается
 * Если не одна цена не подходит, то возвращается стандартная
 * @returns {Number|String|*}
 */
const localCost = computed(() => {
  if (!isVisibilityFromDependency.value) {
    return null;
  }
  if (!initProcessingDependencyPrice.value || !props.dependencyPrices) {
    return isLocalChecked.value && checkedValueOnVoid(props.cost)
      ? parseFloat(props.cost)
      : !isLocalChecked.value && checkedValueOnVoid(props.costForVoid)
      ? parseFloat(props.costForVoid)
      : null;
  }

  let { cost: newCost } = costAfterProcessingDependencyPrice(
    reactive({
      dependencyArrayItems: toRef(props, "dependencyPrices"),
      formulaFieldName: "dependencyFormulaCost",
    })
  );

  if (newCost !== null) {
    return newCost;
  }
  return isLocalChecked.value && checkedValueOnVoid(props.cost)
    ? parseFloat(props.cost)
    : !isLocalChecked.value && checkedValueOnVoid(props.costForVoid)
    ? parseFloat(props.costForVoid)
    : null;
});
watch(isShowOutput, () => {
  changeValue("dependency")
})

watch(isVisibilityFromDependency, (value) => {
  if (value) {
    isLocalChecked.value = !props.isNeedChoice
      ? Boolean(checkboxValue.value || isChecked.value)
      : null;
  } else {
    isLocalChecked.value = null;
  }
  changeValue("dependency")
});

watch(localCost, () => {
  changeValue("cost")
})
function inputLocalValue() {
  if (notActive.value) {
    return null;
  }
  if (!isChecked.value) {
    isLocalChecked.value = !isLocalChecked.value;
  }
  currentLocalTextButton.value =
    isLocalChecked.value && props.buttonTextChecked?.length
      ? props.buttonTextChecked
      : props.buttonText;
  changeValue("click")
}
function changeValue(eventType = "click") {
  emits("changedValue", {
    value: isVisibilityFromDependency.value ? isLocalChecked.value : null,
    displayValue: isLocalChecked.value ? "Да" : "Нет",
    name: localElementName.value,
    type: "UiCheckbox",
    label: localLabel.value || props.buttonText,
    cost: localCost.value,
    formOutputMethod:
      props.formOutputMethod !== "no" ? props.formOutputMethod : null,
    resultOutputMethod:
      props.resultOutputMethod !== "no" ? props.resultOutputMethod : null,
    excludeFromCalculations: props.excludeFromCalculations,
    isShow: isVisibilityFromDependency.value,
    isShowOutput: isShowOutput.value && isVisibilityFromDependency.value && !isIgnoredValueOnZero.value,
    eventType,
    formulaProcessingLogic: props.formulaProcessingLogic,
    position: props.positionElement,
  });
  tryPassDependency()
  changeValid(eventType)
  if (isLocalChecked.value && props.scrollIntoName) {
    goScrollToElement(props.scrollIntoName)
  }
}
function changeValid(eventType) {
  validationStore.checkValidationDataAndToggle({
    error: isVisibilityFromDependency.value
      ? isErrorEmpty.value
      : isVisibilityFromDependency.value,
    name: localElementName.value,
    type: "UiCheckbox",
    label: localLabel.value,
    eventType,
    isShow: isVisibilityFromDependency.value,
    parentName: props.parentName,
  });
  if (eventType !== "mounted") {
    canBeShownTooltip.value = true
  }
}
function tryPassDependency() {
  dependencyStore.addDependencyElement({
    name: localElementName.value,
    value: isVisibilityFromDependency.value ? isLocalChecked.value : null,
    isShow: isVisibilityFromDependency.value,
    displayValue: currentLocalTextButton.value,
    type: "UiCheckbox",
  });
}

onUnmounted(() => {
    baseStore?.tryDeleteAllDataOnStoreForElementName(localElementName.value)
});
</script>

<template>
  <div
    class="calc__wrapper-group-data"
    :class="{ 'is-highlight': isHighlightElement }"
    v-if="isVisibilityFromDependency"
    :id="elementName"
    ref="parentRef"
  >
    <div
      class="calc__checkbox-wrapper"
      :class="[classes, { column: isColumn || isMakeElementColumn }]"
    >
      <icon-element-wrapper
        :icon-settings="iconSettingsCheckboxLabel"
        :alt="isExistLabel ? localLabel : ''"
        :isExistLabel="isExistLabel"
      >
        <div class="calc__checkbox-label-text" v-if="isExistLabel">
          {{ localLabel }}
          <div class="empty-block" v-if="isNeedChoice">*</div>
          <slot name="prompt" v-if="isExistLabel"></slot>
        </div>
      </icon-element-wrapper>
      <div @click="inputLocalValue" class="calc__checkbox-control-wrapper">
        <div
          class="calc__checkbox-control-button"
          v-if="isButton"
          :class="{
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          {{ currentLocalTextButton }}
          <slot name="prompt"></slot>
        </div>
        <div
          class="calc__checkbox-control-base"
          v-if="isBase || isSwitcher || isSwitcherVertical"
          :class="{
            switcher: isSwitcher || isSwitcherVertical,
            checked: isLocalChecked,
            error: isErrorClass,
          }"
        >
          <div class="calc__checkbox-control-text">
            <template v-if="isSwitcher || isSwitcherVertical">
              {{ buttonText }}
            </template>
            <template v-if="isBase">
              {{ currentLocalTextButton }}
            </template>
            <div class="empty-block" v-if="!isExistLabel && isNeedChoice">
              *
            </div>
            <slot name="prompt" v-if="!isExistLabel"></slot>
          </div>
          <div
            class="calc__checkbox-control-element"
            :class="{
              base: isBase,
              switcher: isSwitcher || isSwitcherVertical,
              'switcher-vertical': isSwitcherVertical,
              checked: isLocalChecked,
              error: isErrorClass,
            }"
          ></div>
          <div
            class="calc__checkbox-control-text_checked"
            v-if="
              (isSwitcher || isSwitcherVertical) && buttonTextChecked?.length
            "
          >
            {{ buttonTextChecked }}
          </div>
        </div>
        <ui-tooltip
          :is-show="isErrorEmpty"
          :tooltip-text="textErrorNotEmpty"
          :local-can-be-shown="isVisibilityFromDependency && canBeShownTooltip"
        />
      </div>
    </div>
  </div>
  <dev-block
    :label="localLabel || localElementName"
    :type-element="typeElement"
    :element-name="localElementName"
    :value="isLocalChecked"
    :local-cost="localCost"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
  />
</template>
